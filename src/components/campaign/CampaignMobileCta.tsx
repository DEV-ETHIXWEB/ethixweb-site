import { useEffect, useState } from "react";
import { ArrowUpRight, Phone } from "lucide-react";
import type { CampaignConfig } from "@/lib/campaigns/types";
import type { CampaignMeta } from "@/lib/campaigns/tracking";
import { trackCampaignEvent } from "@/lib/campaigns/tracking";

/** Mobile-only sticky bottom bar. The "Call" action only renders once a
 * verified phone number is set on the campaign config - never invented. */
export function CampaignMobileCta({
  config,
  meta,
}: {
  config: CampaignConfig;
  meta: CampaignMeta;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0c0d10]/95 px-4 py-3 backdrop-blur-lg transition-transform duration-200 lg:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center gap-2">
        <a
          href="#audit-form"
          onClick={() => trackCampaignEvent("campaign_cta_click", meta, { cta: "sticky_mobile" })}
          className="btn-primary flex flex-1 items-center justify-center gap-2 rounded-full border border-transparent px-6 py-3 text-sm font-bold"
        >
          Get Free Audit <ArrowUpRight className="h-4 w-4" />
        </a>
        {config.phone && (
          <a
            href={config.phone.href}
            onClick={() => trackCampaignEvent("campaign_phone_click", meta)}
            aria-label={`Call Ethixweb at ${config.phone.display}`}
            className="btn-secondary flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
          >
            <Phone className="h-5 w-5" />
          </a>
        )}
      </div>
    </div>
  );
}
