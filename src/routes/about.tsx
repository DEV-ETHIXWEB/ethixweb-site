import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Target, Heart, Zap, ArrowUpRight, Globe2, ShieldCheck, Workflow } from "lucide-react";
import operatorCharacter from "@/assets/operator-character.png";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About - Ethixweb" },
      {
        name: "description",
        content:
          "Ethixweb is a small, senior team helping US home service contractors grow with marketing that moves revenue.",
      },
      { property: "og:title", content: "About Ethixweb" },
      {
        property: "og:description",
        content: "Our story, how we work and why home service contractors trust us.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <PageHero eyebrow="About us" title="A small, senior team. No account managers.">
        Ethixweb is a digital marketing &amp; web development agency built for businesses that want
        measurable growth - not marketing noise.
      </PageHero>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <motion.div
              className="relative mx-auto max-w-sm"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute inset-6 rounded-full bg-primary/20 blur-[90px]" />
              <div className="relative h-130">
                <img
                  src={operatorCharacter}
                  alt="Ethixweb team"
                  loading="lazy"
                  decoding="async"
                  className="absolute bottom-0 left-1/2 z-10 h-125 max-w-none -translate-x-1/2 object-contain drop-shadow-[0_24px_60px_rgba(0,0,0,0.65)]"
                />
                {[
                  { label: "US-Focused Ops", icon: Globe2, style: { top: "8%", left: "0%" } },
                  { label: "Senior Team", icon: ShieldCheck, style: { top: "42%", left: "0%" } },
                  {
                    label: "Strategy to Launch",
                    icon: Workflow,
                    style: { bottom: "8%", left: "12%" },
                  },
                ].map((badge, i) => (
                  <motion.div
                    key={badge.label}
                    className="absolute z-20 flex items-center gap-2 rounded-full border border-white/10 bg-[#1A1A24]/90 px-4 py-2.5 shadow-lg backdrop-blur-md"
                    style={badge.style}
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.08 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12, type: "spring", stiffness: 280, damping: 20 }}
                  >
                    <badge.icon className="h-4 w-4 shrink-0 text-primary" />
                    <span className="whitespace-nowrap text-sm font-semibold text-white">
                      {badge.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-sm uppercase tracking-widest text-primary">Our story</p>
            <h2 className="mt-4 font-display text-4xl font-bold text-gradient">
              Built for contractors tired of big-agency theater.
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Founded in 2023 by Amardeep, Ethixweb specializes in helping US home service
              businesses - plumbing, HVAC and electrical contractors - generate qualified leads,
              book more jobs and build long-term authority in their local markets.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Beyond home services, we also partner with select brands on custom web builds,
              headless migrations, conversion tracking setups and full-stack marketing support
              across industries. Based in India, with a US presence, serving clients across North
              America.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl grid md:grid-cols-3 gap-5">
          {[
            {
              icon: Target,
              t: "Revenue-obsessed",
              d: "We measure success in booked jobs and revenue - not impressions, clicks or awards.",
            },
            {
              icon: Heart,
              t: "Senior team only",
              d: "You talk directly to the people doing the work. No layers, no handoffs, no jargon.",
            },
            {
              icon: Zap,
              t: "Move fast, ship clean",
              d: "Lean process, weekly iteration. We launch in weeks and optimize forever.",
            },
          ].map((v, i) => (
            <Reveal key={v.t} delay={i * 0.08}>
              <div className="glass rounded-3xl p-8 h-full">
                <v.icon className="h-10 w-10 text-primary mb-6" strokeWidth={1.5} />
                <h3 className="font-display text-xl font-semibold">{v.t}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{v.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl glass-strong rounded-[2rem] p-12 text-center">
          <h2 className="font-display text-4xl font-bold text-gradient">Want to work with us?</h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            If you're a contractor tired of being one of 200 accounts at a big agency, let's talk.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 font-medium shadow-glow"
          >
            Get in touch <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
