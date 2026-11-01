import { Fragment, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";

// Renders the two inline marks a post may use: [label](/path) and **bold**.
// Only site-relative paths become links, so a typo can never send a reader
// off-site.
const TOKEN = /\[([^\]]+)\]\((\/[^)\s]*)\)|\*\*([^*]+)\*\*/g;

export function RichText({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] && m[2]) {
      out.push(
        <Link
          key={m.index}
          to={m[2]}
          className="font-semibold text-foreground underline decoration-primary/50 underline-offset-4 transition-colors hover:text-primary"
        >
          {m[1]}
        </Link>,
      );
    } else if (m[3]) {
      out.push(
        <strong key={m.index} className="font-semibold text-foreground">
          {m[3]}
        </strong>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out.map((n, i) => (typeof n === "string" ? <Fragment key={`t${i}`}>{n}</Fragment> : n))}</>;
}

/** Plain text of a rich string, for meta tags and schema. */
export function plainText(text: string): string {
  return text.replace(TOKEN, (_, label, _path, bold) => label ?? bold ?? "");
}
