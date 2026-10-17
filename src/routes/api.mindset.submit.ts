import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { clientIp } from "@/lib/rate-limit";
import { guardRequest } from "@/lib/api-guard";
import { finalizeMindsetAssessment, loadMindsetAssessment } from "@/lib/mindset/service";

// Terminal finalize: called after the last question's advance response
// comes back `done: true`, or forced early by the overall timer / the
// strict violation ladder. The candidate response never contains scores,
// only that the submission was received.

const bodySchema = z.object({
  token: z
    .string()
    .length(64)
    .regex(/^[0-9a-f]{64}$/),
  reason: z.enum(["manual", "timer", "violations"]),
});

export const Route = createFileRoute("/api/mindset/submit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const guard = await guardRequest(
          request,
          `mindset-submit:${clientIp(request)}`,
          100,
          10 * 60 * 1000,
        );
        if (guard) return guard;

        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
        }

        const row = await loadMindsetAssessment(parsed.data.token);
        if (!row) {
          return Response.json({ ok: false, error: "Assessment not found" }, { status: 404 });
        }
        if (row.status !== "in_progress") {
          return Response.json({ ok: true, duplicate: true });
        }

        try {
          await finalizeMindsetAssessment({ row, reason: parsed.data.reason });
        } catch (err) {
          console.error("[api/mindset/submit] finalize failed:", err);
          return Response.json(
            {
              ok: false,
              error:
                "Could not record your submission. Please try again - your answers are auto-saved.",
            },
            { status: 502 },
          );
        }

        return Response.json({ ok: true });
      },
    },
  },
});
