import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  BookOpen,
  Cpu,
  Globe,
  Loader2,
  MonitorOff,
  PhoneCall,
  Search,
  Settings2,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CHAT_MODELS, DEFAULT_MODEL_ID, findModel, formatSize } from "@/lib/chat/models";
import {
  getEngine,
  hasWebGPU,
  loadedModelId,
  streamReply,
  type LoadProgress,
} from "@/lib/chat/engine";
import {
  cleanAnswer,
  extractiveAnswer,
  failureMessage,
  isFollowUp,
  retrieve,
  systemPrompt,
  type Source,
} from "@/lib/chat/retrieve";
import { LEAD_CHIP, LEAD_INTENT, matchSmallTalk } from "@/lib/chat/smalltalk";
import { RichText } from "@/components/chat/RichText";
import { LeadForm, LeadSent } from "@/components/chat/LeadForm";
import emblem from "@/assets/emblem-transparent-sm.webp";
import {
  loadConversation,
  saveConversation,
  type StoredMessage,
} from "@/components/chat/chat-storage";

/** The assistant panel behind the bubble.
 *
 * Everything runs on the visitor's device: retrieval over this site's content
 * and Wikipedia, then an open-weight model on WebGPU. No key, no server, and
 * no request to us carrying what anyone typed.
 *
 * Lazily imported by ChatWidget, so none of this - nor the model runtime it
 * pulls in later - costs anything on a page view where the bubble is never
 * opened. */

type Message = StoredMessage;
type Status = "idle" | "retrieving" | "loading" | "generating";

// The questions a home service owner asks first.
const SUGGESTIONS = [
  "Can you answer my missed calls?",
  "How do I get into the Map Pack?",
  "Do you work with ServiceTitan?",
  "What does a project cost?",
  LEAD_CHIP,
];

/** Pages whose topic is something a visitor could buy. An answer drawn from
 * one of them ends with the call request chip; an answer about careers,
 * policies or how this chat works does not. */
const COMMERCIAL =
  /^\/(contact|about|services|industries|our-work|web-development|ai-automation|marketing|graphic-design|locations)/;

let seq = 0;
function nextId(): string {
  seq += 1;
  return `m${seq}-${Date.now().toString(36)}`;
}

