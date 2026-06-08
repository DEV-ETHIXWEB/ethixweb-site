import { useEffect } from "react";

const CLICK_SRC = "/click-sound-effects-copyright-free_NBeVl5YB.mp3";

// Reuse a single Audio element as a template — clone it per click so
// rapid successive clicks can overlap instead of cutting each other off
let _template: HTMLAudioElement | null = null;
function getTemplate(): HTMLAudioElement | null {
  try {
    if (!_template) {
      _template = new Audio(CLICK_SRC);
      _template.volume = 0.35;
      _template.preload = "auto";
    }
    return _template;
  } catch {
    return null;
  }
}

function playClick() {
  const template = getTemplate();
  if (!template) return;
  try {
    const sound = template.cloneNode(true) as HTMLAudioElement;
    sound.volume = template.volume;
    void sound.play().catch(() => {});
  } catch {
    /* silent */
  }
}

export function useClickSound() {
  useEffect(() => {
    document.addEventListener("click", playClick, { capture: true, passive: true });
    return () => document.removeEventListener("click", playClick, { capture: true });
  }, []);
}
