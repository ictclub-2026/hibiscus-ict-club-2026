import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Flower,
  Rocket,
  ArrowRight,
  UsersThree,
  IdentificationCard,
  Megaphone,
  Trophy,
  Cpu,
  GlobeHemisphereWest,
  Sparkle,
  CalendarCheck,
} from "@phosphor-icons/react";
import type { Announcement, PageId, SiteSettings, PageBackground, User, Project, Activity, AttendanceSession } from "../types";

interface HeroProps {
  settings: SiteSettings;
  announcements: Announcement[];
  background: PageBackground;
  setPage: (p: PageId) => void;
  openAuth: () => void;
  openSubmit: () => void;
  users?: User[];
  projects?: Project[];
  activities?: Activity[];
  attendanceSessions?: AttendanceSession[];
}

const EAC_COUNTRIES = ["Uganda", "Tanzania", "Kenya", "Rwanda", "Burundi", "South Sudan"];

function useCountUp(target: number, run: boolean) {
  const [val, setVal] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!run) return;
    if (reduced) { setVal(target); return; }
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, reduced]);
  return val;
}

function Stat({ n, suffix, label, icon }: { n: number; suffix: string; label: string; icon: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setRun(true), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const v = useCountUp(n, run);
  return (
    <div ref={ref} className="glass group rounded-2xl p-5 text-center transition hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/10">
      <div className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-rose-500/15 to-violet-500/15 text-rose-600 transition group-hover:scale-110 dark:text-rose-400">
        {icon}
      </div>
      <p className="font-mono text-3xl font-bold text-zinc-900 dark:text-white">
        {v}<span className="text-rose-500">{suffix}</span>
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}

function BackgroundLayer({ bg }: { bg: PageBackground }) {
  if (!bg || bg.type === "none") return null;
  if (bg.type === "gradient") {
    return <div className={`absolute inset-0 -z-20 bg-gradient-to-br ${bg.value} opacity-20`} />;
  }
  return (
    <div className="absolute inset-0 -z-20 overflow-hidden">
      <img src={bg.value} alt="" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black" style={{ opacity: bg.overlay / 100 }} />
    </div>
  );
}

export default function HeroAndStats({ settings, announcements, background, setPage, openAuth, openSubmit, users, projects, activities, attendanceSessions }: HeroProps) {
  const reduced = useReducedMotion();
  const latest = announcements[0];

  // Live stats derived from current application state.
  const memberCount = users?.length ?? 0;
  const projectCount = projects?.filter((p) => p.approved !== false).length ?? 0;
  const sessionCount = (attendanceSessions?.length ?? 0) || (activities?.filter((a) => a.category === "Workshop" || a.status === "completed").length ?? 0);
  const eacCountryCount = new Set((users ?? []).map((u) => u.nationality).filter((n) => EAC_COUNTRIES.includes(n))).size;

  return (
    <section className="relative overflow-hidden">
      <BackgroundLayer bg={background} />
      {/* Aurora background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-rose-500/30 blur-3xl animate-glow" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-violet-600/30 blur-3xl animate-glow [animation-delay:1s]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-500/25 blur-3xl animate-glow [animation-delay:2s]" />
        <div className="grain absolute inset-0 opacity-40" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-20">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400"
          >
            <Sparkle weight="fill" className="h-3.5 w-3.5" />
            {settings.clubName} • {settings.year} Edition
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tighter text-zinc-900 sm:text-6xl dark:text-white"
          >
            <span className="text-gradient">{settings.heroHeadline || settings.motto}</span>
            <br />
            <span className="text-zinc-900 dark:text-white">{settings.heroSubheadline || settings.theme}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-5 max-w-[52ch] text-base leading-relaxed text-zinc-600 dark:text-zinc-300"
          >
            {settings.heroTagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-7 flex flex-wrap gap-3"
          >
            <button onClick={() => setPage("projects")} className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition hover:scale-[1.03] active:scale-95">
              Explore Projects
              <ArrowRight weight="bold" className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
            <button onClick={openSubmit} className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white/60 px-6 py-3 text-sm font-bold text-zinc-800 transition hover:border-rose-500/40 hover:text-rose-600 dark:border-white/15 dark:bg-white/5 dark:text-white">
              <Rocket weight="fill" className="h-4 w-4" /> Submit Work
            </button>
            <button onClick={openAuth} className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-500/20 dark:text-emerald-300">
              <IdentificationCard weight="bold" className="h-4 w-4" /> Join Club
            </button>
          </motion.div>

          {latest && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-7 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
              <div className="flex items-start gap-3">
                <Megaphone weight="fill" className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">Patron Broadcast</p>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{latest.title}</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">{latest.content}</p>
                </div>
              </div>
              <button onClick={() => setPage("broadcasts")} className="mt-2 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300 transition">
                View all bulletins <ArrowRight weight="bold" className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </div>

        {/* Floating emblem card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mx-auto hidden w-full max-w-sm lg:block"
        >
          <div className={`glass rounded-[2rem] p-8 ${reduced ? "" : "animate-float"}`}>
            <div className="mx-auto grid h-28 w-28 place-items-center overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-fuchsia-600 to-indigo-600 text-white shadow-2xl shadow-rose-500/40">
              {settings.clubLogo ? (
                <img src={settings.clubLogo} alt={`${settings.clubName} logo`} className="h-full w-full object-cover" />
              ) : (
                <Flower weight="fill" className="h-14 w-14" />
              )}
            </div>
            <p className="mt-6 text-center text-lg font-extrabold text-zinc-900 dark:text-white">{settings.motto}</p>
            <p className="text-center text-sm font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">{settings.theme}</p>
            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              {[
                { k: "Innovate", i: <Cpu weight="fill" className="h-5 w-5" /> },
                { k: "Compete", i: <Trophy weight="fill" className="h-5 w-5" /> },
                { k: "Connect", i: <GlobeHemisphereWest weight="fill" className="h-5 w-5" /> },
              ].map((x) => (
                <div key={x.k} className="rounded-xl bg-zinc-100/70 p-3 dark:bg-white/5">
                  <div className="mx-auto mb-1 text-violet-600 dark:text-violet-400">{x.i}</div>
                  <p className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">{x.k}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -right-4 -top-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 px-4 py-2 text-xs font-black text-white shadow-lg">
            EST. {settings.year}
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 pb-16 sm:px-6 lg:grid-cols-4">
        <Stat n={memberCount} suffix="" label="Active Tech-Benders" icon={<UsersThree weight="fill" className="h-5 w-5" />} />
        <Stat n={projectCount} suffix="" label="Completed Projects" icon={<Cpu weight="fill" className="h-5 w-5" />} />
        <Stat n={sessionCount} suffix="" label="Attendance Sessions" icon={<CalendarCheck weight="fill" className="h-5 w-5" />} />
        <Stat n={eacCountryCount} suffix="" label="EAC Countries" icon={<GlobeHemisphereWest weight="fill" className="h-5 w-5" />} />
      </div>
    </section>
  );
}