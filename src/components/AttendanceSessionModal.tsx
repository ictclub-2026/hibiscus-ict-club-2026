import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { AttendanceSession } from "../types";
import { ATTENDANCE_CATEGORIES } from "../mockData";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (session: AttendanceSession) => void;
  defaultFacilitator?: string;
}

const inputCls =
  "w-full rounded-xl border border-zinc-200 bg-white/70 px-4 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-rose-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white";

export default function AttendanceSessionModal({ open, onClose, onCreate, defaultFacilitator }: Props) {
  const [form, setForm] = useState({
    title: "",
    category: ATTENDANCE_CATEGORIES[0],
    date: new Date().toISOString().slice(0, 10),
    time: "15:00",
    location: "",
    facilitator: "",
    description: "",
    pin: "",
    status: "scheduled" as AttendanceSession["status"],
  });

  const submit = () => {
    if (!form.title.trim()) {
      toast.error("Please give the session a title.");
      return;
    }
    const session: AttendanceSession = {
      id: `as-${Date.now()}`,
      title: form.title.trim(),
      category: form.category,
      date: form.date,
      time: form.time,
      location: form.location.trim() || "ICT Lab, Block C",
      facilitator: form.facilitator.trim() || defaultFacilitator || "Club Patron",
      description: form.description.trim() || "Attendance session logged from the club portal.",
      pin: form.pin.trim() || String(1000 + Math.floor(Math.random() * 9000)),
      status: form.status,
    };
    onCreate(session);
    setForm({ ...form, title: "", location: "", facilitator: "", description: "", pin: "" });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">New Attendance Session</h3>
              <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-zinc-100 dark:hover:bg-white/10">
                <X weight="bold" className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Session title"
                className={inputCls}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={inputCls}
                >
                  {ATTENDANCE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as AttendanceSession["status"] })}
                  className={inputCls}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} />
                <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={inputCls} />
              </div>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Location (e.g. ICT Lab, Block C)"
                className={inputCls}
              />
              <input
                value={form.facilitator}
                onChange={(e) => setForm({ ...form, facilitator: e.target.value })}
                placeholder="Facilitator"
                className={inputCls}
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short description of the session"
                rows={3}
                className={`${inputCls} resize-none`}
              />
              <div>
                <input
                  value={form.pin}
                  onChange={(e) => setForm({ ...form, pin: e.target.value })}
                  placeholder="Check-in PIN (4 digits, optional)"
                  inputMode="numeric"
                  className={inputCls}
                />
                <p className="mt-1 text-[11px] text-zinc-400">Leave blank to auto-generate a random PIN for member self check-in.</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={onClose} className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-bold text-zinc-700 dark:border-white/15 dark:text-white">
                Cancel
              </button>
              <button onClick={submit} className="flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition hover:scale-[1.03] active:scale-95">
                <Plus weight="bold" className="h-4 w-4" /> Create Session
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}