import { useEffect } from "react";

const CLICK_SRC = "/click-sound-effects-copyright-free_NBeVl5YB.mp3";
const MUTE_KEY = "ethix-click-sound";

// A click sound on every click, site-wide, with no way to turn it off, is
// hostile - especially to anyone who did not expect audio from a business
// website. Three things changed:
//
//  1. It respects prefers-reduced-motion. That media query is the standing
//     signal for "no incidental effects please", and an unrequested sound
//     is squarely that.
//  2. It can be muted, and the choice sticks (see SoundToggle in the navbar).
//  3. It only fires on things that are actually buttons or links. It used to
//     be a capture listener on document, so it also fired on text selection,
//     checkboxes, form fields and dead space.
//
// The audio element is also reused rather than cloned per click. Each click
// used to create a fresh HTMLAudioElement that was never released, so a long
// session accumulated detached media elements.

let audio: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement | null {
  try {
    if (!audio) {
      audio = new Audio(CLICK_SRC);
      audio.volume = 0.35;
      // Not "auto": this is decoration, and it used to pull the file down for
      // every visitor on every page load whether or not they ever clicked.
      audio.preload = "none";
    }
    return audio;
  } catch {
    return null;
  }
}

export function isClickSoundMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MUTE_KEY) === "muted";
  } catch {
    return false;
  }
}

export function setClickSoundMuted(muted: boolean): void {
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? "muted" : "on");
  } catch {
    // Nothing to persist to; the choice still applies for this page view.
  }
  // Let the toggle in the navbar and this hook agree without prop drilling
  // through every layout.
  window.dispatchEvent(new CustomEvent("ethix:click-sound", { detail: { muted } }));
}

function shouldSoundFor(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  // Only genuine controls. `closest` so a click on an icon inside a button
  // still counts.
  return Boolean(target.closest("button, a[href], [role='button']"));
}

export function useClickSound() {
  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    let muted = isClickSoundMuted();

    const onMuteChange = (e: Event) => {
      muted = Boolean((e as CustomEvent<{ muted: boolean }>).detail?.muted);
    };

    const play = (e: MouseEvent) => {
      if (muted || reduceMotion?.matches) return;
      if (!shouldSoundFor(e.target)) return;
      const el = getAudio();
      if (!el) return;
      try {
        // Rewind rather than clone, so rapid clicks retrigger the same
        // element instead of leaking a new one each time.
        el.currentTime = 0;
        void el.play().catch(() => {});
      } catch {
        /* autoplay policy or decode error - silence is the right fallback */
      }
    };

    document.addEventListener("click", play, { passive: true });
    window.addEventListener("ethix:click-sound", onMuteChange);
    return () => {
      document.removeEventListener("click", play);
      window.removeEventListener("ethix:click-sound", onMuteChange);
    };
  }, []);
}