export function ChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>(() => loadConversation());
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState<LoadProgress | null>(null);
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
  const [showSettings, setShowSettings] = useState(false);
  const [ready, setReady] = useState(false);
  const [support, setSupport] = useState<"unknown" | "ok" | "none">("unknown");

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const busy = status !== "idle";
  const model = findModel(modelId);

  useEffect(() => {
    let live = true;
    hasWebGPU().then((ok) => live && setSupport(ok ? "ok" : "none"));
    setReady(loadedModelId() !== null);
    inputRef.current?.focus();
    return () => {
      live = false;
    };
  }, []);

  // Survives navigation between pages: the panel unmounts with the layout,
  // so without this every route change would wipe the conversation.
  useEffect(() => {
    saveConversation(messages);
  }, [messages]);

  // Follow the stream, but only when the visitor is already at the bottom.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 140) el.scrollTop = el.scrollHeight;
  }, [messages, progress, status]);

  const update = useCallback((id: string, patch: Partial<Message>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  // One open call request at a time: asking twice should bring the visitor
  // back to the form they already have, not stack a second copy under it.
  const openLeadForm = useCallback(() => {
    setShowSettings(false);
    setMessages((prev) =>
      prev.some((m) => m.kind === "lead-form" && !m.leadSent)
        ? prev
        : [...prev, { id: nextId(), role: "assistant", content: "", kind: "lead-form" }],
    );
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  const leadSent = useCallback((formId: string, firstName: string, websiteHost: string) => {
    setMessages((prev) => [
      ...prev.map((m) => (m.id === formId ? { ...m, leadSent: true } : m)),
      {
        id: nextId(),
        role: "assistant",
        content: `Thanks ${firstName}, that is with the team now. They will look at ${websiteHost} first and call you within one business day. Anything else you want to know in the meantime?`,
      },
    ]);
  }, []);

  const ask = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || busy) return;

      setInput("");
      setShowSettings(false);
      // The previous question is the only history anything needs: retrieval
      // folds it into a thin follow up ("when was she born?"), and the model
      // gets it as one line of context rather than as replayed chat turns.
      const previousQuestion = messages.filter((m) => m.role === "user" && !m.kind).at(-1)?.content;

      const replyId = nextId();
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "user", content: trimmed },
        { id: replyId, role: "assistant", content: "" },
      ]);

      // Greetings, thanks and "are you a bot" are answered from written copy,
      // instantly. Routing them through retrieval and a model download would
      // be slower and worse, and it is the first thing most people type.
      const small = matchSmallTalk(trimmed);
      if (small) {
        update(replyId, { content: small.reply, chips: small.chips });
        if (small.offerLead) openLeadForm();
        return;
      }

      // A longer message with buying intent ("we are a plumbing company and
      // need a new website, what would it cost") still deserves a real answer
      // first, then the way to act on it.
      const leadish = LEAD_INTENT.test(trimmed.toLowerCase());
      const leadChips = (srcs: Source[]) =>
        leadish || srcs.some((s) => s.kind === "site" && s.href && COMMERCIAL.test(s.href))
          ? [LEAD_CHIP]
          : undefined;

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        setStatus("retrieving");
        const { sources, webFailure, direct } = await retrieve(trimmed, {
          previousQuestion,
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        update(replyId, { sources });

        // A confident company match is answered from curated text: exact,
        // instant, and no model download for someone asking what we charge.
        if (direct) {
          update(replyId, { content: cleanAnswer(direct), chips: leadChips(sources) });
          return;
        }

        // Nothing to ground an answer in, and we know why. Say that rather
        // than spending a model load on what could only be a guess.
        if (sources.length === 0 && webFailure) {
          update(replyId, { content: failureMessage(webFailure) });
          return;
        }

        if (support === "none") {
          update(replyId, {
            content: cleanAnswer(extractiveAnswer(sources)),
            chips: leadChips(sources),
          });
          return;
        }

        if (loadedModelId() !== modelId) setStatus("loading");
        const engine = await getEngine(modelId, setProgress);
        if (controller.signal.aborted) return;
        setProgress(null);
        setReady(true);

        setStatus("generating");
        const context =
          previousQuestion && isFollowUp(trimmed)
            ? `The visitor's previous question was: "${previousQuestion}"\n\n`
            : "";
        const request = () =>
          streamReply(engine, {
            signal: controller.signal,
            onToken: (full) => update(replyId, { content: cleanAnswer(full) }),
            messages: [
              { role: "system", content: systemPrompt(sources) },
              // The rule again, last: a small model weighs the end of the
              // prompt most, and the system message is far behind it.
              {
                role: "user",
                content: `${context}${trimmed}\n\n(Answer in two to four short, plain sentences, using only the reference material.)`,
              },
            ],
          });

        // A small model occasionally ends its turn before writing anything.
        // One fresh attempt clears it; if it happens twice, quoting the
        // sources is still a real answer, where "no answer" is a dead end.
        let text = cleanAnswer(await request());
        if (!text && !controller.signal.aborted) text = cleanAnswer(await request());
        if (controller.signal.aborted && !text) return;
        update(replyId, {
          content: text || cleanAnswer(extractiveAnswer(sources)),
          chips: leadChips(sources),
        });
      } catch {
        update(replyId, {
          failed: true,
          content:
            "That did not work. If the model was still downloading, check the connection and ask again. A smaller model in settings also helps when the GPU runs short of memory.",
        });
      } finally {
        // Stopping mid-load leaves a bubble that never got text. Drop it.
        setMessages((prev) => prev.filter((m) => m.id !== replyId || m.content !== ""));
        setStatus("idle");
        setProgress(null);
        abortRef.current = null;
      }
    },
    [busy, messages, modelId, openLeadForm, support, update],
  );

  const onChip = (chip: string) => (chip === LEAD_CHIP ? openLeadForm() : ask(chip));

  function stop() {
    abortRef.current?.abort();
    setStatus("idle");
    setProgress(null);
  }

  function clear() {
    abortRef.current?.abort();
    setMessages([]);
    setStatus("idle");
  }

  const statusLine =
    support === "none"
      ? "Online, reader mode"
      : ready
        ? `Online, ${model.label}`
        : "Online, private to you";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="flex items-center gap-1.5 border-b border-border/80 py-3 pl-4 pr-2.5">
        <EmblemAvatar />
        <div className="ml-1.5 min-w-0 flex-1">
          <p className="truncate text-sm font-bold leading-tight">Ethixweb Assistant</p>
          <p className="flex items-center gap-1.5 truncate text-[11px] leading-tight text-muted-foreground">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
            {statusLine}
          </p>
        </div>
        <button
          type="button"
          onClick={openLeadForm}
          aria-label="Book a free call"
          title="Book a free call"
          className="flex h-8 w-8 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10"
        >
          <PhoneCall className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setShowSettings((v) => !v)}
          aria-label="Model settings"
          aria-expanded={showSettings}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-foreground/10",
            showSettings && "bg-foreground/10 text-primary",
          )}
        >
          <Settings2 className="h-4 w-4" />
        </button>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear conversation"
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-foreground/10"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-foreground/10"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      {/* ── Settings ─────────────────────────────────────────────────────── */}
      {showSettings && (
        <div className="border-b border-border/80 bg-foreground/[0.03] px-4 py-3">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            <Cpu className="h-3.5 w-3.5 text-primary" /> Model
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            Downloaded once to this browser, then cached. Bigger answers better and needs more GPU
            memory.
          </p>
          <div className="mt-2.5 space-y-1.5">
            {CHAT_MODELS.map((m) => {
              const active = m.id === modelId;
              return (
                <button
                  key={m.id}
                  type="button"
                  disabled={busy}
                  aria-pressed={active}
                  onClick={() => {
                    setModelId(m.id);
                    setReady(loadedModelId() === m.id);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition-colors disabled:opacity-50",
                    active
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold">{m.label}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {m.blurb}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] font-bold text-muted-foreground">
                    {formatSize(m.vramMB)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Transcript ───────────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
        aria-live="polite"
        aria-busy={busy}
      >
        {messages.length === 0 && (
          <div>
            <p className="text-sm font-semibold">Hi there. Ask me anything.</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Questions about Ethixweb are answered from this site. Anything else comes from live
              Wikipedia summaries. Your questions stay on your device, and if you want a person, I
              can book you a free call with the team.
            </p>
            {support === "none" && (
              <p className="mt-3 flex gap-2 rounded-xl border border-primary/25 bg-primary/5 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
                <MonitorOff className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                This browser has no WebGPU, so answers are quoted from the sources instead of
                written by a model. Chrome, Edge or Safari 18 will run it.
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onChip(s)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-left text-[11px] font-semibold transition-colors",
                    s === LEAD_CHIP
                      ? "border-primary/40 bg-primary/10 text-foreground hover:border-primary/70"
                      : "border-border bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) =>
          m.kind === "lead-form" ? (
            <div key={m.id}>
              {m.leadSent ? (
                <LeadSent />
              ) : (
                <LeadForm onSent={(first, host) => leadSent(m.id, first, host)} />
              )}
            </div>
          ) : m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm leading-relaxed text-primary-foreground">
                {m.content}
              </p>
            </div>
          ) : (
            <div key={m.id}>
              <div
                className={cn(
                  "rounded-2xl rounded-bl-md border px-3.5 py-2.5 text-sm leading-relaxed",
                  m.failed ? "border-primary/40 bg-primary/5" : "border-border bg-background/60",
                )}
              >
                {m.content ? (
                  <RichText text={m.content} />
                ) : (
                  <StatusLine status={status} progress={progress} />
                )}
              </div>
              {m.chips && m.chips.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.chips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => onChip(chip)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-left text-[11px] font-semibold text-foreground transition-colors",
                        chip === LEAD_CHIP
                          ? "border-primary bg-primary text-primary-foreground hover:opacity-90"
                          : "border-primary/30 bg-primary/5 hover:border-primary/60 hover:bg-primary/10",
                      )}
                    >
                      {chip === LEAD_CHIP && <PhoneCall className="h-3 w-3" />}
                      {chip}
                    </button>
                  ))}
                </div>
              )}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {m.sources.map((s, i) => (
                    <SourcePill key={`${s.title}-${i}`} source={s} index={i + 1} />
                  ))}
                </div>
              )}
            </div>
          ),
        )}
      </div>

      {/* ── Composer ─────────────────────────────────────────────────────── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="border-t border-border/80 px-3 py-3"
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask(input);
              }
            }}
            rows={1}
            placeholder="Ask about Ethixweb, or anything else"
            aria-label="Your question"
            className="max-h-28 min-h-10 flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50"
          />
          {busy ? (
            <button
              type="button"
              onClick={stop}
              aria-label="Stop"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border transition-colors hover:border-primary/40"
            >
              <Square className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send question"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
        </div>
        {support !== "none" && !ready && (
          <p className="mt-2 px-0.5 text-[10px] leading-relaxed text-muted-foreground">
            First question downloads {model.label} ({formatSize(model.vramMB)}) to this browser,
            once.
          </p>
        )}
      </form>
    </div>
  );
}

/** The brand "E" on a neutral disc inside a thin crimson ring, matching the
 * launcher, so the panel reads as the same object the visitor just opened. */
function EmblemAvatar() {
  return (
    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background ring-2 ring-primary/70 ring-offset-2 ring-offset-transparent">
      <img src={emblem} alt="" width={20} height={21} className="h-5 w-5 object-contain" />
    </span>
  );
}

function StatusLine({ status, progress }: { status: Status; progress: LoadProgress | null }) {
  if (status === "retrieving") {
    return (
      <span className="flex items-center gap-2 text-muted-foreground">
        <Search className="h-3.5 w-3.5 animate-pulse text-primary" /> Searching the sources
      </span>
    );
  }
  if (status === "loading") {
    const pct = progress?.progress != null ? Math.round(progress.progress * 100) : null;
    return (
      <span className="block text-muted-foreground">
        <span className="flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          {pct != null ? `Loading the model, ${pct}%` : "Loading the model"}
        </span>
        {pct != null && (
          <span className="mt-2 block h-1 w-full overflow-hidden rounded-full bg-foreground/10">
            <span
              className="block h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${pct}%` }}
            />
          </span>
        )}
        <span className="mt-1.5 block text-[11px] leading-relaxed opacity-80">
          One time only, then it is cached for next visit.
        </span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Writing
    </span>
  );
}

function SourcePill({ source, index }: { source: Source; index: number }) {
  const label = `[${index}] ${source.title}`;
  const className =
    "inline-flex max-w-full items-center gap-1 truncate rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground";
  const Icon = source.kind === "site" ? BookOpen : Globe;

  if (!source.href) return <span className={className}>{label}</span>;
  return (
    <a
      href={source.href}
      target={source.kind === "web" ? "_blank" : undefined}
      rel={source.kind === "web" ? "noopener noreferrer" : undefined}
      className={className}
    >
      <Icon className="h-2.5 w-2.5 shrink-0 text-primary" />
      <span className="truncate">{label}</span>
    </a>
  );
}
