import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  CheckCircle,
  Clock,
  UsersThree,
  Plus,
  Calendar,
  ClipboardText,
  LockSimple,
  Trash,
  X,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import type {
  AttendanceRecord,
  AttendanceSession,
  AttendanceStatus,
  PageBackground,
  User,
} from "../types";
import AttendanceRoster from "./AttendanceRoster";
import AttendanceSessionModal from "./AttendanceSessionModal";

const SESSION_META: Record<AttendanceSession["status"], string> = {
  completed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  ongoing: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  scheduled: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
};

interface Props {
  sessions: AttendanceSession[];
  records: AttendanceRecord[];
  members: User[];
  background: PageBackground;
  user: User | null;
  setSessions: (v: AttendanceSession[] | ((p: AttendanceSession[]) => AttendanceSession[])) => void;
  setRecords: (v: AttendanceRecord[] | ((p: AttendanceRecord[]) => AttendanceRecord[])) => void;
}

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

function StatCard({ value, suffix, label, icon }: { value: number; suffix?: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/10">
      <div className="mb-2 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-rose-500/15 to-violet-500/15 text-rose-600 dark:text-rose-400">
        {icon}
      </div>
      <p className="font-mono text-3xl font-bold text-zinc-900 dark:text-white">
        {value}
        {suffix ? <span className="text-rose-500">{suffix}</span> : null}
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}

export default function AttendanceSection({ sessions, records, members, background, user, setSessions, setRecords }: Props) {
  const [selectedId, setSelectedId] = useState<string>(sessions[0]?.id ?? "");
  const [showNew, setShowNew] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const canManage = user?.role === "patron" || user?.role === "designer";
  const selected = sessions.find((s) => s.id === selectedId) ?? sessions[0] ?? null;

  const stats = useMemo(() => {
    const presentish = records.filter((r) => r.status === "present" || r.status === "late").length;
    const presentOnly = records.filter((r) => r.status === "present").length;
    return {
      sessions: sessions.length,
      completed: sessions.filter((s) => s.status === "completed").length,
      rate: records.length ? Math.round((presentish / records.length) * 100) : 0,
      onTime: presentish ? Math.round((presentOnly / presentish) * 100) : 0,
      unique: new Set(records.filter((r) => r.status === "present" || r.status === "late").map((r) => r.memberId)).size,
    };
  }, [sessions, records]);

  const mark = (member: User, status: AttendanceStatus) => {
    if (!selected) return;
    if (selected.status === "completed") {
      toast.error("This session is finished and locked for edits.");
      return;
    }
    const sessionId = selected.id;
    setRecords((prev) => {
      const existing = prev.find((r) => r.sessionId === sessionId && r.memberId === member.id);
      const timestamp = new Date().toISOString();
      if (existing) return prev.map((r) => (r.id === existing.id ? { ...r, status, timestamp } : r));
      const rec: AttendanceRecord = {
        id: `att-${Date.now()}-${member.id}`,
        sessionId,
        memberId: member.id,
        memberName: member.fullName,
        memberEmail: member.email,
        nationality: member.nationality,
        status,
        timestamp,
      };
      return [rec, ...prev];
    });
    toast.success(`${member.fullName.split(" ")[0]} marked ${status}.`);
  };

  const markAllPresent = () => {
    if (!selected) return;
    if (selected.status === "completed") {
      toast.error("This session is finished and locked for edits.");
      return;
    }
    const sessionId = selected.id;
    const timestamp = new Date().toISOString();
    setRecords((prev) => {
      const others = prev.filter((r) => r.sessionId !== sessionId);
      const fresh: AttendanceRecord[] = members.map((m, i) => ({
        id: `att-${Date.now()}-${m.id}-${i}`,
        sessionId,
        memberId: m.id,
        memberName: m.fullName,
        memberEmail: m.email,
        nationality: m.nationality,
        status: "present",
        timestamp,
      }));
      return [...fresh, ...others];
    });
    toast.success("All members marked present.");
  };

  const createSession = (session: AttendanceSession) => {
    setSessions((prev) => [session, ...prev]);
    setSelectedId(session.id);
    setShowNew(false);
    toast.success("Attendance session created.");
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (selectedId === id) setSelectedId(remaining[0]?.id ?? "");
      return remaining;
    });
    setRecords((prev) => prev.filter((r) => r.sessionId !== id));
    setConfirmDeleteId(null);
    toast.success("Session deleted and attendance records removed.");
  };

  return (
    <div className="relative space-y-12 pb-20">
      <BgLayer bg={background} />

      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">Session Tracking</p>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tighter text-zinc-900 sm:text-4xl dark:text-white">
              Attendance Tracker
            </h2>
            <p className="mt-2 max-w-[60ch] text-sm text-zinc-600 dark:text-zinc-300">
              Create club sessions, run live roll call for every member, and track attendance rates across workshops, hackathons and weekly meetups.
            </p>
          </div>
          {canManage && (
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:scale-[1.03] active:scale-95"
            >
              <Plus weight="bold" className="h-4 w-4" /> New Session
            </button>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard value={stats.sessions} label="Sessions Logged" icon={<CalendarCheck weight="fill" className="h-5 w-5" />} />
          <StatCard value={stats.rate} suffix="%" label="Attendance Rate" icon={<CheckCircle weight="fill" className="h-5 w-5" />} />
          <StatCard value={stats.onTime} suffix="%" label="On-Time Rate" icon={<Clock weight="fill" className="h-5 w-5" />} />
          <StatCard value={stats.unique} label="Unique Attendees" icon={<UsersThree weight="fill" className="h-5 w-5" />} />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
        {/* Session list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-extrabold text-zinc-900 dark:text-white">
              <ClipboardText weight="bold" className="h-5 w-5 text-violet-600 dark:text-violet-400" /> Club Sessions
            </h3>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
              {stats.completed} completed
            </span>
          </div>

          {sessions.length === 0 ? (
            <div className="grid place-items-center rounded-3xl border border-dashed border-zinc-300 py-14 text-center dark:border-white/15">
              <CalendarCheck weight="fill" className="h-8 w-8 text-zinc-300" />
              <p className="mt-3 font-bold text-zinc-700 dark:text-zinc-200">No sessions yet</p>
              <p className="text-sm text-zinc-500">
                {canManage ? "Create your first session to start tracking attendance." : "Sessions will appear here once scheduled."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...sessions]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((s) => {
                  const active = s.id === selected?.id;
                  const rec = records.filter((r) => r.sessionId === s.id);
                  const here = rec.filter((r) => r.status === "present" || r.status === "late").length;
                  return (
                    <div
                      key={s.id}
                      className={`w-full rounded-3xl border p-4 transition ${
                        active
                          ? "border-rose-500/40 bg-rose-500/5 shadow-lg shadow-rose-500/10"
                          : "glass border-transparent hover:-translate-y-0.5"
                      }`}
                    >
                      <button onClick={() => setSelectedId(s.id)} className="w-full text-left">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-sm font-extrabold leading-tight text-zinc-900 dark:text-white">{s.title}</h4>
                          <span className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${SESSION_META[s.status]}`}>
                            {s.status === "completed" && <LockSimple weight="bold" className="h-3 w-3" />}
                            {s.status === "completed" ? "Completed · Locked" : s.status}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                          <span className="flex items-center gap-1"><Calendar weight="bold" className="h-3.5 w-3.5" /> {s.date}</span>
                          <span className="flex items-center gap-1"><Clock weight="bold" className="h-3.5 w-3.5" /> {s.time}</span>
                          <span className="flex items-center gap-1"><UsersThree weight="bold" className="h-3.5 w-3.5" /> {here}/{members.length}</span>
                        </div>
                      </button>
                      {canManage && (
                        <div className="mt-2 flex justify-end border-t border-zinc-100 pt-2 dark:border-white/10">
                          {confirmDeleteId === s.id ? (
                            <span className="flex items-center gap-1">
                              <button onClick={() => deleteSession(s.id)} className="flex items-center gap-1 rounded-lg bg-rose-500/15 px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-500/25 dark:text-rose-400"><Trash weight="bold" className="h-3.5 w-3.5" /> Confirm Delete</button>
                              <button onClick={() => setConfirmDeleteId(null)} className="grid h-6 w-6 place-items-center rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10"><X weight="bold" className="h-3.5 w-3.5" /></button>
                            </span>
                          ) : (
                            <button onClick={() => setConfirmDeleteId(s.id)} title="Delete session" className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-zinc-400 transition hover:bg-rose-500/10 hover:text-rose-500"><Trash weight="bold" className="h-3.5 w-3.5" /> Delete</button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Roll call panel */}
        {selected ? (
          <AttendanceRoster
            session={selected}
            records={records}
            members={members}
            user={user}
            canManage={canManage}
            onMark={mark}
            onMarkAll={markAllPresent}
          />
        ) : (
          <div className="glass grid place-items-center rounded-3xl p-6 py-20 text-center">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <ClipboardText weight="fill" className="mx-auto h-10 w-10 text-zinc-300" />
              <p className="mt-3 font-bold text-zinc-700 dark:text-zinc-200">Select a session</p>
              <p className="text-sm text-zinc-500">Choose a club session to run roll call.</p>
            </motion.div>
          </div>
        )}
      </section>

      <AttendanceSessionModal
        open={showNew}
        onClose={() => setShowNew(false)}
        onCreate={createSession}
        defaultFacilitator={user?.fullName ?? ""}
      />
    </div>
  );
}