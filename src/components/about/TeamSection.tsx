import { useRef, type PointerEvent } from "react";
import { BarChart3, Code2, PenLine, PenTool, type LucideIcon } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { EditorialHeader } from "@/components/shared/EditorialHeader";

type Member = {
  name: string;
  role: string;
  note: string;
  photo: string;
  photoSmall: string;
  /** Pixel width of photoSmall. */
  smallWidth: number;
  width: number;
  height: number;
};

const MEMBERS: Member[] = [
  {
    name: "Amar Singh",
    role: "Head of Client Acquisition",
    note: "Usually your first call at Ethixweb. He learns how your business runs, then maps out what will actually bring in more booked jobs.",
    photo: "/images/team/amar.webp",
    photoSmall: "/images/team/amar-480.webp",
    smallWidth: 404,
    width: 758,
    height: 900,
  },
  {
    name: "Akash Lakhwan",
    role: "Head of Operations",
    note: "Runs delivery across every client, from websites and AI answering to tracking, and checks every piece of work before it goes live.",
    photo: "/images/team/akash.webp",
    photoSmall: "/images/team/akash-480.webp",
    smallWidth: 480,
    width: 900,
    height: 900,
  },
  {
    name: "Prateek Dwivedi",
    role: "Growth & Automation Engineer",
    note: "Builds the integrations and automations behind our clients' lead flow, and manages their Google Ads accounts.",
    photo: "/images/team/prateek.webp",
    photoSmall: "/images/team/prateek-480.webp",
    smallWidth: 400,
    width: 430,
    height: 430,
  },
];

const CRAFTS: { icon: LucideIcon; label: string }[] = [
  { icon: PenTool, label: "Design" },
  { icon: Code2, label: "Development" },
  { icon: PenLine, label: "Content" },
  { icon: BarChart3, label: "Ads & tracking" },
];

/** Tilts the card toward the pointer. Fine pointers only, and never for
 * reduced-motion users; the values live in CSS variables so the browser
 * composites the transform without React re-rendering. */
function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 9).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };
  return { ref, onPointerMove: onMove, onPointerLeave: onLeave };
}

function MemberCard({ m, i }: { m: Member; i: number }) {
  const tilt = useTilt();
  return (
    <Reveal delay={0.06 * i} as="li" className="h-full">
      <div className="team-card-stage h-full pt-16">
        <div {...tilt} className="team-card group relative flex h-full flex-col rounded-[1.75rem]">
          <div className="team-card-face absolute inset-0 overflow-hidden rounded-[1.75rem]" aria-hidden="true">
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div className="team-card-glow absolute inset-0" />
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary-text/70 to-transparent" />
          </div>

          {/* The portrait sits on the card's back plane and rises out of its
              top edge, so the person reads as standing in front of it. */}
          <div className="relative -mt-16 flex h-64 items-end justify-center sm:h-72">
            <div className="team-halo absolute bottom-6 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full" aria-hidden="true" />
            <img
              src={m.photo}
              srcSet={`${m.photoSmall} ${m.smallWidth}w, ${m.photo} ${m.width}w`}
              sizes="(min-width: 1024px) 300px, (min-width: 640px) 40vw, 80vw"
              width={m.width}
              height={m.height}
              alt={`${m.name}, ${m.role} at Ethixweb`}
              loading="lazy"
              decoding="async"
              className="team-photo relative h-full w-auto max-w-full object-contain object-bottom"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" aria-hidden="true" />
          </div>

          <div className="relative flex flex-1 flex-col px-7 pb-8 pt-2">
            <p className="inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-primary-text">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
              {m.role}
            </p>
            <h3 className="mt-4 font-display text-2xl font-bold tracking-tight">{m.name}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.note}</p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function CrewCard() {
  const tilt = useTilt();
  return (
    <Reveal delay={0.18} as="li" className="h-full">
      <div className="team-card-stage h-full pt-16">
        <div {...tilt} className="team-card group relative flex h-full flex-col rounded-[1.75rem]">
          <div className="team-card-face absolute inset-0 overflow-hidden rounded-[1.75rem]" aria-hidden="true">
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div className="team-card-glow absolute inset-0" />
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary-text/70 to-transparent" />
          </div>

          <div className="relative flex h-64 items-center justify-center pt-2 sm:h-56 sm:pt-4">
            <div className="team-halo absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full" aria-hidden="true" />
            <ul className="relative grid grid-cols-2 gap-3" aria-label="Crafts on the team">
              {CRAFTS.map((c, k) => (
                <li
                  key={c.label}
                  className={`team-chip flex h-[88px] w-[104px] flex-col items-center justify-center gap-2 rounded-2xl ${k % 2 ? "translate-y-3" : ""}`}
                >
                  <c.icon className="h-5 w-5 text-primary-text" aria-hidden="true" />
                  <span className="text-[11px] font-semibold text-foreground/90">{c.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex flex-1 flex-col px-7 pb-8 pt-2">
            <p className="inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-primary-text">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
              The wider team
            </p>
            <h3 className="mt-4 font-display text-2xl font-bold tracking-tight">The people behind every build</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Designers, developers, writers and ad specialists who design, build, write and track
              every project with us, and stay with it after launch.
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function TeamSection() {
  return (
    <section id="team" className="scroll-mt-24 py-20">
      <Container>
        <EditorialHeader
          className="mb-6"
          index="02"
          eyebrow="The team"
          title="The people you'll work with."
          sub="No account managers in between. These are the people on your calls, in your accounts and on your project."
        />
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {MEMBERS.map((m, i) => (
            <MemberCard key={m.name} m={m} i={i} />
          ))}
          <CrewCard />
        </ul>
      </Container>
    </section>
  );
}
