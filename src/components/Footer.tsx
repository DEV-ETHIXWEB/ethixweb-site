import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { ArrowUpRight, Mail, Clock } from "lucide-react";

const LIVE_PATHS = new Set(["/", "/contact"]);

const FOOTER_MASCOT = "/Ethan%20view%20%201.webp";

const COMPANY_LINKS: [string, string][] = [
  ["About", "/about"],
  ["Industries", "/industries"],
  ["Our Work", "/portfolio"],
  ["Blog", "/blog"],
  ["Careers", "/careers"],
  ["Contact", "/contact"],
];

const USEFUL_LINKS: [string, string][] = [
  ["Cancellation & Refunds", "/policies/refunds"],
  ["Terms & Conditions", "/policies/terms"],
  ["Privacy Policy", "/policies/privacy"],
];

function Facebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M18.9 0H1.1C0.808262 0 0.528473 0.115893 0.322183 0.322183C0.115893 0.528473 0 0.808262 0 1.1V18.9C0 19.1917 0.115893 19.4715 0.322183 19.6778C0.528473 19.8841 0.808262 20 1.1 20H10.68V12.25H8.08V9.25H10.68V7C10.6261 6.47176 10.6885 5.93813 10.8627 5.43654C11.0369 4.93495 11.3188 4.47755 11.6885 4.09641C12.0582 3.71528 12.5068 3.41964 13.0028 3.23024C13.4989 3.04083 14.0304 2.96225 14.56 3C15.3383 2.99463 16.1163 3.03469 16.89 3.12V5.82H15.3C14.04 5.82 13.8 6.42 13.8 7.29V9.22H16.8L16.41 12.22H13.8V20H18.9C19.0445 20 19.1875 19.9715 19.321 19.9163C19.4544 19.861 19.5757 19.78 19.6778 19.6778C19.78 19.5757 19.861 19.4544 19.9163 19.321C19.9715 19.1875 20 19.0445 20 18.9V1.1C20 0.955546 19.9715 0.812506 19.9163 0.679048C19.861 0.54559 19.78 0.424327 19.6778 0.322183C19.5757 0.220038 19.4544 0.139013 19.321 0.0837326C19.1875 0.0284524 19.0445 0 18.9 0Z" />
    </svg>
  );
}

function Linkedin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M16 0C16.5304 0 17.0391 0.210714 17.4142 0.585786C17.7893 0.960859 18 1.46957 18 2V16C18 16.5304 17.7893 17.0391 17.4142 17.4142C17.0391 17.7893 16.5304 18 16 18H2C1.46957 18 0.960859 17.7893 0.585786 17.4142C0.210714 17.0391 0 16.5304 0 16V2C0 1.46957 0.210714 0.960859 0.585786 0.585786C0.960859 0.210714 1.46957 0 2 0H16ZM15.5 15.5V10.2C15.5 9.33539 15.1565 8.5062 14.5452 7.89483C13.9338 7.28346 13.1046 6.94 12.24 6.94C11.39 6.94 10.4 7.46 9.92 8.24V7.13H7.13V15.5H9.92V10.57C9.92 9.8 10.54 9.17 11.31 9.17C11.6813 9.17 12.0374 9.3175 12.2999 9.58005C12.5625 9.8426 12.71 10.1987 12.71 10.57V15.5H15.5ZM3.88 5.56C4.32556 5.56 4.75288 5.383 5.06794 5.06794C5.383 4.75288 5.56 4.32556 5.56 3.88C5.56 2.95 4.81 2.19 3.88 2.19C3.43178 2.19 3.00193 2.36805 2.68499 2.68499C2.36805 3.00193 2.19 3.43178 2.19 3.88C2.19 4.81 2.95 5.56 3.88 5.56ZM5.27 15.5V7.13H2.5V15.5H5.27Z" />
    </svg>
  );
}

function Instagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M11.0286 0C12.1536 0.003 12.7246 0.009 13.2176 0.023L13.4116 0.03C13.6356 0.038 13.8566 0.0479999 14.1236 0.0599999C15.1876 0.11 15.9136 0.278 16.5506 0.525C17.2106 0.779 17.7666 1.123 18.3226 1.678C18.8313 2.17773 19.2248 2.78247 19.4756 3.45C19.7226 4.087 19.8906 4.813 19.9406 5.878C19.9526 6.144 19.9626 6.365 19.9706 6.59L19.9766 6.784C19.9916 7.276 19.9976 7.847 19.9996 8.972L20.0006 9.718V11.028C20.003 11.7574 19.9953 12.4868 19.9776 13.216L19.9716 13.41C19.9636 13.635 19.9536 13.856 19.9416 14.122C19.8916 15.187 19.7216 15.912 19.4756 16.55C19.2248 17.2175 18.8313 17.8223 18.3226 18.322C17.8228 18.8307 17.2181 19.2242 16.5506 19.475C15.9136 19.722 15.1876 19.89 14.1236 19.94L13.4116 19.97L13.2176 19.976C12.7246 19.99 12.1536 19.997 11.0286 19.999L10.2826 20H8.97357C8.24383 20.0026 7.51409 19.9949 6.78457 19.977L6.59057 19.971C6.35318 19.962 6.11584 19.9517 5.87857 19.94C4.81457 19.89 4.08857 19.722 3.45057 19.475C2.7834 19.2241 2.17901 18.8306 1.67957 18.322C1.17051 17.8224 0.776678 17.2176 0.525569 16.55C0.278569 15.913 0.110569 15.187 0.0605687 14.122L0.0305688 13.41L0.0255689 13.216C0.00713493 12.4868 -0.00119929 11.7574 0.000568797 11.028V8.972C-0.0021991 8.2426 0.00513501 7.5132 0.0225689 6.784L0.0295688 6.59C0.0375688 6.365 0.0475688 6.144 0.0595688 5.878C0.109569 4.813 0.277569 4.088 0.524569 3.45C0.776263 2.7822 1.17079 2.17744 1.68057 1.678C2.17972 1.16955 2.78376 0.776074 3.45057 0.525C4.08857 0.278 4.81357 0.11 5.87857 0.0599999C6.14457 0.0479999 6.36657 0.038 6.59057 0.03L6.78457 0.0239999C7.51376 0.00623271 8.24316 -0.0014347 8.97257 0.000999928L11.0286 0ZM10.0006 5C8.67449 5 7.40272 5.52678 6.46503 6.46447C5.52735 7.40215 5.00057 8.67392 5.00057 10C5.00057 11.3261 5.52735 12.5979 6.46503 13.5355C7.40272 14.4732 8.67449 15 10.0006 15C11.3267 15 12.5984 14.4732 13.5361 13.5355C14.4738 12.5979 15.0006 11.3261 15.0006 10C15.0006 8.67392 14.4738 7.40215 13.5361 6.46447C12.5984 5.52678 11.3267 5 10.0006 5ZM10.0006 7C10.3945 6.99993 10.7847 7.07747 11.1487 7.22817C11.5127 7.37887 11.8434 7.5998 12.122 7.87833C12.4007 8.15686 12.6217 8.48754 12.7725 8.85149C12.9233 9.21544 13.001 9.60553 13.0011 9.9995C13.0011 10.3935 12.9236 10.7836 12.7729 11.1476C12.6222 11.5116 12.4013 11.8423 12.1227 12.121C11.8442 12.3996 11.5135 12.6206 11.1496 12.7714C10.7856 12.9223 10.3955 12.9999 10.0016 13C9.20592 13 8.44286 12.6839 7.88025 12.1213C7.31764 11.5587 7.00157 10.7956 7.00157 10C7.00157 9.20435 7.31764 8.44129 7.88025 7.87868C8.44286 7.31607 9.20592 7 10.0016 7M15.2516 3.5C14.92 3.5 14.6021 3.6317 14.3677 3.86612C14.1333 4.10054 14.0016 4.41848 14.0016 4.75C14.0016 5.08152 14.1333 5.39946 14.3677 5.63388C14.6021 5.8683 14.92 6 15.2516 6C15.5831 6 15.901 5.8683 16.1355 5.63388C16.3699 5.39946 16.5016 5.08152 16.5016 4.75C16.5016 4.41848 16.3699 4.10054 16.1355 3.86612C15.901 3.6317 15.5831 3.5 15.2516 3.5Z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { Icon: Facebook, href: "https://www.facebook.com/ethixweb", label: "Facebook" },
  { Icon: Linkedin, href: "https://www.linkedin.com/company/ethixweb/", label: "LinkedIn" },
  { Icon: Instagram, href: "https://www.instagram.com/ethix.web/", label: "Instagram" },
] as const;

export function Footer() {
  return (
    <footer className="relative mt-12 overflow-hidden border-t border-border sm:mt-32">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <img
        src={FOOTER_MASCOT}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute hidden h-69.75 w-auto object-contain object-bottom opacity-95 lg:block"
        loading="lazy"
        decoding="async"
        style={{ right: "-25px", bottom: "-24px" }}
      />
      <div className="mx-auto max-w-7xl px-6 pt-10 pb-15.25 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-6 max-w-sm text-sm text-muted-foreground leading-relaxed">
              Revamp your online presence with bespoke designs crafted for your business success.
            </p>
            <div className="mt-6 flex gap-3">
              {SOCIAL_LINKS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full glass text-foreground transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 hover:bg-[linear-gradient(135deg,#d13a40,#8a181c)]! hover:border-[#c0272d]! hover:text-white! hover:shadow-[0_6px_18px_rgba(192,39,45,0.35)]!"
                >
                  <Icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Contact
            </h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-primary mt-0.5" />
                <a
                  href="mailto:info@ethixweb.com"
                  className="text-foreground/85 hover:text-primary"
                >
                  info@ethixweb.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-primary mt-0.5" />
                <span className="text-foreground/85">Mon–Fri · 9:00 AM – 5:00 PM</span>
              </li>
            </ul>
          </div>

          <FooterCol title="Company" links={COMPANY_LINKS} />
          <FooterCol title="Useful Links" links={USEFUL_LINKS} />
        </div>
        <div className="footer-divider relative mt-16 flex flex-col gap-4 sm:flex-row items-center justify-between border-t border-border pt-8">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Ethixweb. All rights reserved.
          </p>
          <img
            src="/Ethan%20view%208.webp"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute block sm:hidden w-auto object-contain"
            style={{ height: "202px", right: "-70px", bottom: "-61px" }}
            loading="lazy"
            decoding="async"
          />
          <a
            href="https://calendly.com/ethixweb-agency/30min?month=2026-06"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative z-10 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Book an appointment{" "}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">{title}</h2>
      <ul className="space-y-2.5">
        {links.map(([label, to]) => (
          <li key={to}>
            {LIVE_PATHS.has(to) ? (
              <Link
                to={to}
                className="text-sm text-foreground/80 hover:text-primary transition-colors"
              >
                {label}
              </Link>
            ) : (
              <span className="inline-flex cursor-not-allowed select-none">
                <span className="text-sm text-foreground/65">{label}</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
