import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { QR_LINKS } from "@/lib/qr-links";

export const Route = createFileRoute("/qr/$slug")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const destination = QR_LINKS[params.slug];
        if (!destination) {
          return new Response("Not found", { status: 404 });
        }
        return Response.redirect(new URL(destination, request.url), 302);
      },
    },
  },
});
