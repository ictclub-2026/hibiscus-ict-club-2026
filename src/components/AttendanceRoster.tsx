import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  UsersThree,
  CheckCircle,
  XCircle,
  SealCheck,
  Check,
  DownloadSimple,
  MagnifyingGlass,
  QrCode,
  MapPin,
  LockSimple,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import type { AttendanceRecord, AttendanceSession, AttendanceStatus, User } from "../types";

const STATUS_META: Record<AttendanceStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  present: { label: "Present", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30", icon: <Check weight="bold" className="h-3.5 w-3.5" /> },
  late: { label: "Late", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30", icon: <Clock weight="bold" className="h-3.5 w-3.5" /> },
  absent: { label: "Absent", cls: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30", icon: <XCircle weight="bold" className="h-3.5 w-3.5" /> },
  excused: { label: "Excused", cls: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30", icon: <SealCheck weight="bold" className="h-3.5 w-3.5" /> },
};

const STATUS_ORDER: AttendanceStatus[] = ["present", "late", "absent", "excused"];

interface Props {
  session: AttendanceSession;
  records: AttendanceRecord[];
  members: User[];
  user: User | null;
  canManage: boolean;
  onMark: (member: User, status: AttendanceStatus) => void;
  onMarkAll: () => void;
}

export default function AttendanceRoster({ session, records, members, user, canManage, onMark, onMarkAll }: Props) {
  const [query, setQuery] = useState("");
  const [pin, setPin] = useState("");
  const isFinished = session.status === "completed";

  const sessionRecords = useMemo(() => records.filter((r) => r.sessionId === session.id), [records, session.id]);

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => (q ? `${m.fullName} ${m.email} ${m.nationality}`.toLowerCase().includes(q) : true));
  }, [members, query]);

  const checkedIn = sessionRecords.filter((r) => r.status === "present" || r.status === "late").length;
  const marked = sessionRecords.length;

  const isPrivileged = user?.role === "designer" || user?.role === "patron";

  const selfCheckIn = () => {
    if (isFinished) {
      toast.error("This session is finished and locked for edits.");
      return;
    }
    if (!user) {
      toast.error("Sign in to check in for a session.");
      return;
    }
    if (!isPrivileged && pin.trim() !== session.pin) {
      toast.error("Incorrect session PIN. Ask the facilitator for the code.");
      return;
    }
    onMark(user, "present");
    setPin("");
    toast.success(`Checked in to ${session.title}.`);
  };

  const exportCsv = () => {
    const rows: string[][] = [["Member", "Email", "Nationality", "Status", "Checked In"]];
    members.forEach((m) => {
      const r = sessionRecords.find((x) => x.memberId === m.id);
      rows.push([m.fullName, m.email, m.nationality, r?.status ?? "unmarked", r?.timestamp ?? ""]);
    });
    const csv = rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(",")).join(String.fromCharCode(10));
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${session.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Attendance log exported as CSV.");
  };

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="rounded-full bg-violet-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400">
            {session.category}
          </span>
          <h3 className="mt-2 text-xl font-extrabold text-zinc-900 dark:text-white">{session.title}</h3>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1"><Calendar weight="bold" className="h-3.5 w-3.5" /> {session.date} · {session.time}</span>
            <span className="flex items-center gap-1"><MapPin weight="bold" className="h-3.5 w-3.5" /> {session.location}</span>
            <span className="flex items-center gap-1"><UsersThree weight="bold" className="h-3.5 w-3.5" /> {session.facilitator}</span>
          </div>
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-xs font-bold text-zinc-700 transition hover:border-rose-500/40 hover:text-rose-600 dark:border-white/15 dark:text-white"
        >
          <DownloadSimple weight="bold" className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Progress */}
      <div className="mt-5 rounded-2xl bg-zinc-50 p-4 dark:bg-white/5">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-300">
          <span className="flex items-center gap-1"><CheckCircle weight="bold" className="h-4 w-4 text-rose-500" /> Roll call progress</span>
          <span>{checkedIn} of {members.length} checked in</span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${members.length ? (checkedIn / members.length) * 100 : 0}%` }}
            transition={{ duration: 0.5 }}
            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-violet-600"
          />
        </div>
      </div>

      {/* Locked banner */}
      {isFinished && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <LockSimple weight="bold" className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-bold text-amber-700 dark:text-amber-300">Finished Session · Records Locked</p>
            <p className="text-[11px] font-semibold text-amber-700/80 dark:text-amber-300/80">
              This session is completed. Attendance records are sealed and archived — marking, status changes and self check-in are disabled. Viewing and CSV export remain available for auditing.
            </p>
          </div>
        </div>
      )}

      {/* Self check-in */}
      {user && !isFinished && (
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
          <QrCode weight="bold" className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          <div className="flex-1 min-w-[170px]">
            <p className="text-sm font-bold text-zinc-800 dark:text-white">Self check-in</p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {isPrivileged ? "Privileged access — no PIN required." : "Enter the session PIN shared by the facilitator."}
            </p>
          </div>
          {!isPrivileged && (
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Session PIN"
              inputMode="numeric"
              className="w-32 rounded-full border border-zinc-200 bg-white/70 px-4 py-2 text-sm text-zinc-800 outline-none transition focus:border-cyan-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          )}
          <button onClick={selfCheckIn} className="rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:scale-[1.03] active:scale-95">
            Check In
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members..."
            className="w-full rounded-full border border-zinc-200 bg-white/70 py-2 pl-9 pr-4 text-sm text-zinc-800 outline-none transition focus:border-rose-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
        {canManage && !isFinished && (
          <button onClick={onMarkAll} className="flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-violet-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition hover:scale-[1.03] active:scale-95">
            <CheckCircle weight="bold" className="h-4 w-4" /> Mark All Present
          </button>
        )}
      </div>

      {/* Member roll */}
      <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
        {filteredMembers.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-zinc-300 py-12 text-center dark:border-white/15">
            <UsersThree weight="fill" className="h-7 w-7 text-zinc-300" />
            <p className="mt-2 text-sm font-bold text-zinc-600 dark:text-zinc-300">No members match your search</p>
          </div>
        ) : (
          filteredMembers.map((m) => {
            const rec = sessionRecords.find((r) => r.memberId === m.id);
            const status = rec?.status;
            return (
              <div key={m.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-100 bg-white/60 p-3 dark:border-white/10 dark:bg-white/5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-violet-600 text-xs font-bold text-white">
                  {m.fullName.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </span>
                <div className="min-w-[130px] flex-1">
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">{m.fullName}</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{m.email} · {m.nationality}</p>
                </div>
                {canManage && !isFinished ? (
                  <div className="flex flex-wrap gap-1.5">
                    {STATUS_ORDER.map((st) => {
                      const meta = STATUS_META[st];
                      const on = status === st;
                      return (
                        <button
                          key={st}
                          onClick={() => onMark(m, st)}
                          className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${
                            on ? meta.cls : "border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:border-white/10 dark:text-zinc-400"
                          }`}
                        >
                          {meta.icon} {meta.label}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <span className={`flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold ${status ? STATUS_META[status].cls : "border-zinc-200 text-zinc-500 dark:border-white/10 dark:text-zinc-400"}`}>
                    {status ? STATUS_META[status].icon : <Clock weight="bold" className="h-3.5 w-3.5" />}
                    {status ? STATUS_META[status].label : "Unmarked"}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
      <p className="mt-3 text-[11px] text-zinc-400">{marked} record{marked === 1 ? "" : "s"} logged for this session.</p>
    </div>
  );
}