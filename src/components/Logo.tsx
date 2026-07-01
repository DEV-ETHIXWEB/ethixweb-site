import { Link } from "@tanstack/react-router";
import logo from "@/assets/ethixweb-logo-text.webp";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`flex items-center group ${className}`}
      onDoubleClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <img
        src={logo}
        alt="Ethixweb"
        width={214}
        height={32}
        className="logo-img h-8 w-auto object-contain transition-transform group-hover:scale-105"
      />
    </Link>
  );
}
