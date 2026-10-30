import type { Source } from "@/lib/chat/retrieve";

/** Keeps the conversation across page navigations.
 *
 * The widget is mounted by SiteLayout, which every route renders for itself,
 * so moving from /services to /contact unmounts and remounts the panel. A
 * transcript held only in React state would vanish on every click. sessionStorage
 * is the right scope: it survives navigation within the visit and disappears
 * when the tab closes, so nothing is left behind on a shared machine. */

const KEY = "ethix-chat-v1";

/** Enough to keep the thread readable without filling the quota with long
 * encyclopaedia extracts. */
const KEEP = 24;

export type StoredMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  /** Tappable follow up questions offered under the reply. */
  chips?: string[];
  /** A call request card rather than a message. */
  kind?: "lead-form";
  /** Set once that card's request went through, so it renders as sent. */
  leadSent?: boolean;
  failed?: boolean;
};

export function loadConversation(): StoredMessage[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Anything in storage is data, not trusted shape: a half-written or
    // hand-edited entry must not take the widget down on mount.
    return parsed.filter(
      (m): m is StoredMessage =>
        typeof m === "object" &&
        m !== null &&
        typeof (m as StoredMessage).id === "string" &&
        typeof (m as StoredMessage).content === "string" &&
        ((m as StoredMessage).role === "user" || (m as StoredMessage).role === "assistant"),
    );
  } catch {
    return [];
  }
}

export function saveConversation(messages: StoredMessage[]): void {
  try {
    if (messages.length === 0) {
      sessionStorage.removeItem(KEY);
      return;
    }
    sessionStorage.setItem(KEY, JSON.stringify(messages.slice(-KEEP)));
  } catch {
    // Private mode, blocked storage, or over quota. The chat still works for
    // this page view; only continuity across navigation is lost.
  }
}
