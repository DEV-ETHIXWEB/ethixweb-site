import { Fragment, type ReactNode } from "react";

/** Minimal markdown for model output.
 *
 * Instruction-tuned models write **bold**, `code` and bullet lists whatever
 * the prompt asks, so raw text renders as literal asterisks and looks broken.
 * A full markdown library is a dependency and an XSS surface for a few
 * patterns, so this handles the four that actually show up and builds React
 * nodes rather than HTML - nothing here can inject markup. */

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\[\d+\])/g;

function inline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={key} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code key={key} className="rounded bg-foreground/10 px-1 py-0.5 font-mono text-[0.85em]">
          {part.slice(1, -1)}
        </code>
      );
    }
    // Citation markers the prompt asks for, so they read as references
    // rather than stray brackets in the middle of a sentence.
    if (/^\[\d+\]$/.test(part)) {
      return (
        <span key={key} className="font-bold text-primary-text">
          {part}
        </span>
      );
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

type Block = { kind: "p" | "ul" | "ol"; lines: string[] };

/** Groups consecutive list lines so a three-item list is one <ul>, not three. */
function toBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    const kind = bullet ? "ul" : numbered ? "ol" : "p";
    const content = bullet?.[1] ?? numbered?.[1] ?? line;
    const last = blocks[blocks.length - 1];
    if (kind !== "p" && last?.kind === kind) {
      last.lines.push(content);
    } else if (kind === "p" && last?.kind === "p" && content.trim() && last.lines.at(-1)?.trim()) {
      // Soft-wrapped prose: keep it in the same paragraph.
      last.lines.push(content);
    } else {
      blocks.push({ kind, lines: [content] });
    }
  }
  return blocks;
}

export function RichText({ text }: { text: string }) {
  const blocks = toBlocks(text).filter((b) => b.lines.some((l) => l.trim()));

  return (
    <>
      {blocks.map((block, bi) => {
        if (block.kind === "p") {
          return (
            <p key={bi} className={bi > 0 ? "mt-2.5" : undefined}>
              {inline(block.lines.join(" ").trim(), `b${bi}`)}
            </p>
          );
        }
        const List = block.kind === "ul" ? "ul" : "ol";
        return (
          <List
            key={bi}
            className={`${bi > 0 ? "mt-2.5" : ""} space-y-1 ${
              block.kind === "ul" ? "list-disc" : "list-decimal"
            } pl-5 marker:text-primary`}
          >
            {block.lines.map((line, li) => (
              <li key={li}>{inline(line, `b${bi}-${li}`)}</li>
            ))}
          </List>
        );
      })}
    </>
  );
}
