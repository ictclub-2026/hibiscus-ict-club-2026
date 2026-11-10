import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  WarningCircle,
  Info,
  CheckCircle,
  Calendar,
  Users,
  X,
  Plus,
  ShieldStar,
  ListBullets,
  Broadcast,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import type { Announcement, Priority, User, PageBackground } from "../types";

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; icon: React.ReactNode; ring: string }> = {
  high: {
    label: "Urgent",
    color: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    icon: <WarningCircle weight="fill" className="h-4 w-4" />,
    ring: "border-l-rose-500",
  },
  normal: {
    label: "Normal",
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    icon: <Info weight="fill" className="h-4 w-4" />,
    ring: "border-l-amber-500",
  },
  low: {
    label: "General",
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    icon: <CheckCircle weight="fill" className="h-4 w-4" />,
    ring: "border-l-emerald-500",
  },
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
  announcements: Announcement[];
  background: PageBackground;
  user: User | null;
  onBroadcast?: (data: Omit<Announcement, "id" | "date">) => void;
  onDeleteAnnouncement?: (id: string) => void;
}

export default function BroadcastsSection({ announcements, background, user, onBroadcast, onDeleteAnnouncement }: Props) {
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [audienceFilter, setAudienceFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetAudience, setTargetAudience] = useState("All Students");
  const [priority, setPriority] = useState<Priority>("normal");

  const isPatron = user?.role === "patron" || user?.role === "designer";

  const audiences = useMemo(() => {
    const set = new Set(announcements.map((a) => a.targetAudience));
    return ["all", ...Array.from(set)];
  }, [announcements]);

  const filtered = useMemo(() => {
    return announcements
      .filter((a) => priorityFilter === "all" || a.priority === priorityFilter)
      .filter((a) => audienceFilter === "all" || a.targetAudience === audienceFilter)
      .filter((a) =>
        q.trim()
          ? (a.title + a.content + a.author).toLowerCase().includes(q.toLowerCase())
          : true
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [announcements, priorityFilter, audienceFilter, q]);

  const handlePublish = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required.");
      return;
    }
    if (onBroadcast) {
      onBroadcast({ title: title.trim(), content: content.trim(), targetAudience, priority, author: user?.fullName || "Unknown" });
      toast.success("Broadcast published!");
      setComposeOpen(false);
      setTitle("");
      setContent("");
    }
  };

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <BgLayer bg={background} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">Live Feed</p>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tighter text-zinc-900 sm:text-4xl dark:text-white">
            Broadcasts & Bulletins
          </h2>
          <p className="mt-2 max-w-[55ch] text-sm text-zinc-600 dark:text-zinc-300">
            All patron announcements, club bulletins and urgent notices in one place.
          </p>
        </div>
        {isPatron && onBroadcast && (
          <button
            onClick={() => setComposeOpen(true)}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition hover:scale-[1.03] active:scale-95"
          >
            <Broadcast weight="fill" className="h-4 w-4" /> New Broadcast
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <ListBullets weight="bold" className="h-4 w-4 text-zinc-400" />
          {(["all", "high", "normal", "low"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                priorityFilter === p
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "border border-zinc-200 bg-white/60 text-zinc-600 hover:border-rose-500/40 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
              }`}
            >
              {p === "all" ? "All" : PRIORITY_CONFIG[p].label}
            </button>
          ))}
          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            className="ml-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-zinc-700 outline-none dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
          >
            {audiences.map((a) => (
              <option key={a} value={a}>{a === "all" ? "All Audiences" : a}</option>
            ))}
          </select>
        </div>
        <div className="relative sm:w-64">
          <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search bulletins..."
            className="w-full rounded-full border border-zinc-200 bg-white/70 py-2 pl-9 pr-4 text-sm text-zinc-800 outline-none transition focus:border-rose-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
      </div>

      {/* Feed */}
      {filtered.length === 0 ? (
        <div className="mt-10 grid place-items-center rounded-3xl border border-dashed border-zinc-300 py-16 text-center dark:border-white/15">
          <Megaphone weight="thin" className="h-10 w-10 text-zinc-300" />
          <p className="mt-3 font-bold text-zinc-700 dark:text-zinc-200">No broadcasts found</p>
          <p className="text-sm text-zinc-500">Adjust filters or check back later.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {filtered.map((a, i) => {
            const cfg = PRIORITY_CONFIG[a.priority];
            return (
              <motion.article
                key={a.id}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className={`glass group relative overflow-hidden rounded-2xl border-l-4 p-5 transition hover:shadow-lg hover:shadow-rose-500/5 ${cfg.ring}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                      <span className="rounded-full bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-bold text-violet-700 dark:text-violet-400">
                        <Users weight="bold" className="mr-1 inline h-3 w-3" />
                        {a.targetAudience}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-extrabold text-zinc-900 dark:text-white">{a.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{a.content}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <ShieldStar weight="fill" className="h-3.5 w-3.5 text-amber-500" /> {a.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar weight="bold" className="h-3.5 w-3.5" /> {a.date}
                      </span>
                    </div>
                  </div>
                  {isPatron && onDeleteAnnouncement && (
                    <button
                      onClick={() => onDeleteAnnouncement(a.id)}
                      className="grid h-8 w-8 place-items-center rounded-full text-zinc-400 opacity-0 transition hover:bg-rose-500/10 hover:text-rose-500 group-hover:opacity-100"
                      title="Delete broadcast"
                    >
                      <X weight="bold" className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* Compose Modal */}
      <AnimatePresence>
        {composeOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setComposeOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">New Broadcast</h3>
                <button onClick={() => setComposeOpen(false)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-zinc-100 dark:hover:bg-white/10">
                  <X weight="bold" className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 space-y-3">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Broadcast title..."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-800 outline-none transition focus:border-rose-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your announcement..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-rose-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-700 outline-none dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
                  >
                    <option>All Students</option>
                    <option>Council Members</option>
                    <option>Hackathon Teams</option>
                    <option>Bootcamp Participants</option>
                    <option>Robotics & IoT Track</option>
                    <option>New Members</option>
                  </select>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-700 outline-none dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
                  >
                    <option value="high">Urgent / High</option>
                    <option value="normal">Normal</option>
                    <option value="low">General / Low</option>
                  </select>
                </div>
                <button
                  onClick={handlePublish}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition hover:scale-[1.01] active:scale-95"
                >
                  <Broadcast weight="fill" className="h-4 w-4" /> Publish Broadcast
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}