import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserCircle,
  MagnifyingGlass,
  GlobeHemisphereWest,
  IdentificationCard,
  Calendar,
  ShieldStar,
  Cpu,
  Palette,
  Brain,
  Robot,
  GraduationCap,
  Crown,
} from "@phosphor-icons/react";
import type { User, Project, PageBackground } from "../types";
import { NATIONALITIES } from "../mockData";

const ROLE_ICON: Record<string, React.ReactNode> = {
  patron: <Crown weight="fill" className="h-4 w-4" />,
  designer: <Palette weight="fill" className="h-4 w-4" />,
  student: <GraduationCap weight="fill" className="h-4 w-4" />,
};

const ROLE_BADGE: Record<string, string> = {
  patron: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  designer: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  student: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400",
};

const ROLE_LABEL: Record<string, string> = {
  patron: "Patron",
  designer: "Designer",
  student: "Student",
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
  users: User[];
  projects: Project[];
  background: PageBackground;
}

export default function MembersDirectory({ users, projects, background }: Props) {
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [natFilter, setNatFilter] = useState<string>("All");

  const projectCount = useMemo(() => {
    const map: Record<string, number> = {};
    projects.forEach((p) => { map[p.authorEmail] = (map[p.authorEmail] || 0) + 1; });
    return map;
  }, [projects]);

  const filtered = useMemo(() => {
    return users
      .filter((u) => roleFilter === "All" || u.role === roleFilter)
      .filter((u) => natFilter === "All" || u.nationality === natFilter)
      .filter((u) =>
        q.trim()
          ? (u.fullName + u.username + u.email + u.nationality).toLowerCase().includes(q.toLowerCase())
          : true
      )
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [users, q, roleFilter, natFilter]);

  const roles = useMemo(() => ["All", ...Array.from(new Set(users.map((u) => u.role)))], [users]);

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <BgLayer bg={background} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">Community</p>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tighter text-zinc-900 sm:text-4xl dark:text-white">
            Members Directory
          </h2>
          <p className="mt-2 max-w-[55ch] text-sm text-zinc-600 dark:text-zinc-300">
            Browse all registered Tech-Benders, their nationalities, roles and project contributions.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-700 dark:bg-white/5 dark:text-zinc-300">
          <Users weight="fill" className="h-4 w-4 text-rose-500" />
          {filtered.length} members
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, username..."
            className="w-full rounded-full border border-zinc-200 bg-white/70 py-2 pl-9 pr-4 text-sm text-zinc-800 outline-none transition focus:border-cyan-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                roleFilter === r
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "border border-zinc-200 bg-white/60 text-zinc-600 hover:border-cyan-500/40 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
              }`}
            >
              {r === "All" ? "All Roles" : ROLE_LABEL[r] || r}
            </button>
          ))}
        </div>
        <select
          value={natFilter}
          onChange={(e) => setNatFilter(e.target.value)}
          className="rounded-full border border-zinc-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-zinc-700 outline-none dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
        >
          <option value="All">All Countries</option>
          {NATIONALITIES.map((n) => (
            <option key={n.value} value={n.value}>{n.flag} {n.value}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="mt-10 grid place-items-center rounded-3xl border border-dashed border-zinc-300 py-16 text-center dark:border-white/15">
          <UserCircle weight="thin" className="h-10 w-10 text-zinc-300" />
          <p className="mt-3 font-bold text-zinc-700 dark:text-zinc-200">No members found</p>
          <p className="text-sm text-zinc-500">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((u, i) => {
            const initials = u.fullName.split(" ").map((s) => s[0]).slice(0, 2).join("");
            const count = projectCount[u.email] || 0;
            const natInfo = NATIONALITIES.find((n) => n.value === u.nationality);
            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 4) * 0.05 }}
                className="group glass rounded-3xl p-5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/10"
              >
                <div className="flex items-start justify-between">
                                     <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 via-fuchsia-600 to-indigo-600 text-sm font-black text-white shadow-lg shadow-rose-500/20">
                     {u.avatar ? <img src={u.avatar} alt={u.fullName} className="h-full w-full object-cover" /> : initials}
                   </div>
                  <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${ROLE_BADGE[u.role]}`}>
                    {ROLE_ICON[u.role]} {ROLE_LABEL[u.role]}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-extrabold text-zinc-900 dark:text-white">{u.fullName}</h3>
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">@{u.username}</p>
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    <GlobeHemisphereWest weight="bold" className="h-3 w-3" /> {natInfo?.flag} {u.nationality}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar weight="bold" className="h-3 w-3" /> {u.createdAt}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3 dark:border-white/10">
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                    <Cpu weight="bold" className="h-3 w-3" /> {count} project{count !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600 dark:bg-white/5 dark:text-zinc-300">
                    <IdentificationCard weight="bold" className="h-3 w-3" /> {u.sex}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}