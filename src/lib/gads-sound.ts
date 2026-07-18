// A short synthesized click (Web Audio API, no asset file needed) played on
// option selection and Next/Submit clicks during the exam - purely cosmetic
// feedback, so any failure (autoplay policy, unsupported browser) is
// swallowed rather than surfaced.

let ctx: AudioContext | null = null;

export function playGadsClick() {
  try {
    const AudioCtx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    if (!ctx) ctx = new AudioCtx();
    if (ctx.state === "suspended") void ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(720, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Cosmetic only - never let a sound failure affect the exam.
  }
}
