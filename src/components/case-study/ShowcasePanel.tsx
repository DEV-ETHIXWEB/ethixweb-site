import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/shared/Reveal";
import { MacBookFrame, IPadFrame, IPhoneFrame } from "@/components/case-study/DeviceFrames";
import type { Image } from "@/data/case-studies/types";

/** Live site rendered at a device's real width, then scaled via
 * ResizeObserver to fill however wide its frame renders - shows that
 * breakpoint's actual layout, not one screenshot resized. Renders slightly
 * wider than its clipped parent so the native scrollbar lands outside the
 * visible area. */
function LiveScreen({
  websiteUrl,
  clientName,
  device,
  frameWidth,
  frameHeight,
}: {
  websiteUrl: string;
  clientName: string;
  device: string;
  frameWidth: number;
  frameHeight: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setScale(el.getBoundingClientRect().width / frameWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [frameWidth]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <iframe
        src={websiteUrl}
        title={`${device} preview of the ${clientName} website`}
        loading="lazy"
        className="absolute left-0 top-0 origin-top-left border-0"
        style={{
          width: `${frameWidth + 20}px`,
          height: `${frameHeight}px`,
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
          className="flex items-center justify-center px-6 py-20 sm:py-28"
          style={{
            background:
              "radial-gradient(ellipse 65% 85% at 50% 45%, #f2f1df 0%, var(--color-background) 100%)",
          }}
        >
          {websiteUrl ? (
            <div className="relative mx-auto w-full max-w-[980px] pb-14 pl-8 pr-4 pt-4 sm:pb-0 sm:pl-16 sm:pr-10">
              <div className="relative z-0">
                <MacBookFrame className="w-full">
                  <LiveScreen
                    websiteUrl={websiteUrl}
                    clientName={clientName}
                    device="Desktop"
                    frameWidth={1440}
                    frameHeight={900}
                  />
                </MacBookFrame>
              </div>

              <div className="absolute -right-4 bottom-[-6%] z-10 w-[24%] sm:right-[2%] sm:bottom-[-8%] sm:w-[27%]">
                <IPadFrame className="rotate-[2deg]">
                  <LiveScreen
                    websiteUrl={websiteUrl}
                    clientName={clientName}
                    device="Tablet"
                    frameWidth={768}
                    frameHeight={1024}
                  />
                </IPadFrame>
              </div>

              <div className="absolute -left-4 bottom-0 z-20 w-[16%] sm:bottom-[-4%] sm:left-[2%] sm:w-[18%]">
                <IPhoneFrame className="-rotate-[15deg]">
                  <LiveScreen
                    websiteUrl={websiteUrl}
                    clientName={clientName}
                    device="Mobile"
                    frameWidth={390}
                    frameHeight={844}
                  />
                </IPhoneFrame>
              </div>
            </div>
          ) : (
            <img
              src={image.src}
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
