import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlass,
  Heart,
  GithubLogo,
  LinkSimple,
  Calendar,
  MapPin,
  UsersThree,
  Download,
  X,
  Check,
  Cpu,
  Robot,
  Brain,
  Palette,
  GlobeHemisphereWest,
  ArrowUp,
  Rocket,
  Sparkle,
  Flag,
  Trash,
  Lightning,
  Copy,
  ArrowSquareOut,
  CalendarPlus,
  SealCheck,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import type { Activity, PageBackground, Project, ProjectCategory, User } from "../types";
import { PROJECT_CATEGORIES } from "../mockData";
import ProjectLiveDemoModal from "./ProjectLiveDemoModal";
import { getGoogleSearchQuery } from "@/lib/utils";

const CAT_ICON: Record<ProjectCategory, React.ReactNode> = {
  "Web & Apps": <GlobeHemisphereWest weight="fill" className="h-5 w-5" />,
  "Robotics & IoT": <Robot weight="fill" className="h-5 w-5" />,
  "AI & Data": <Brain weight="fill" className="h-5 w-5" />,
  "Graphic & UI Design": <Palette weight="fill" className="h-5 w-5" />,
};

function BgLayer({ bg }: { bg: PageBackground }) {
  if (!bg || bg.type === "none") return null;
  if (bg.type === "gradient") return <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${bg.value} opacity-10`} />;
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <img src={bg.value} alt="" className="h-full w-full object-cover opacity-10" />
      <div className="absolute inset-0 bg-black" style={{ opacity: bg.overlay / 200 }} />
    </div>
  );
}

interface Props {
  projects: Project[];
  activities: Activity[];
  background: PageBackground;
  onVote: (id: string) => void;
  onSubmitClick: () => void;
  user?: User | null;
  onDeleteProject?: (id: string) => void;
  votedProjectIds?: string[];
  onAddActivityClick?: () => void;
  deepLinkProjectId?: string | null;
  onDeepLinkHandled?: () => void;
}

export default function ProjectsAndActivities({ projects, activities, background, onVote, onSubmitClick, user, onDeleteProject, votedProjectIds, onAddActivityClick, deepLinkProjectId, onDeepLinkHandled }: Props) {
  const [cat, setCat] = useState<ProjectCategory | "All">("All");
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<Project | null>(null);
  const [liveDemo, setLiveDemo] = useState<Project | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const isPatron = user?.role === "patron";

  const copyLink = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}?project=${id}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => toast.success("Project link copied to clipboard")).catch(() => toast.error("Could not copy link"));
    } else {
      toast.error("Clipboard is not available in this browser");
    }
  };

  useEffect(() => {
    if (!deepLinkProjectId) return;
    const p = projects.find((x) => x.id === deepLinkProjectId);
    if (p) setLiveDemo(p);
    else toast.error("No project found for this link");
    onDeepLinkHandled?.();
  }, [deepLinkProjectId]);

  const approved = useMemo(() => projects.filter((p) => p.approved), [projects]);

  const filtered = useMemo(() => {
    return approved
      .filter((p) => (cat === "All" ? true : p.category === cat))
      .filter((p) => q.trim() ? (p.title + p.description + p.techStack.join(" ")).toLowerCase().includes(q.toLowerCase()) : true)
      .sort((a, b) => b.votes - a.votes);
  }, [approved, cat, q]);

  return (
    <div className="relative space-y-20">
      <BgLayer bg={background} />
      {/* PROJECTS */}
      <section id="projects" className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">Student Showcase</p>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tighter text-zinc-900 sm:text-4xl dark:text-white">Projects Hub</h2>
            <p className="mt-2 max-w-[55ch] text-sm text-zinc-600 dark:text-zinc-300">
              Real builds from the Tech-Benders. Upvote your favourite, open the details, or submit your own work.
            </p>
          </div>
          <button onClick={onSubmitClick} className="flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition hover:scale-[1.03] active:scale-95">
            <Rocket weight="fill" className="h-4 w-4" /> Upload &amp; Submit
          </button>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {(["All", ...PROJECT_CATEGORIES] as const).map((c) => (
              <button key={c} onClick={() => setCat(c as ProjectCategory | "All")} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${cat === c ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "border border-zinc-200 bg-white/60 text-zinc-600 hover:border-rose-500/40 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="relative">
            <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects, tech stack..." className="w-full rounded-full border border-zinc-200 bg-white/70 py-2 pl-9 pr-4 text-sm text-zinc-800 outline-none transition focus:border-rose-500/50 sm:w-72 dark:border-white/10 dark:bg-white/5 dark:text-white" />
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="mt-10 grid place-items-center rounded-3xl border border-dashed border-zinc-300 py-16 text-center dark:border-white/15">
            <Sparkle weight="fill" className="h-8 w-8 text-zinc-300" />
            <p className="mt-3 font-bold text-zinc-700 dark:text-zinc-200">No projects match your search</p>
            <p className="text-sm text-zinc-500">Try another category or be the first to submit.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <motion.article key={p.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.06 }} className="group glass flex flex-col overflow-hidden rounded-3xl transition hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-violet-500/10">
                <div className={`relative h-32 ${p.image ? "" : `bg-gradient-to-br ${p.gradient}`}`}>
                  {p.image ? <img src={p.image} alt={p.title} className="h-full w-full object-cover" /> : <div className="grain absolute inset-0 opacity-30" />}
                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/25 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                    {CAT_ICON[p.category]}{p.category}
                  </div>
                  <button onClick={() => onVote(p.id)} title={votedProjectIds?.includes(p.id) ? "Remove your vote" : "Upvote this project"} className={`absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black shadow transition hover:scale-105 active:scale-90 ${votedProjectIds?.includes(p.id) ? "bg-rose-600 text-white" : "bg-white/90 text-rose-600"}`}>
                    <Heart weight="fill" className="h-3.5 w-3.5" />
                    <motion.span key={p.votes} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="inline-block tabular-nums">{p.votes}</motion.span>
                    {votedProjectIds?.includes(p.id) && <SealCheck weight="fill" className="h-3 w-3" />}
                  </button>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-extrabold leading-tight text-zinc-900 dark:text-white">{p.title}</h3>
                  <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">{p.author}</p>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm text-zinc-600 dark:text-zinc-300">{p.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.techStack.slice(0, 4).map((t) => (
                      <span key={t} className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-600 dark:bg-white/10 dark:text-zinc-300">{t}</span>
                    ))}
                  </div>
                                     <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-white/10">
                                           <div className="flex items-center gap-3">
                        <button onClick={() => setDetail(p)} className="text-sm font-bold text-violet-600 hover:underline dark:text-violet-400">View details</button>
                        <button onClick={() => setLiveDemo(p)} className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm transition hover:scale-105 active:scale-95">
                          <Lightning weight="fill" className="h-3 w-3" /> Demo
                        </button>
                        <a href={`https://www.google.com/search?q=${encodeURIComponent(getGoogleSearchQuery(p))}`} target="_blank" rel="noopener noreferrer" title="Search on Google" className="flex items-center gap-1 rounded-full bg-cyan-500/10 px-2.5 py-1 text-[11px] font-bold text-cyan-700 transition hover:bg-cyan-500/20 dark:text-cyan-400">
                          <MagnifyingGlass weight="bold" className="h-3 w-3" /> Google
                        </a>
                      </div>
                                           <div className="flex items-center gap-2 text-zinc-400">
                        <button onClick={() => copyLink(p.id)} title="Copy share link" className="transition hover:text-violet-600 dark:hover:text-violet-400"><Copy weight="bold" className="h-5 w-5" /></button>
                        {p.repoUrl && <a href={p.repoUrl} target="_blank" rel="noreferrer" className="hover:text-zinc-700 dark:hover:text-white"><GithubLogo weight="fill" className="h-5 w-5" /></a>}
                       {p.demoUrl && <a href={p.demoUrl} target="_blank" rel="noreferrer" className="hover:text-zinc-700 dark:hover:text-white"><LinkSimple weight="bold" className="h-5 w-5" /></a>}
                       {isPatron && onDeleteProject && (
                         confirmDel === p.id ? (
                           <span className="flex items-center gap-1">
                             <button onClick={() => { onDeleteProject(p.id); setConfirmDel(null); }} className="flex items-center gap-1 rounded-lg bg-rose-500/15 px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-500/25 dark:text-rose-400"><Trash weight="bold" className="h-3.5 w-3.5" /> Confirm</button>
                             <button onClick={() => setConfirmDel(null)} className="grid h-6 w-6 place-items-center rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10"><X weight="bold" className="h-3.5 w-3.5" /></button>
                           </span>
                         ) : (
                           <button onClick={() => setConfirmDel(p.id)} title="Delete project" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-rose-500/10 hover:text-rose-500"><Trash weight="bold" className="h-5 w-5" /></button>
                         )
                       )}
                     </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      {/* ACTIVITIES */}
      <section id="activities" className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">Club Sessions</p>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tighter text-zinc-900 sm:text-4xl dark:text-white">Activities &amp; Workshops Log</h2>
            <p className="mt-2 max-w-[55ch] text-sm text-zinc-600 dark:text-zinc-300">
              A chronological record of every Tech-Benders session, hackathon and exhibition.
            </p>
          </div>
          {onAddActivityClick && (
            <button onClick={onAddActivityClick} className="flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:scale-[1.03] active:scale-95">
              <CalendarPlus weight="fill" className="h-4 w-4" /> Add Activity
            </button>
          )}
        </div>

        {activities.length === 0 ? (
          <div className="mt-10 grid place-items-center rounded-3xl border border-dashed border-zinc-300 py-16 text-center dark:border-white/15">
            <CalendarPlus weight="fill" className="h-8 w-8 text-zinc-300" />
            <p className="mt-3 font-bold text-zinc-700 dark:text-zinc-200">No activities logged yet</p>
            <p className="text-sm text-zinc-500">Workshops, hackathons and meetups will appear here once scheduled.</p>
          </div>
        ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...activities].sort((a, b) => a.date.localeCompare(b.date)).map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.05 }} className="glass relative overflow-hidden rounded-3xl">
              {a.image && <img src={a.image} alt={a.title} className="h-32 w-full object-cover" />}
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${a.status === "completed" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"}`}>
                    {a.status === "completed" ? <Check weight="bold" className="h-3 w-3" /> : <Flag weight="fill" className="h-3 w-3" />}
                    {a.status}
                  </span>
                  <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-bold text-violet-600 dark:text-violet-400">{a.category}</span>
                </div>
                <h3 className="mt-3 text-lg font-extrabold text-zinc-900 dark:text-white">{a.title}</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{a.description}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1"><Calendar weight="bold" className="h-3.5 w-3.5" /> {a.date}</span>
                  <span className="flex items-center gap-1"><MapPin weight="bold" className="h-3.5 w-3.5" /> {a.location}</span>
                  <span className="flex items-center gap-1"><UsersThree weight="bold" className="h-3.5 w-3.5" /> {a.attendeesCount} attendees</span>
                </div>
                {a.resources.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-100 pt-3 dark:border-white/10">
                    {a.resources.map((r) => (
                      <button key={r} onClick={() => toast.success(`Downloading ${r}`)} className="flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600 transition hover:bg-rose-500/10 hover:text-rose-600 dark:bg-white/5 dark:text-zinc-300">
                        <Download weight="bold" className="h-3.5 w-3.5" /> {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        )}
      </section>

      {/* Detail modal */}
      <AnimatePresence>
        {detail && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setDetail(null)}>
            <motion.div initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-zinc-900">
              <div className={`relative h-36 ${detail.image ? "" : `bg-gradient-to-br ${detail.gradient}`}`}>
                {detail.image ? <img src={detail.image} alt={detail.title} className="h-full w-full object-cover" /> : <div className="grain absolute inset-0 opacity-30" />}
                <button onClick={() => setDetail(null)} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-zinc-700"><X weight="bold" className="h-4 w-4" /></button>
                <div className="absolute bottom-3 left-4 flex items-center gap-2 rounded-full bg-white/25 px-3 py-1 text-xs font-bold text-white backdrop-blur">{CAT_ICON[detail.category]} {detail.category}</div>
              </div>
              <div className="max-h-[50vh] overflow-y-auto p-6">
                <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white">{detail.title}</h3>
                <p className="mt-1 text-sm font-bold text-rose-600 dark:text-rose-400">by {detail.author}</p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{detail.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {detail.techStack.map((t) => (
                    <span key={t} className="flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1 font-mono text-xs text-zinc-600 dark:bg-white/10 dark:text-zinc-300"><Cpu weight="bold" className="h-3 w-3" /> {t}</span>
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 rounded-xl bg-zinc-50 p-3 dark:bg-white/5">
                    <ArrowUp weight="bold" className="h-4 w-4 text-rose-500" />
                    <span className="font-bold text-zinc-800 dark:text-white">{detail.votes}</span>
                    <span className="text-zinc-500">votes</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-zinc-50 p-3 dark:bg-white/5">
                    <Calendar weight="bold" className="h-4 w-4 text-violet-500" />
                    <span className="text-zinc-600 dark:text-zinc-300">{detail.submissionDate}</span>
                  </div>
                </div>
                                 <div className="mt-5 flex flex-wrap gap-3">
                   <button onClick={() => { setLiveDemo(detail); setDetail(null); }} className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition hover:scale-[1.03] active:scale-95">
                     <Lightning weight="fill" className="h-4 w-4" /> Launch Live Demo
                   </button>
                   {detail.demoUrl && <a href={detail.demoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-bold text-zinc-700 dark:border-white/15 dark:text-white"><LinkSimple weight="bold" className="h-4 w-4" /> Open URL</a>}
                  {detail.repoUrl && <a href={detail.repoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-bold text-zinc-700 dark:border-white/15 dark:text-white"><GithubLogo weight="fill" className="h-4 w-4" /> Source Code</a>}
                                      <button onClick={() => { onVote(detail.id); }} className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold ${votedProjectIds?.includes(detail.id) ? "border-rose-600 bg-rose-600 text-white" : "border-rose-300 text-rose-600 dark:border-rose-500/30"}`}><Heart weight="fill" className="h-4 w-4" /> {votedProjectIds?.includes(detail.id) ? "Voted" : "Upvote"}</button>
                    <button onClick={() => copyLink(detail.id)} className="flex items-center gap-2 rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-bold text-zinc-700 dark:border-white/15 dark:text-white"><Copy weight="bold" className="h-4 w-4" /> Copy Link</button>
                    <a href={`https://www.google.com/search?q=${encodeURIComponent(getGoogleSearchQuery(detail))}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-bold text-zinc-700 transition hover:border-cyan-500/50 hover:text-cyan-600 dark:border-white/15 dark:text-white dark:hover:text-cyan-400"><MagnifyingGlass weight="bold" className="h-4 w-4" /> Search on Google</a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Demo Modal */}
      <ProjectLiveDemoModal project={liveDemo} open={!!liveDemo} onClose={() => setLiveDemo(null)} />
    </div>
  );
}