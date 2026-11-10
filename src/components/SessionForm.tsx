import { useState } from "react";
import { Check } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { AttendanceSession } from "../types";

const inputCls = "w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-cyan-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white";

export function SessionForm({ session, onSave, onCancel }: { session: AttendanceSession | null; onSave: (s: AttendanceSession) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(session?.title || "");
  const [category, setCategory] = useState(session?.category || "Workshop");
  const [date, setDate] = useState(session?.date || "");
  const [time, setTime] = useState(session?.time || "");
  const [location, setLocation] = useState(session?.location || "");
  const [facilitator, setFacilitator] = useState(session?.facilitator || "");
  const [description, setDescription] = useState(session?.description || "");
  const [pin, setPin] = useState(session?.pin || "");
  const [status, setStatus] = useState<AttendanceSession["status"]>(session?.status || "scheduled");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) { toast.error("Session title and date are required."); return; }
    onSave({
      id: session?.id || `s-${Date.now()}`,
      title, category, date, time: time || "10:00 AM", location: location || "Main Hall",
      facilitator, description, pin: pin || String(Math.floor(1000 + Math.random() * 9000)), status,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={inputCls} placeholder="Session title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className={inputCls} placeholder="Category (e.g. Workshop)" value={category} onChange={(e) => setCategory(e.target.value)} />
        <input className={inputCls} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input className={inputCls} placeholder="Time (e.g. 10:00 AM)" value={time} onChange={(e) => setTime(e.target.value)} />
        <input className={inputCls} placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <input className={inputCls} placeholder="Facilitator" value={facilitator} onChange={(e) => setFacilitator(e.target.value)} />
        <input className={inputCls} placeholder="Check-in PIN (4 digits)" value={pin} onChange={(e) => setPin(e.target.value)} />
        <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as AttendanceSession["status"])}>
          <option value="scheduled">Scheduled</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option>
        </select>
      </div>
      <textarea className={inputCls} rows={2} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="flex gap-2">
        <button type="submit" className="flex items-center gap-1 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-white"><Check weight="bold" className="h-3.5 w-3.5" /> {session ? "Update" : "Save"} Session</button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-zinc-300 px-4 py-2 text-xs font-bold text-zinc-600 dark:border-white/15 dark:text-zinc-300">Cancel</button>
      </div>
    </form>
  );
}