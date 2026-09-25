"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { HeroIllustration } from "@/components/HeroIllustration";

const FEATURES = [
  {
    n: "01",
    title: "Route optimization",
    body: "Nearest-neighbor construction with a 2-opt refinement pass clusters your selected attractions by proximity and sequences them across however many days your trip runs."
  },
  {
    n: "02",
    title: "Opening-hours aware",
    body: "Every stop is checked against real opening and closing times. Anything scheduled too close to closing gets flagged before you commit to the plan."
  },
  {
    n: "03",
    title: "Live budget tracking",
    body: "Hotel, food, fuel, tickets, and miscellaneous costs recalculate instantly as you build the trip, split evenly across travelers when you need it."
  }
];

export default function Home() {
  return (
    <main id="main-content">
      {/* ---------- Hero ---------- */}
      <section className="relative min-h-screen overflow-hidden">
        <HeroIllustration />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A1F] via-[#0A1A1F]/10 to-transparent" />

        <Navbar variant="hero" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-14 pt-48 pb-24 min-h-screen flex flex-col justify-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}
            className="border-t border-white/15 pt-10"
          >
            <div className="grid lg:grid-cols-[2fr_1fr] gap-10 items-end">
              <h1 className="font-display text-[13vw] leading-[0.92] md:text-[7.5rem] font-normal text-[#EFEAE0]">
                Every trip,<br />
                <span className="italic font-light text-[#A9BBB5]">planned</span> to the minute.
              </h1>
              <div className="pb-2">
                <p className="text-[#A9BBB5] text-base leading-relaxed mb-8 max-w-xs">
                  A route-optimization travel planner. Real nearest-neighbor + 2-opt
                  sequencing, opening-hours checks, and a live budget tracker — not a
                  templated itinerary generator.
                </p>
                <div className="flex flex-col gap-3 items-start">
                  <Link href="/signup" className="group inline-flex items-center gap-3 text-[#EFEAE0] text-sm font-semibold tracking-wide uppercase">
                    Plan your first trip
                    <span className="w-8 h-px bg-coral group-hover:w-12 transition-all duration-300" />
                  </Link>
                  <Link href="/example" className="text-[#A9BBB5] text-sm hover:text-coral transition-colors">
                    See an example trip →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------- Editorial feature list ---------- */}
      <section className="max-w-[1400px] mx-auto px-8 md:px-14 py-32">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-10 mb-16">
          <div className="text-xs font-semibold tracking-widest uppercase text-coral">Why Waypoint</div>
          <h2 className="font-display text-3xl md:text-5xl font-normal max-w-2xl leading-tight">
            Built on real optimization,<br /><span className="italic text-harbor/50 dark:text-[#A9BBB5]">not a template.</span>
          </h2>
        </div>

        <div className="border-t border-mist dark:border-[#28403F]">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="grid md:grid-cols-[100px_1fr_1.4fr] gap-6 md:gap-10 items-baseline py-10 border-b border-mist dark:border-[#28403F] group"
            >
              <div className="font-display text-3xl text-harbor/25 dark:text-[#EFEAE0]/20 group-hover:text-coral transition-colors duration-300">{f.n}</div>
              <h3 className="font-display text-2xl font-normal">{f.title}</h3>
              <p className="text-sm text-harbor/60 dark:text-[#A9BBB5] leading-relaxed max-w-md">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- Closing CTA ---------- */}
      <section className="max-w-[1400px] mx-auto px-8 md:px-14 pb-32">
        <div className="border-t border-mist dark:border-[#28403F] pt-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <h2 className="font-display text-4xl md:text-6xl font-normal max-w-xl leading-[1.05]">
            Start with a destination.<br />
            <span className="italic text-harbor/50 dark:text-[#A9BBB5]">End with a route.</span>
          </h2>
          <Link href="/signup" className="btn-primary flex-shrink-0">Plan your trip →</Link>
        </div>
      </section>

      <footer className="border-t border-mist dark:border-[#28403F]">
        <div className="max-w-[1400px] mx-auto px-8 md:px-14 py-10 flex flex-wrap items-center justify-between gap-6 text-sm text-harbor/60 dark:text-[#A9BBB5]">
          <div className="flex items-center gap-2 font-display font-semibold text-harbor dark:text-[#EFEAE0]">
            <span className="w-2 h-2 rounded-full bg-coral inline-block" aria-hidden="true" />
            Waypoint
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-2 text-xs uppercase tracking-wide" aria-label="Footer">
            <Link href="/example" className="hover:text-coral">Example trip</Link>
            <Link href="/signup" className="hover:text-coral">Sign up</Link>
            <Link href="/login" className="hover:text-coral">Log in</Link>
            <a href="mailto:support@waypoint.app" className="hover:text-coral">Contact</a>
          </nav>
          <p className="text-xs">© {new Date().getFullYear()} Waypoint</p>
        </div>
      </footer>
    </main>
  );
}
