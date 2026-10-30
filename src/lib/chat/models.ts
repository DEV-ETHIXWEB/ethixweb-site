/** The open-weight models the knowledge chat can run.
 *
 * Every one of these runs *in the visitor's browser* on WebGPU - there is no
 * API key, no server inference bill and no prompt leaving the device except
 * the Wikipedia lookups in lib/chat/wiki.ts. The weights are fetched once from
 * the public MLC model CDN and then live in the browser's Cache Storage, so a
 * second visit starts instantly and works offline.
 *
 * `vramMB` is the figure the WebLLM runtime itself reports for the model
 * (prebuiltAppConfig.vram_required_MB) - it is both the rough download size
 * and the GPU memory the tab needs, which is why a 3B model is a real choice
 * rather than an obvious default. Keep the list short: each extra option is
 * another multi-hundred-megabyte decision we are asking a visitor to make. */
export type ChatModel = {
  /** MLC model id - must exist in webllm.prebuiltAppConfig.model_list. */
  id: string;
  label: string;
  /** Human-facing size, derived from vramMB so the two never drift. */
  vramMB: number;
  blurb: string;
};

export const CHAT_MODELS: ChatModel[] = [
  {
    id: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    label: "Llama 3.2 1B",
    vramMB: 879,
    blurb: "Lightest. Works on older laptops and most phones with WebGPU.",
  },
  {
    id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    label: "Qwen2.5 1.5B",
    vramMB: 1630,
    blurb: "The default. Best answer quality per megabyte of the four.",
  },
  {
    id: "Qwen3.5-2B-q4f16_1-MLC",
    label: "Qwen3.5 2B",
    vramMB: 2245,
    blurb: "Newest generation. Stronger reasoning, a little slower to load.",
  },
  {
    id: "Qwen2.5-3B-Instruct-q4f16_1-MLC",
    label: "Qwen2.5 3B",
    vramMB: 2505,
    blurb: "Most capable. Needs a desktop GPU or an M-series Mac.",
  },
];

export const DEFAULT_MODEL_ID = "Qwen2.5-1.5B-Instruct-q4f16_1-MLC";

export function findModel(id: string): ChatModel {
  return CHAT_MODELS.find((m) => m.id === id) ?? CHAT_MODELS[1];
}

/** "1.6 GB" / "879 MB" - one place so the picker and the loader agree. */
export function formatSize(vramMB: number): string {
  return vramMB >= 1024 ? `${(vramMB / 1024).toFixed(1)} GB` : `${Math.round(vramMB)} MB`;
}
