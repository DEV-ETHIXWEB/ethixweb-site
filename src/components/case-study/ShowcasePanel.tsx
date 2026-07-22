import { Reveal } from "@/components/shared/Reveal";
import type { Image } from "@/data/case-studies/types";

/** Multi-device showcase moment. Renders the study's static composite photo
 * (all screens pre-filled) rather than live iframes of the client's site -
 * production sites commonly send X-Frame-Options/frame-ancestors deny, which
 * blanks an embedded frame with a browser "content is blocked" notice, and we
 * don't work around a client's own framing policy. */
export function ShowcasePanel({ image }: { image: Image }) {
  return (
    <section className="pb-6 sm:pb-10">
      <Reveal>
        <div
          className="flex items-center justify-center px-6 py-16 sm:py-20"
          style={{
            background:
              "radial-gradient(ellipse 65% 85% at 50% 45%, #f2f1df 0%, var(--color-background) 100%)",
          }}
        >
          <img
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="lazy"
            decoding="async"
            className="h-auto w-full max-w-[1200px] object-contain"
          />
        </div>
      </Reveal>
    </section>
  );
}
