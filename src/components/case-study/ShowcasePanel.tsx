import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/shared/Reveal";
import type { Image } from "@/data/case-studies/types";

const DEVICES_IMAGE_SRC = "/images/case-studies/all-phase-plumbing/devices-mockup.png";
const DEVICES_IMAGE_HOLLOW_SRC =
  "/images/case-studies/all-phase-plumbing/devices-mockup-hollow.png";
const DEVICES_IMAGE_ASPECT = "5306 / 2857";

// Screen cutouts as % of the composite photo's own box (measured against its
// native 5306x2857 pixels) - lets each live iframe sit exactly behind its
// device's glass at any render size, no JS layout math needed for position.
// frameWidth/frameHeight match each hole's real aspect ratio (as it actually
// renders in the photo's perspective) so the live page fills it exactly,
// with no gap or stretch.
const HOLES = {
  laptop: {
    left: 21.3,
    top: 14.18,
    width: 45.99,
    height: 64.79,
    frameWidth: 1440,
    frameHeight: 1093,
  },
  tablet: {
    left: 68.6,
    top: 25.2,
    width: 26.76,
    height: 68.78,
    frameWidth: 768,
    frameHeight: 1063,
  },
  phone: { left: 8.58, top: 36.33, width: 18.19, height: 51.17, frameWidth: 390, frameHeight: 591 },
} as const;

/** Live site rendered at a device's real width, then scaled via
 * ResizeObserver to fill however wide its cutout renders - shows that
 * breakpoint's actual responsive layout. Renders slightly wider than its
 * clipped wrapper so the native scrollbar lands outside the visible area. */
function LiveScreen({
  websiteUrl,
  clientName,
  device,
  hole,
}: {
  websiteUrl: string;
  clientName: string;
  device: string;
  hole: (typeof HOLES)[keyof typeof HOLES];
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setScale(el.getBoundingClientRect().width / hole.frameWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [hole.frameWidth]);

  return (
    <div
      ref={wrapRef}
      className="absolute overflow-hidden"
      style={{
        left: `${hole.left}%`,
        top: `${hole.top}%`,
        width: `${hole.width}%`,
        height: `${hole.height}%`,
      }}
    >
      <iframe
        src={websiteUrl}
        title={`${device} preview of the ${clientName} website`}
        loading="lazy"
        className="absolute left-0 top-0 origin-top-left border-0"
        style={{
          width: `${hole.frameWidth + 20}px`,
          height: `${hole.frameHeight}px`,
          transform: `scale(${scale})`,
        }}
      />
    </div>
  );
}

export function ShowcasePanel({
  image,
  websiteUrl,
  clientName,
}: {
  image: Image;
  websiteUrl?: string;
  clientName: string;
}) {
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
          {websiteUrl ? (
            <div
              className="relative mx-auto w-full max-w-[1150px]"
              style={{ aspectRatio: DEVICES_IMAGE_ASPECT }}
            >
              <LiveScreen
                websiteUrl={websiteUrl}
                clientName={clientName}
                device="Desktop"
                hole={HOLES.laptop}
              />
              <LiveScreen
                websiteUrl={websiteUrl}
                clientName={clientName}
                device="Tablet"
                hole={HOLES.tablet}
              />
              <LiveScreen
                websiteUrl={websiteUrl}
                clientName={clientName}
                device="Mobile"
                hole={HOLES.phone}
              />
              <img
                src={DEVICES_IMAGE_HOLLOW_SRC}
                alt={`${clientName} shown responsively on desktop, tablet and mobile`}
                width={5306}
                height={2857}
                className="pointer-events-none absolute inset-0 z-10 h-full w-full"
              />
            </div>
          ) : (
            <img
              src={image.src || DEVICES_IMAGE_SRC}
              alt={image.alt}
              width={image.width}
              height={image.height}
              loading="lazy"
              decoding="async"
              className="h-auto w-full max-w-[1200px] object-contain"
            />
          )}
        </div>
      </Reveal>
    </section>
  );
}
