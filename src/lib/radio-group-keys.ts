import type { KeyboardEvent } from "react";

/**
 * Arrow-key movement for a `role="radiogroup"` built out of buttons.
 *
 * Every exam in this codebase renders its choices as buttons with
 * `role="radio"`, which tells assistive technology to expect radio
 * behaviour: one tab stop for the whole group, arrows to move within it,
 * Home/End for the ends, and moving the selection as focus moves. None of
 * them implemented any of that, so the markup promised radios and delivered
 * a row of unrelated buttons - Tab through every option, one at a time.
 *
 * Attach to the group element and give each option a roving tabindex
 * (0 for the selected one, -1 for the rest).
 */
export function handleRadioGroupKeys(e: KeyboardEvent<HTMLDivElement>) {
  const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];
  if (!keys.includes(e.key)) return;

  const options = Array.from(
    e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not([disabled])'),
  );
  if (options.length === 0) return;

  const focused = options.findIndex((el) => el === document.activeElement);
  const checked = options.findIndex((el) => el.getAttribute("aria-checked") === "true");
  const base = focused !== -1 ? focused : checked !== -1 ? checked : 0;

  let next: number;
  if (e.key === "Home") next = 0;
  else if (e.key === "End") next = options.length - 1;
  else if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (base + 1) % options.length;
  else next = (base - 1 + options.length) % options.length;

  e.preventDefault();
  options[next].focus();
  // Selecting on move is the standard behaviour for a radio group, and it is
  // what makes arrow keys useful rather than just a focus walk.
  options[next].click();
}
