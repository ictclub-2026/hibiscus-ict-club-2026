import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, IdentificationCard, UserPlus, Rocket, Megaphone, ShieldStar,
  Trash, Check, PencilSimple, Key, Lock, UsersThree, Cpu, Crown,
  EnvelopeSimple, Flag, Gear, Image, PaintBucket, SlidersHorizontal,
  Plus, TextT, Layout, CalendarPlus, MapPin,
  FilmSlate,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import type {
  Activity, Announcement, AttendanceSession, ClubPhoto, Leader, Nationality, PageBackground, PageId,
  Project, Role, SiteSettings, User,
} from "../types";
import {
  NATIONALITIES, PROJECT_CATEGORIES, ACTIVITY_CATEGORIES,
  GRADIENT_PRESETS, IMAGE_PRESETS,
} from "../mockData";
import { LeaderManager } from "./AboutAndLeadership";
import ImageUploader from "./ImageUploader";
import { PatronGalleryTab } from "./PatronGalleryTab";
import { SessionForm } from "./SessionForm";

function Modal({ open, onClose, title, icon, children, wide }: {
  open: boolean; onClose: () => void; title: string;
  icon: React.ReactNode; children: React.ReactNode; wide?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
          <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full ${wide ? "max-w-3xl" : "max-w-md"} max-h-[88vh] overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-zinc-900`}>
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-white/10">
              <div className="flex items-center gap-2 font-extrabold text-zinc-900 dark:text-white">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-rose-500 to-violet-600 text-white">{icon}</span>
                {title}
              </div>
              <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/10"><X weight="bold" className="h-4 w-4" /></button>
            </div>
            <div className="max-h-[calc(88vh-64px)] overflow-y-auto p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const inputCls = "w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-rose-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white";

const ROLE_META: Record<Role, { label: string; icon: React.ReactNode; pill: string }> = {
  patron: { label: "Patron", icon: <Crown weight="fill" className="h-3 w-3" />, pill: "bg-rose-500/15 text-rose-600 dark:text-rose-400" },
  designer: { label: "Designer", icon: <PaintBucket weight="fill" className="h-3 w-3" />, pill: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300" },
  student: { label: "Member", icon: <UsersThree weight="fill" className="h-3 w-3" />, pill: "bg-violet-500/15 text-violet-600 dark:text-violet-400" },
};

/* ---------------- AUTH ---------------- */
export function AuthModal({ open, onClose, users, onLogin, onRegister }: {
  open: boolean; onClose: () => void; users: User[];
  onLogin: (identifier: string, password: string) => void;
  onRegister: (u: Omit<User, "id" | "createdAt">) => User | undefined;
}) {
  const [tab, setTab] = useState<"login" | "register" | "verify">("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [sex, setSex] = useState<"Male" | "Female">("Male");
  const [nationality, setNationality] = useState<Nationality>("Uganda");
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [demoFilter, setDemoFilter] = useState<"all" | Role>("all");
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [verifyUsername, setVerifyUsername] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");

  const rolesPresent = Array.from(new Set(users.map((u) => u.role)));
  const demoUsers = demoFilter === "all" ? users : users.filter((u) => u.role === demoFilter);

  // Credentials are never stored or pre-filled: every session/tab starts blank.
  useEffect(() => {
    setIdentifier(""); setPassword(""); setVerifyUsername(""); setVerifyPassword("");
  }, [open, tab]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === "login") { onLogin(identifier, password); }
    else if (tab === "register") {
      if (!fullName || !username || !email || !password) { toast.error("Please fill in all fields."); return; }
      const created = onRegister({ username, email, password, fullName, role, sex, nationality, avatar });
      if (created) {
        setPendingUser(created);
        setVerifyUsername("");
        setVerifyPassword("");
        setTab("verify");
      }
    } else if (tab === "verify") {
      if (pendingUser && verifyUsername.toLowerCase() === pendingUser.username.toLowerCase() && verifyPassword === pendingUser.password) {
        onLogin(pendingUser.username, pendingUser.password);
        toast.success(`Account verified successfully! Welcome, ${pendingUser.fullName}`);
        onClose();
      } else {
        toast.error("Verification failed. Check your username and password.");
      }
    }
  };

  // Demo accounts are reference-only: clicking copies the username but never fills the form.
  const demo = async (u: User) => {
    try { await navigator.clipboard?.writeText(u.username); } catch { /* clipboard unavailable */ }
    toast.info(`Demo ${ROLE_META[u.role].label} account @${u.username} copied. Type your password manually to sign in.`);
  };

  return (
    <Modal open={open} onClose={onClose} title="Tech-Benders Portal" icon={<IdentificationCard weight="fill" className="h-4 w-4" />}>
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-white/5">
        {(["login", "register"] as const).map((t) => (
          <button key={t} onClick={() => { setTab(t); setPendingUser(null); }} className={`rounded-lg py-2 text-sm font-bold capitalize transition ${tab === t ? "bg-white text-rose-600 shadow dark:bg-zinc-800 dark:text-rose-400" : "text-zinc-500"}`}>
            {t === "login" ? "Sign In" : "Register"}
          </button>
        ))}
      </div>

      {tab === "verify" && pendingUser ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Account Created</p>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-violet-600 text-sm font-black text-white">
                {(pendingUser.fullName || pendingUser.email).slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-zinc-900 dark:text-white">{pendingUser.fullName}</p>
                <p className="text-xs text-zinc-500">@{pendingUser.username} · {pendingUser.email}</p>
                <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${ROLE_META[pendingUser.role].pill}`}>
                  {ROLE_META[pendingUser.role].icon}{ROLE_META[pendingUser.role].label}
                </span>
              </div>
            </div>
          </div>
          <p className="text-center text-xs font-semibold text-zinc-500">Please enter your username and password manually to verify and sign in</p>
          <form onSubmit={submit} autoComplete="off" className="space-y-3">
            <input className={inputCls} name="verify-username" autoComplete="off" placeholder="Username" value={verifyUsername} onChange={(e) => setVerifyUsername(e.target.value)} />
            <input className={inputCls} type="password" name="verify-password" autoComplete="off" placeholder="Password" value={verifyPassword} onChange={(e) => setVerifyPassword(e.target.value)} />
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-sm font-black text-white transition hover:scale-[1.02] active:scale-95">
              <ShieldStar weight="fill" className="h-4 w-4" />
              Verify & Access Portal
            </button>
          </form>
        </div>
      ) : (
      <form onSubmit={submit} autoComplete="off" className="space-y-3">
        {tab === "register" && (<>
          <input className={inputCls} autoComplete="off" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <input className={inputCls} autoComplete="off" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="student">Student</option><option value="patron">Club Patron</option><option value="designer">Web Designer</option>
            </select>
            <select className={inputCls} value={sex} onChange={(e) => setSex(e.target.value as "Male" | "Female")}>
              <option value="Male">Male</option><option value="Female">Female</option>
            </select>
          </div>
          <select className={inputCls} value={nationality} onChange={(e) => setNationality(e.target.value as Nationality)}>
            {NATIONALITIES.map((n) => <option key={n.value} value={n.value}>{n.flag} {n.value}</option>)}
          </select>
          <ImageUploader value={avatar} onChange={setAvatar} label="Profile photo (optional)" aspect="aspect-square" hint="Square photos look best · up to 3 MB" />
        </>)}
        <input className={inputCls} name="portal-identifier" autoComplete="off" placeholder="Username or email (type it now)" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
        {tab === "register" && <input className={inputCls} type="email" autoComplete="off" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />}
        <input className={inputCls} type="password" name="portal-password" autoComplete="new-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 py-3 text-sm font-black text-white transition hover:scale-[1.02] active:scale-95">
          {tab === "login" ? <Key weight="bold" className="h-4 w-4" /> : <UserPlus weight="bold" className="h-4 w-4" />}
          {tab === "login" ? "Sign In" : "Create Account"}
        </button>
      </form>
      )}
      <div className="mt-5 rounded-2xl border border-dashed border-zinc-300 p-4 dark:border-white/15">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-zinc-500"><Lock weight="bold" className="h-3.5 w-3.5" /> Reference Demo Accounts</p>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-500 dark:bg-white/10 dark:text-zinc-400">{users.length} accounts</span>
        </div>
        <p className="mb-3 text-[11px] font-medium text-zinc-500">Reference only - tapping copies the username. Credentials are never auto-filled; type your password manually.</p>
        <div className="mb-3 flex flex-wrap gap-1.5">
          <button onClick={() => setDemoFilter("all")} className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${demoFilter === "all" ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-zinc-100 text-zinc-500 hover:text-zinc-800 dark:bg-white/10 dark:text-zinc-400"}`}>All ({users.length})</button>
          {rolesPresent.map((r) => (
            <button key={r} onClick={() => setDemoFilter(r)} className={`flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold transition ${demoFilter === r ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-zinc-100 text-zinc-500 hover:text-zinc-800 dark:bg-white/10 dark:text-zinc-400"}`}>
              {ROLE_META[r].icon}{ROLE_META[r].label} ({users.filter((u) => u.role === r).length})
            </button>
          ))}
        </div>
        <div className="grid max-h-52 gap-2 overflow-y-auto pr-1">
          {demoUsers.length === 0 && <p className="py-3 text-center text-xs text-zinc-500">No accounts yet. Register one above to test instantly.</p>}
          {demoUsers.map((u) => (
            <button key={u.id} onClick={() => demo(u)} className="flex items-center justify-between gap-2 rounded-xl bg-zinc-50 px-3 py-2 text-left text-sm transition hover:bg-rose-500/10 dark:bg-white/5">
              <span className="flex min-w-0 items-center gap-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-violet-600 text-[11px] font-black text-white">{(u.fullName || u.email).slice(0, 1).toUpperCase()}</span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-zinc-700 dark:text-zinc-200">{u.fullName}</span>
                  <span className="block truncate text-[11px] text-zinc-500">@{u.username} · {u.email}</span>
                </span>
              </span>
              <span className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${ROLE_META[u.role].pill}`}>{ROLE_META[u.role].icon}{ROLE_META[u.role].label}</span>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

/* ---------------- SUBMIT PROJECT ---------------- */
export function SubmitModal({ open, onClose, onSubmit, user }: {
  open: boolean; onClose: () => void;
  onSubmit: (p: Omit<Project, "id" | "votes" | "submissionDate" | "approved">) => void;
  user: User | null;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(PROJECT_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [tech, setTech] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
  const gradients = ["from-rose-500 to-orange-500", "from-violet-500 to-fuchsia-500", "from-cyan-500 to-emerald-500", "from-indigo-500 to-sky-500", "from-pink-500 to-rose-600", "from-emerald-500 to-teal-500"];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) { toast.error("Title and description are required."); return; }
    onSubmit({ title, author: user?.fullName || "Anonymous Tech-Bender", authorEmail: user?.email || "guest@hibiscus.ict", category, description, gradient: gradients[Math.floor(Math.random() * gradients.length)], image, demoUrl: demoUrl || undefined, repoUrl: repoUrl || undefined, techStack: tech.split(",").map((t) => t.trim()).filter(Boolean) });
    setTitle(""); setDescription(""); setTech(""); setDemoUrl(""); setRepoUrl(""); setImage(undefined);
  };

  return (
    <Modal open={open} onClose={onClose} title="Upload & Submit Work" icon={<Rocket weight="fill" className="h-4 w-4" />} wide>
      {!user && <p className="mb-4 rounded-xl bg-amber-400/15 px-4 py-2 text-sm font-semibold text-amber-700 dark:text-amber-400">You are submitting as a guest. Sign in to link your project to your profile.</p>}
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2"><label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Project title</label><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. SmartCampus Wi-Fi Mapper" /></div>
        <div><label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Category</label><select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value as Project["category"])}>{PROJECT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Tech stack (comma separated)</label><input className={inputCls} value={tech} onChange={(e) => setTech(e.target.value)} placeholder="React, Node.js, ESP32" /></div>
        <div className="sm:col-span-2"><label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Description</label><textarea className={inputCls} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does it do and why does it matter?" /></div>
        <div><label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Live demo URL</label><input className={inputCls} value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} placeholder="https://..." /></div>
        <div><label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Source code URL</label><input className={inputCls} value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/..." /></div>
        <div className="sm:col-span-2">
          <ImageUploader value={image} onChange={setImage} label="Cover / screenshot" hint="Becomes the project card image · PNG, JPG, WEBP or GIF · up to 3 MB" />
        </div>
        <button type="submit" className="sm:col-span-2 mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 py-3 text-sm font-black text-white transition hover:scale-[1.01] active:scale-95"><Rocket weight="fill" className="h-4 w-4" /> Submit for Review</button>
      </form>
    </Modal>
  );
}

/* ---------------- SUBMIT ACTIVITY ---------------- */
export function SubmitActivityModal({ open, onClose, onSubmit, user }: {
  open: boolean; onClose: () => void;
  onSubmit: (a: Omit<Activity, "id">) => void;
  user: User | null;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<Activity["category"]>("Workshop");
  const [status, setStatus] = useState<Activity["status"]>("upcoming");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [attendees, setAttendees] = useState(0);
  const [resources, setResources] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) { toast.error("Activity title and date are required."); return; }
    onSubmit({
      title, date, category, status, location,
      description: description || "A new Tech-Benders club activity.",
      attendeesCount: attendees,
      image: image || undefined,
      resources: resources.split(",").map((r) => r.trim()).filter(Boolean),
    });
    setTitle(""); setDate(""); setLocation(""); setDescription(""); setResources(""); setAttendees(0); setImage(undefined);
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Club Activity" icon={<CalendarPlus weight="fill" className="h-4 w-4" />} wide>
      {!user && <p className="mb-4 rounded-xl bg-amber-400/15 px-4 py-2 text-sm font-semibold text-amber-700 dark:text-amber-400">You are posting as a guest. Sign in to link this activity to your profile.</p>}
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2"><label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Activity title</label><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Winter Hackathon Kickoff" /></div>
        <div><label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Date</label><input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div><label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Status</label><select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as Activity["status"])}><option value="upcoming">Upcoming</option><option value="completed">Completed</option></select></div>
        <div><label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Category</label><select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value as Activity["category"])}>{ACTIVITY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Location</label><div className="relative"><MapPin weight="bold" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" /><input className={`${inputCls} pl-9`} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Main Campus Hall" /></div></div>
        <div className="sm:col-span-2"><label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Description</label><textarea className={inputCls} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What happens at this session?" /></div>
        <div><label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Expected attendees</label><input type="number" min={0} className={inputCls} value={attendees} onChange={(e) => setAttendees(Number(e.target.value))} /></div>
        <div><label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Resource links (comma separated)</label><input className={inputCls} value={resources} onChange={(e) => setResources(e.target.value)} placeholder="Slides, Repo, Recording" /></div>
        <div className="sm:col-span-2"><ImageUploader value={image} onChange={setImage} label="Event banner (optional)" aspect="aspect-[3/1]" hint="Shown on the activity card · up to 3 MB" /></div>
        <button type="submit" className="sm:col-span-2 mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-3 text-sm font-black text-white transition hover:scale-[1.01] active:scale-95"><CalendarPlus weight="fill" className="h-4 w-4" /> Publish Activity</button>
      </form>
    </Modal>
  );
}

/* ---- two-step safe delete control ---- */
function DeleteButton({ onDelete, disabled, label }: { onDelete: () => void; disabled?: boolean; label?: string }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 5000);
    return () => clearTimeout(t);
  }, [armed]);
  if (armed) {
    return (
      <span className="flex shrink-0 items-center gap-1">
        <button
          onClick={() => { setArmed(false); onDelete(); }}
          className="flex items-center gap-1 rounded-lg bg-rose-500 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-rose-600"
        >
          <Trash weight="bold" className="h-3.5 w-3.5" /> Confirm{label ? ` ${label}` : ""}
        </button>
        <button onClick={() => setArmed(false)} className="grid h-7 w-7 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10" title="Cancel">
          <X weight="bold" className="h-3.5 w-3.5" />
        </button>
      </span>
    );
  }
  return (
    <button
      disabled={disabled}
      onClick={() => setArmed(true)}
      title={disabled ? "Cannot delete this record" : "Delete"}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-zinc-400 transition hover:bg-rose-500/10 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400"
    >
      <Trash weight="bold" className="h-4 w-4" />
    </button>
  );
}

/* ---------------- PATRON HUB ---------------- */
type PatronTab = "broadcasts" | "submissions" | "members" | "council" | "activities" | "gallery";

export function PatronHubModal({ open, onClose, projects, announcements, users, activities, currentUser, onApprove, onReject, onBroadcast, onDeleteAnnouncement, onDeleteProject, onDeleteUser, onDeleteActivity, leaders, onAddLeader, onUpdateLeader, onDeleteLeader, onResetLeaders, photos, onAddPhoto, onDeletePhoto }: {
  open: boolean; onClose: () => void;
  projects: Project[]; announcements: Announcement[]; users: User[]; activities: Activity[]; currentUser: User | null;
  onApprove: (id: string) => void; onReject: (id: string) => void;
  onBroadcast: (a: Omit<Announcement, "id" | "date">) => void; onDeleteAnnouncement: (id: string) => void;
  onDeleteProject: (id: string) => void; onDeleteUser: (id: string) => void; onDeleteActivity: (id: string) => void;
  leaders: Leader[]; onAddLeader: (l: Leader) => void; onUpdateLeader: (l: Leader) => void;
  onDeleteLeader: (id: string) => void; onResetLeaders: () => void;
  photos: ClubPhoto[]; onAddPhoto: (d: Omit<ClubPhoto, "id" | "date">) => void; onDeletePhoto: (id: string) => void;
}) {
  const [tab, setTab] = useState<PatronTab>("broadcasts");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [target, setTarget] = useState("All Students");
  const [priority, setPriority] = useState<Announcement["priority"]>("normal");
  const pending = projects.filter((p) => !p.approved);
  const approved = projects.filter((p) => p.approved);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) { toast.error("Announcement needs a title and message."); return; }
    onBroadcast({ title, content, targetAudience: target, priority, author: "Club Patron" });
    setTitle(""); setContent(""); toast.success("Broadcast sent to members!");
  };

  const TABS: { id: PatronTab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "broadcasts", label: "Broadcasts", icon: <Megaphone weight="bold" className="h-4 w-4" />, count: announcements.length },
    { id: "submissions", label: "Submissions", icon: <Flag weight="fill" className="h-4 w-4" />, count: pending.length },
    { id: "members", label: "Members", icon: <UsersThree weight="fill" className="h-4 w-4" />, count: users.length },
    { id: "council", label: "Council", icon: <Crown weight="fill" className="h-4 w-4" />, count: leaders.length },
    { id: "activities", label: "Activities", icon: <Cpu weight="bold" className="h-4 w-4" />, count: activities.length },
    { id: "gallery", label: "Gallery", icon: <FilmSlate weight="fill" className="h-4 w-4" />, count: photos.length },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Patron Management Hub" icon={<Megaphone weight="fill" className="h-4 w-4" />} wide>
      {/* Tab bar */}
      <div className="mb-5 flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-white/5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
              tab === t.id ? "bg-white text-rose-600 shadow-sm dark:bg-zinc-800 dark:text-rose-400" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-white"
            }`}
          >
            {t.icon}<span className="hidden sm:inline">{t.label}</span>
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${tab === t.id ? "bg-rose-500/15" : "bg-zinc-200 dark:bg-white/10"}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* BROADCASTS */}
      {tab === "broadcasts" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 flex items-center gap-2 font-extrabold text-zinc-900 dark:text-white"><Megaphone weight="bold" className="h-4 w-4 text-rose-500" /> New Broadcast</h3>
            <form onSubmit={send} className="space-y-3">
              <input className={inputCls} placeholder="Announcement title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <textarea className={inputCls} rows={3} placeholder="Message to members..." value={content} onChange={(e) => setContent(e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <select className={inputCls} value={target} onChange={(e) => setTarget(e.target.value)}>
                  {["All Students", "Leadership", "Hackathon Teams", "Exhibition Team", "Web Designers"].map((t) => <option key={t}>{t}</option>)}
                </select>
                <select className={inputCls} value={priority} onChange={(e) => setPriority(e.target.value as Announcement["priority"])}>
                  <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option>
                </select>
              </div>
              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 py-2.5 text-sm font-black text-white"><Megaphone weight="fill" className="h-4 w-4" /> Send Broadcast</button>
            </form>
          </div>
          <div>
            <h3 className="mb-3 font-extrabold text-zinc-900 dark:text-white">Active Announcements</h3>
            <div className="space-y-2">
              {announcements.length === 0 && <p className="text-sm text-zinc-500">No announcements yet.</p>}
              {announcements.map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-2 rounded-xl bg-zinc-50 p-3 dark:bg-white/5">
                  <div className="min-w-0"><p className="truncate text-sm font-bold text-zinc-800 dark:text-white">{a.title}</p><p className="text-xs text-zinc-500">{a.targetAudience} · {a.date}</p></div>
                  <DeleteButton onDelete={() => onDeleteAnnouncement(a.id)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBMISSIONS */}
      {tab === "submissions" && (
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 flex items-center gap-2 font-extrabold text-zinc-900 dark:text-white"><Flag weight="fill" className="h-4 w-4 text-amber-500" /> Pending Review ({pending.length})</h3>
            {pending.length === 0 ? (
              <p className="rounded-xl bg-emerald-500/10 px-4 py-6 text-center text-sm font-semibold text-emerald-600 dark:text-emerald-400">All caught up! No submissions awaiting review.</p>
            ) : (
              <div className="space-y-3">
                {pending.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-zinc-200 p-4 dark:border-white/10">
                    <div className="flex items-center gap-2"><span className={`h-8 w-8 rounded-lg bg-gradient-to-br ${p.gradient}`} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-zinc-800 dark:text-white">{p.title}</p><p className="text-xs text-zinc-500">{p.author} · {p.category}</p></div><DeleteButton onDelete={() => onDeleteProject(p.id)} /></div>
                    <p className="mt-2 line-clamp-2 text-xs text-zinc-500">{p.description}</p>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => onApprove(p.id)} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-500/15 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-500/25"><Check weight="bold" className="h-3.5 w-3.5" /> Approve</button>
                      <button onClick={() => onReject(p.id)} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-rose-500/15 py-2 text-xs font-bold text-rose-600 hover:bg-rose-500/25"><X weight="bold" className="h-3.5 w-3.5" /> Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="mb-3 flex items-center gap-2 font-extrabold text-zinc-900 dark:text-white"><Cpu weight="bold" className="h-4 w-4 text-violet-500" /> Approved Projects ({approved.length})</h3>
            {approved.length === 0 ? (
              <p className="text-sm text-zinc-500">No approved projects yet.</p>
            ) : (
              <div className="space-y-2">
                {approved.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-white/5">
                    <div className="flex min-w-0 items-center gap-2"><span className={`h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br ${p.gradient}`} /><div className="min-w-0"><p className="truncate text-sm font-bold text-zinc-800 dark:text-white">{p.title}</p><p className="text-xs text-zinc-500">{p.author} · {p.votes} votes</p></div></div>
                    <DeleteButton onDelete={() => onDeleteProject(p.id)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MEMBERS */}
      {tab === "members" && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-extrabold text-zinc-900 dark:text-white"><UsersThree weight="fill" className="h-4 w-4 text-violet-500" /> Registered Members ({users.length})</h3>
          {users.length === 0 ? (
            <p className="text-sm text-zinc-500">No member records yet.</p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => {
                const isSelf = currentUser?.id === u.id;
                return (
                  <div key={u.id} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 p-3 dark:border-white/10">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-violet-600 text-sm font-black text-white">{u.fullName.slice(0, 1).toUpperCase()}</span>
                      <div className="min-w-0"><p className="truncate text-sm font-bold text-zinc-800 dark:text-white">{u.fullName} {isSelf && <span className="text-[10px] font-bold uppercase text-rose-500">(you)</span>}</p><p className="truncate text-xs text-zinc-500">{u.email} · {u.nationality}</p></div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${u.role === "patron" ? "bg-rose-500/15 text-rose-600 dark:text-rose-400" : "bg-violet-500/15 text-violet-600 dark:text-violet-400"}`}>{u.role}</span>
                      <DeleteButton onDelete={() => onDeleteUser(u.id)} disabled={isSelf} label="record" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* COUNCIL */}
      {tab === "council" && (
        <LeaderManager leaders={leaders} onAddLeader={onAddLeader} onUpdateLeader={onUpdateLeader} onDeleteLeader={onDeleteLeader} onResetLeaders={onResetLeaders} />
      )}

      {/* ACTIVITIES */}
      {tab === "activities" && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-extrabold text-zinc-900 dark:text-white"><Cpu weight="bold" className="h-4 w-4 text-violet-500" /> Activity Records ({activities.length})</h3>
          {activities.length === 0 ? (
            <p className="text-sm text-zinc-500">No activities logged yet.</p>
          ) : (
            <div className="space-y-2">
              {activities.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 p-3 dark:border-white/10">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400"><Cpu weight="bold" className="h-4 w-4" /></span>
                    <div className="min-w-0"><p className="truncate text-sm font-bold text-zinc-800 dark:text-white">{a.title}</p><p className="text-xs text-zinc-500">{a.category} · {a.date} · {a.status}</p></div>
                  </div>
                  <DeleteButton onDelete={() => onDeleteActivity(a.id)} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* GALLERY MEDIA */}
      {tab === "gallery" && (
        <PatronGalleryTab photos={photos} onAddPhoto={onAddPhoto} onDeletePhoto={onDeletePhoto} uploadedBy={currentUser?.fullName || "Club Patron"} />
      )}
    </Modal>
  );
}

/* ---------------- DESIGNER ADMIN (CMS) ---------------- */
type CmsTab = "settings" | "backgrounds" | "activities" | "sessions" | "council" | "about";

interface AdminProps {
  open: boolean; onClose: () => void;
  settings: SiteSettings; onUpdateSettings: (s: SiteSettings) => void;
  backgrounds: Record<PageId, PageBackground>; onUpdateBackgrounds: (b: Record<PageId, PageBackground>) => void;
  activities: Activity[]; onUpdateActivities: (a: Activity[] | ((p: Activity[]) => Activity[])) => void;
  projects: Project[]; users: User[];
  leaders: Leader[]; onAddLeader: (l: Leader) => void; onUpdateLeader: (l: Leader) => void;
  onDeleteLeader: (id: string) => void; onResetLeaders: () => void;
  sessions: AttendanceSession[]; onUpdateSessions: (s: AttendanceSession[] | ((p: AttendanceSession[]) => AttendanceSession[])) => void;
}

const PAGE_LABELS: { id: PageId; label: string }[] = [
  { id: "home", label: "Home / Hero" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "attendance", label: "Attendance" },
  { id: "leadership", label: "Leadership" },
  { id: "contact", label: "Contact" },
];

export function DesignerAdminModal({ open, onClose, settings, onUpdateSettings, backgrounds, onUpdateBackgrounds, activities, onUpdateActivities, projects, users, leaders, onAddLeader, onUpdateLeader, onDeleteLeader, onResetLeaders, sessions, onUpdateSessions }: AdminProps) {
  const [tab, setTab] = useState<CmsTab>("settings");
  const [s, setS] = useState<SiteSettings>(settings);
  const [bg, setBg] = useState<Record<PageId, PageBackground>>(backgrounds);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingSession, setEditingSession] = useState<AttendanceSession | null>(null);
  const [showSessionForm, setShowSessionForm] = useState(false);

  const field = (k: keyof SiteSettings, v: string | boolean) => setS((prev) => ({ ...prev, [k]: v }));

  const stats = [
    { label: "Projects", value: projects.length, icon: <Cpu weight="fill" className="h-5 w-5" /> },
    { label: "Approved", value: projects.filter((p) => p.approved).length, icon: <Check weight="fill" className="h-5 w-5" /> },
    { label: "Pending", value: projects.filter((p) => !p.approved).length, icon: <Flag weight="fill" className="h-5 w-5" /> },
    { label: "Members", value: users.length, icon: <UsersThree weight="fill" className="h-5 w-5" /> },
  ];

  const saveSettings = () => { onUpdateSettings(s); toast.success("Site settings saved!"); };
  const saveBackgrounds = () => { onUpdateBackgrounds(bg); toast.success("Page backgrounds updated!"); };

  const saveActivity = (a: Activity) => {
    onUpdateActivities((prev) => {
      const exists = prev.find((x) => x.id === a.id);
      return exists ? prev.map((x) => x.id === a.id ? a : x) : [...prev, a];
    });
    setShowActivityForm(false); setEditingActivity(null);
    toast.success("Activity saved!");
  };

  const deleteActivity = (id: string) => {
    onUpdateActivities((prev) => prev.filter((a) => a.id !== id));
    toast.success("Activity deleted.");
  };

  const saveSession = (sess: AttendanceSession) => {
    onUpdateSessions((prev) => {
      const exists = prev.find((x) => x.id === sess.id);
      return exists ? prev.map((x) => x.id === sess.id ? sess : x) : [...prev, sess];
    });
    setShowSessionForm(false); setEditingSession(null);
    toast.success("Session saved!");
  };

  const deleteSession = (id: string) => {
    onUpdateSessions((prev) => prev.filter((x) => x.id !== id));
    toast.success("Session deleted.");
  };

  const tabs: { id: CmsTab; label: string; icon: React.ReactNode }[] = [
    { id: "settings", label: "Settings", icon: <Gear weight="bold" className="h-4 w-4" /> },
    { id: "backgrounds", label: "Backgrounds", icon: <Image weight="bold" className="h-4 w-4" /> },
    { id: "activities", label: "Activities", icon: <Layout weight="bold" className="h-4 w-4" /> },
    { id: "sessions", label: "Sessions", icon: <CalendarPlus weight="bold" className="h-4 w-4" /> },
    { id: "council", label: "Leadership", icon: <Crown weight="fill" className="h-4 w-4" /> },
    { id: "about", label: "Page Text", icon: <TextT weight="bold" className="h-4 w-4" /> },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Website Designer Admin" icon={<ShieldStar weight="fill" className="h-4 w-4" />} wide>
      {/* Stats */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((st) => (
          <div key={st.label} className="glass rounded-2xl p-4 text-center">
            <span className="mx-auto mb-1 grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-rose-500 to-violet-600 text-white">{st.icon}</span>
            <p className="font-mono text-2xl font-bold text-zinc-900 dark:text-white">{st.value}</p>
            <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">{st.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-white/5">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${tab === t.id ? "bg-white text-rose-600 shadow dark:bg-zinc-800 dark:text-rose-400" : "text-zinc-500"}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* SETTINGS TAB */}
      {tab === "settings" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {([
            ["clubName", "Club name"], ["year", "Year"], ["motto", "Motto"], ["theme", "Theme"],
            ["heroHeadline", "Hero headline"], ["heroSubheadline", "Hero subheadline"],
            ["heroTagline", "Hero tagline"], ["patronEmail", "Patron email"],
            ["contactEmail", "Contact email"], ["location", "Location"],
            ["meetingTimes", "Meeting times"], ["announcementBanner", "Banner text"],
          ] as const).map(([k, label]) => (
            <div key={k} className={(k === "heroTagline" || k === "announcementBanner" || k === "heroHeadline" || k === "heroSubheadline") ? "sm:col-span-2" : ""}>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">{label}</label>
              <input className={inputCls} value={s[k] as string} onChange={(e) => field(k, e.target.value)} />
            </div>
          ))}
          <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            <input type="checkbox" checked={s.bannerEnabled} onChange={(e) => field("bannerEnabled", e.target.checked)} className="h-4 w-4 accent-rose-500" /> Show announcement banner
          </label>
          <div className="mt-4 flex gap-3 sm:col-span-2">
            <button onClick={saveSettings} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 px-5 py-2.5 text-sm font-black text-white"><PencilSimple weight="bold" className="h-4 w-4" /> Save Settings</button>
            <button onClick={() => { setS(settings); toast.info("Reverted."); }} className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-bold text-zinc-600 dark:border-white/15 dark:text-zinc-300">Reset</button>
          </div>
        </div>
      )}

      {/* BACKGROUNDS TAB */}
      {tab === "backgrounds" && (
        <div className="space-y-5">
          {PAGE_LABELS.map(({ id, label }) => {
            const b: PageBackground = bg[id] || { type: "none", value: "", overlay: 0 };
            const update = (patch: Partial<PageBackground>) => setBg((prev) => ({ ...prev, [id]: { type: "none", value: "", overlay: 0, ...prev[id], ...patch } }));
            return (
              <div key={id} className="rounded-2xl border border-zinc-200 p-4 dark:border-white/10">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-extrabold text-zinc-900 dark:text-white">{label}</h4>
                  <select className={`${inputCls} !w-auto text-xs`} value={b.type} onChange={(e) => update({ type: e.target.value as PageBackground["type"] })}>
                    <option value="none">No background</option><option value="gradient">Gradient</option><option value="image">Image</option>
                  </select>
                </div>
                {b.type === "gradient" && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {GRADIENT_PRESETS.map((g) => (
                        <button key={g.value} onClick={() => update({ value: g.value })} className={`h-8 w-16 rounded-lg bg-gradient-to-br ${g.value} ${b.value === g.value ? "ring-2 ring-rose-500 ring-offset-2" : ""}`} title={g.label} />
                      ))}
                    </div>
                    <input className={inputCls} placeholder="Custom gradient classes" value={b.value} onChange={(e) => update({ value: e.target.value })} />
                  </div>
                )}
                {b.type === "image" && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {IMAGE_PRESETS.map((img) => (
                        <button key={img.url} onClick={() => update({ value: img.url })} className={`h-10 w-16 overflow-hidden rounded-lg ${b.value === img.url ? "ring-2 ring-rose-500 ring-offset-2" : ""}`}>
                          <img src={img.url} alt={img.label} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <ImageUploader value={b.value} onChange={(v) => update({ value: v || "" })} label="Upload your own background" aspect="aspect-[3/1]" hint="Wide images look best · up to 3 MB" />
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-bold text-zinc-500">Overlay opacity:</label>
                      <input type="range" min={0} max={80} value={b.overlay} onChange={(e) => update({ overlay: Number(e.target.value) })} className="flex-1 accent-rose-500" />
                      <span className="w-8 text-right text-xs font-mono">{b.overlay}%</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div className="flex gap-3">
            <button onClick={saveBackgrounds} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-2.5 text-sm font-black text-white"><PaintBucket weight="fill" className="h-4 w-4" /> Save Backgrounds</button>
            <button onClick={() => { setBg(backgrounds); toast.info("Reverted."); }} className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-bold text-zinc-600 dark:border-white/15 dark:text-zinc-300">Reset</button>
          </div>
        </div>
      )}

      {/* ACTIVITIES CRUD TAB */}
      {tab === "activities" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-zinc-900 dark:text-white">Manage Activities ({activities.length})</h4>
            <button onClick={() => { setShowActivityForm(true); setEditingActivity(null); }} className="flex items-center gap-1 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-500/25"><Plus weight="bold" className="h-3.5 w-3.5" /> Add Activity</button>
          </div>
          {showActivityForm && <ActivityForm activity={editingActivity} onSave={saveActivity} onCancel={() => { setShowActivityForm(false); setEditingActivity(null); }} />}
          <div className="space-y-2">
            {activities.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 dark:border-white/10">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-zinc-800 dark:text-white">{a.title}</p>
                  <p className="text-xs text-zinc-500">{a.category} · {a.date} · {a.status}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingActivity(a); setShowActivityForm(true); }} className="text-zinc-400 hover:text-violet-600"><PencilSimple weight="bold" className="h-4 w-4" /></button>
                  <button onClick={() => deleteActivity(a.id)} className="text-zinc-400 hover:text-rose-500"><Trash weight="bold" className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SESSIONS CRUD TAB */}
      {tab === "sessions" && (
        <div className="space-y-4">
          <div className="rounded-xl bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
            Create the club sessions members check into from the Attendance page. Saved sessions persist instantly.
          </div>
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-zinc-900 dark:text-white">Manage Sessions ({sessions.length})</h4>
            <button onClick={() => { setShowSessionForm(true); setEditingSession(null); }} className="flex items-center gap-1 rounded-lg bg-cyan-500/15 px-3 py-1.5 text-xs font-bold text-cyan-700 hover:bg-cyan-500/25 dark:text-cyan-300"><Plus weight="bold" className="h-3.5 w-3.5" /> New Session</button>
          </div>
          {showSessionForm && <SessionForm session={editingSession} onSave={saveSession} onCancel={() => { setShowSessionForm(false); setEditingSession(null); }} />}
          {sessions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-300 py-8 text-center text-sm text-zinc-500 dark:border-white/15">No sessions yet. Create your first club session above.</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((sess) => (
                <div key={sess.id} className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 dark:border-white/10">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-zinc-800 dark:text-white">{sess.title}</p>
                    <p className="text-xs text-zinc-500">{sess.category} · {sess.date} · {sess.time} · PIN {sess.pin}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => { setEditingSession(sess); setShowSessionForm(true); }} className="text-zinc-400 hover:text-violet-600"><PencilSimple weight="bold" className="h-4 w-4" /></button>
                    <button onClick={() => deleteSession(sess.id)} className="text-zinc-400 hover:text-rose-500"><Trash weight="bold" className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* COUNCIL / LEADERSHIP TAB */}
      {tab === "council" && (
        <LeaderManager leaders={leaders} onAddLeader={onAddLeader} onUpdateLeader={onUpdateLeader} onDeleteLeader={onDeleteLeader} onResetLeaders={onResetLeaders} />
      )}

      {/* ABOUT TEXT TAB */}
      {tab === "about" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">About Section Title</label>
            <input className={inputCls} value={s.aboutTitle} onChange={(e) => field("aboutTitle", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">About Body Text</label>
            <textarea className={inputCls} rows={4} value={s.aboutBody} onChange={(e) => field("aboutBody", e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Mission Statement</label>
            <textarea className={inputCls} rows={3} value={s.missionText} onChange={(e) => field("missionText", e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-zinc-500">Vision Statement</label>
            <textarea className={inputCls} rows={3} value={s.visionText} onChange={(e) => field("visionText", e.target.value)} />
          </div>
          <div className="mt-3 flex gap-3 sm:col-span-2">
            <button onClick={saveSettings} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 px-5 py-2.5 text-sm font-black text-white"><SlidersHorizontal weight="bold" className="h-4 w-4" /> Save Content</button>
            <button onClick={() => { setS(settings); toast.info("Reverted."); }} className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-bold text-zinc-600 dark:border-white/15 dark:text-zinc-300">Reset</button>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3 border-t border-zinc-100 pt-4 dark:border-white/10">
        <a href={`mailto:${s.contactEmail}`} className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-2.5 text-sm font-bold text-cyan-700 dark:text-cyan-300"><EnvelopeSimple weight="bold" className="h-4 w-4" /> Contact Patron</a>
      </div>
    </Modal>
  );
}

/* Activity form sub-component */
function ActivityForm({ activity, onSave, onCancel }: { activity: Activity | null; onSave: (a: Activity) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(activity?.title || "");
  const [date, setDate] = useState(activity?.date || "");
  const [category, setCategory] = useState<Activity["category"]>(activity?.category || "Workshop");
  const [description, setDescription] = useState(activity?.description || "");
  const [status, setStatus] = useState<Activity["status"]>(activity?.status || "upcoming");
  const [attendees, setAttendees] = useState(activity?.attendeesCount || 0);
  const [location, setLocation] = useState(activity?.location || "");
  const [image, setImage] = useState(activity?.image || "");
  const [resources, setResources] = useState(activity?.resources.join(", ") || "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) { toast.error("Title and date are required."); return; }
    onSave({
      id: activity?.id || `a-${Date.now()}`,
      title, date, category, description, status,
      attendeesCount: attendees, location, image: image || undefined,
      resources: resources.split(",").map((r) => r.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={inputCls} placeholder="Activity title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className={inputCls} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value as Activity["category"])}>
          {ACTIVITY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as Activity["status"])}>
          <option value="upcoming">Upcoming</option><option value="completed">Completed</option>
        </select>
        <input className={inputCls} type="number" placeholder="Attendees" value={attendees} onChange={(e) => setAttendees(Number(e.target.value))} />
        <input className={inputCls} placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>
      <textarea className={inputCls} rows={2} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <ImageUploader value={image || undefined} onChange={(v) => setImage(v || "")} label="Event banner (optional)" aspect="aspect-[3/1]" />
      <input className={inputCls} placeholder="Resources (comma separated)" value={resources} onChange={(e) => setResources(e.target.value)} />
      <div className="flex gap-2">
        <button type="submit" className="flex items-center gap-1 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-white"><Check weight="bold" className="h-3.5 w-3.5" /> {activity ? "Update" : "Create"} Activity</button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-zinc-300 px-4 py-2 text-xs font-bold text-zinc-600 dark:border-white/15 dark:text-zinc-300">Cancel</button>
      </div>
    </form>
  );
}