import { useState } from "react";
import { X, ArrowUpRight, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function CSRNotificationBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed right-4 bottom-4 max-w-sm z-40 md:right-6 md:bottom-6">
      {/* Glow effect background */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-20 blur-2xl rounded-2xl" />

      {/* Notification card */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-400 border-opacity-50 rounded-2xl p-5 md:p-6 shadow-2xl backdrop-blur-sm space-y-4">
        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-3 right-3 p-1 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with icon */}
        <div className="flex items-start gap-3 pr-6">
          <div className="p-2 bg-cyan-500 bg-opacity-20 rounded-lg flex-shrink-0">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-white text-sm md:text-base">
              Better Customer Service Response?
            </h3>
            <p className="text-xs text-slate-300">
              See how Ethixweb compares to traditional answering services.
            </p>
          </div>
        </div>

        {/* Key features bullet points */}
        <div className="space-y-2 pl-11">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-xs text-slate-300">AI-powered routing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-xs text-slate-300">Complete customization</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-xs text-slate-300">No long-term contracts</span>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          to="/csr-comparison"
          className="flex items-center justify-between w-full px-4 py-2 md:py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg font-semibold text-sm text-white transition group pl-11"
        >
          <span>Learn More</span>
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition" />
        </Link>

        {/* Comparison link */}
        <Link
          to="/csr-comparison"
          className="block text-xs text-cyan-400 hover:text-cyan-300 transition font-medium pl-11"
        >
          View full comparison →
        </Link>
      </div>
    </div>
  );
}
