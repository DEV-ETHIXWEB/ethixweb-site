import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { loadAdsTag, readConsent, writeConsent } from "@/lib/consent";

/**
 * Asks before any advertising cookie is set. Google Ads gtag.js used to load
 * from the <head> of every page unconditionally, so the tag ran - and its
 * cookies were set - before the visitor had any say.
 *
 * Nothing renders until after mount: the stored choice lives in
 * localStorage, which the server cannot see, so deciding on the server would
 * either flash the banner at people who already answered or hide it from
 * people who have not.
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    if (stored === "granted") {
      loadAdsTag();
      return;
    }
    if (stored === null) setVisible(true);
  }, []);

  const choose = (choice: "granted" | "denied") => {
    writeConsent(choice);
    if (choice === "granted") loadAdsTag();
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          role="dialog"
          aria-modal="false"
          aria-label="Cookie choices"
          // Sits above the campaign pages' sticky mobile CTA bar (z-40) but
          // below the navbar's own overlay layer.
          className="fixed inset-x-0 bottom-0 z-45 px-4 pb-4"
        >
          <div className="glass-strong mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl p-5 shadow-elegant sm:flex-row sm:items-center sm:gap-6 sm:p-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              We would like to set cookies that measure how our advertising performs. They are not
              needed for this site to work, and we will not set them unless you say yes. See our{" "}
              <Link
                to="/policies/privacy"
                className="text-foreground underline underline-offset-2 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
            <div className="flex shrink-0 gap-2.5">
              <button
                type="button"
                onClick={() => choose("denied")}
                className="rounded-full border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => choose("granted")}
                className="btn-primary rounded-full px-5 py-2.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
