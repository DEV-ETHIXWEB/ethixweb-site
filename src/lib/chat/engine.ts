import type { InitProgressReport, MLCEngineInterface } from "@mlc-ai/web-llm";

/** Loads and holds the in-browser model.
 *
 * Everything here is lazy on purpose. WebLLM plus its WASM runtime is a large
 * chunk, and the weights are hundreds of megabytes, so neither is touched
 * until a visitor actually asks a question. The engine is cached per model id
 * for the lifetime of the tab; the weights are cached by the browser across
 * visits, which is why the second load takes seconds instead of minutes. */

export type LoadProgress = {
  text: string;
  /** 0..1, or undefined for the stages WebLLM cannot measure. */
  progress?: number;
};

type Loaded = { modelId: string; engine: MLCEngineInterface };

let loaded: Loaded | null = null;
let loading: Promise<MLCEngineInterface> | null = null;
let loadingModelId: string | null = null;

/** Did the browser bring a GPU we can compile shaders on? Safari before 18
 * and Firefox without the flag answer no, and that is the one failure mode we
 * cannot work around - hence reader mode in the UI. */
export async function hasWebGPU(): Promise<boolean> {
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown> } }).gpu;
  if (!gpu) return false;
  try {
    return (await gpu.requestAdapter()) !== null;
  } catch {
    return false;
  }
}

export async function getEngine(
  modelId: string,
  onProgress?: (p: LoadProgress) => void,
): Promise<MLCEngineInterface> {
  if (loaded?.modelId === modelId) return loaded.engine;
  // A switch mid-session: let the old engine go before allocating the new one,
  // or two sets of weights sit in VRAM and the second load fails on 4GB cards.
  if (loaded && loaded.modelId !== modelId) {
    const stale = loaded;
    loaded = null;
    await stale.engine.unload().catch(() => {});
  }
  if (loading && loadingModelId === modelId) return loading;

  loadingModelId = modelId;
  loading = (async () => {
    // Browser only, and said so statically: Vite replaces import.meta.env.SSR
    // with a literal, so this throw makes the import below unreachable in the
    // SSR pass and keeps 6.8MB of WebGPU runtime out of the serverless
    // function, where there is no GPU to run it on.
    if (import.meta.env.SSR) throw new Error("The model loads in the browser only.");
    const webllm = await import("@mlc-ai/web-llm");
    const initProgressCallback = (report: InitProgressReport) => {
      onProgress?.({ text: report.text, progress: report.progress });
    };

    let engine: MLCEngineInterface;
    try {
      const worker = new Worker(new URL("./chat-worker.ts", import.meta.url), { type: "module" });
      engine = await webllm.CreateWebWorkerMLCEngine(worker, modelId, { initProgressCallback });
    } catch {
      // Module workers are blocked by some embedded webviews. A main-thread
      // engine janks during generation but still answers, which beats nothing.
      engine = await webllm.CreateMLCEngine(modelId, { initProgressCallback });
    }

    loaded = { modelId, engine };
    return engine;
  })();

  try {
    return await loading;
  } finally {
    loading = null;
    loadingModelId = null;
  }
}

export function loadedModelId(): string | null {
  return loaded?.modelId ?? null;
}

/** Qwen3-class models emit a <think> block before the answer. We ask for it to
 * be off, but when a build ignores that flag the block must not reach the UI. */
export function stripThinking(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .replace(/^[\s\S]*?<\/think>/, "")
    .trimStart();
}

export type StreamOptions = {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  onToken: (full: string) => void;
  signal?: AbortSignal;
};

/** Streams one reply. Resolves with the finished text. */
export async function streamReply(
  engine: MLCEngineInterface,
  { messages, onToken, signal }: StreamOptions,
): Promise<string> {
  // Every request starts from a clean slate. WebLLM reuses its KV cache when a
  // new request looks like a continuation of the last one, and a history we
  // have edited (dash cleanup, curated replies the model never wrote) breaks
  // that assumption: in testing, four questions in a row came back empty
  // until the cache happened to realign. The panel sends one self contained
  // request per question instead, so there is nothing to continue.
  await engine.resetChat();
  const stream = await engine.chat.completions.create({
    messages,
    stream: true,
    // Factual and short, by construction rather than by request. Asked to
    // keep to four sentences, the 1.5B model wrote ten paragraphs comparing
    // WebGPU and WebGL and invented shader language support its own source
    // contradicted. A low temperature keeps it on the source's wording, and
    // the token cap makes a rambling answer impossible rather than unlikely.
    temperature: 0.1,
    top_p: 0.9,
    max_tokens: 220,
    // Qwen3 / Qwen3.5 only. Ignored by the Llama and Qwen2.5 builds.
    extra_body: { enable_thinking: false },
  });

  let full = "";
  for await (const chunk of stream) {
    if (signal?.aborted) {
      await engine.interruptGenerate();
      break;
    }
    const delta = chunk.choices[0]?.delta?.content;
    if (!delta) continue;
    full += delta;
    onToken(stripThinking(full));
  }
  return stripThinking(full).trim();
}
