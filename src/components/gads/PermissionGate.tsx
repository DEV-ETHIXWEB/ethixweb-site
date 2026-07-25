import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Maximize, Mic, ShieldAlert } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import type { useMediaRecording, PermissionState } from "@/hooks/useMediaRecording";

interface PermissionGateProps {
  media: ReturnType<typeof useMediaRecording>;
  /** Called once fullscreen is entered and recording has started. */
  onReady: () => void;
}

/** Anti-cheating gate before the exam begins: camera + microphone are
 * mandatory (the candidate cannot continue without both), and fullscreen is
 * entered as part of the same user gesture, since browsers require it. */
export function PermissionGate({ media, onReady }: PermissionGateProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    if (media.permission === "granted" && videoRef.current) {
      videoRef.current.srcObject = media.getStream();
    }
  }, [media, media.permission]);

  async function handleBegin() {
    setErrorMsg(null);
    if (!document.fullscreenEnabled) {
      setErrorMsg(
        "Fullscreen is not supported in this browser. Please use a desktop browser such as Chrome or Edge.",
      );
      return;
    }
    setLaunching(true);
    try {
      await document.documentElement.requestFullscreen({ navigationUI: "hide" });
    } catch {
      setErrorMsg("Fullscreen was blocked. Please allow fullscreen and try again.");
      setLaunching(false);
      return;
    }
    if (!media.startRecording()) {
      setErrorMsg("Could not start recording. Please try again.");
      await document.exitFullscreen().catch(() => {});
      setLaunching(false);
      return;
    }
    onReady();
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-16">
      <Reveal>
        <div className="premium-card w-full max-w-lg rounded-3xl p-6 sm:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/15 text-amber-500">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <h2 className="mt-4 font-display text-xl font-bold">Camera & microphone check</h2>
          <p className="mt-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-500">
            This assessment is monitored for recruitment purposes.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Your camera and microphone are recorded for the duration of the assessment, reviewed
            only by the EthixWeb hiring team. The exam cannot begin without both permissions
            granted.
          </p>

          {errorMsg && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-error-text"
            >
              {errorMsg}
            </p>
          )}

          <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-start">
            <div className="space-y-3">
              <StatusRow icon={Camera} label="Camera" state={media.permission} />
              <StatusRow icon={Mic} label="Microphone" state={media.permission} />
              {media.permission === "denied" && (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-error-text">
                  Permission was denied, so the assessment cannot start. Click the camera icon in
                  your browser's address bar, allow camera and microphone access, then try again.
                </p>
              )}
            </div>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`aspect-[4/3] w-full rounded-2xl border border-border bg-black object-cover sm:w-56 ${
                media.permission === "granted" ? "" : "opacity-30"
              }`}
            />
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            {media.permission !== "granted" ? (
              <button
                type="button"
                disabled={media.permission === "requesting"}
                onClick={() => void media.requestPermissions()}
                className="magnetic inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-bold text-primary-foreground shadow-glow disabled:cursor-not-allowed disabled:opacity-40"
              >
                {media.permission === "requesting" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                {media.permission === "denied" ? "Try again" : "Grant camera & microphone access"}
              </button>
            ) : (
              <button
                type="button"
                disabled={launching}
                onClick={() => void handleBegin()}
                className="magnetic inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-bold text-primary-foreground shadow-glow disabled:cursor-not-allowed disabled:opacity-40"
              >
                {launching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
                Enter fullscreen & begin
              </button>
            )}
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function StatusRow({
  icon: Icon,
  label,
  state,
}: {
  icon: typeof Camera;
  label: string;
  state: PermissionState;
}) {
  const labels: Record<PermissionState, string> = {
    idle: "Not requested",
    requesting: "Requesting...",
    granted: "Granted",
    denied: "Denied",
  };
  const colors: Record<PermissionState, string> = {
    idle: "text-muted-foreground",
    requesting: "text-amber-500",
    granted: "text-emerald-500",
    denied: "text-error-text",
  };
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="font-semibold">{label}</span>
      <span className={`ml-auto text-xs font-bold ${colors[state]}`}>{labels[state]}</span>
    </div>
  );
}
