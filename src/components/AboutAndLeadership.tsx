import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Lightbulb,
  HandHeart,
  GlobeHemisphereWest,
  UsersThree,
  Crown,
  ShieldStar,
  GraduationCap,
  EnvelopeSimple,
  Phone,
  MapPin,
  Clock,
  Megaphone,
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
  YoutubeLogo,
  WhatsappLogo,
  Check,
  Sparkle,
  PencilSimple,
  Trash,
  UserPlus,
  X,
  FloppyDisk,
  CaretDown,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import type { Leader, SiteSettings, PageBackground, User } from "../types";
import { GRADIENT_PRESETS } from "../mockData";
import ImageUploader from "./ImageUploader";

function BgLayer({ bg }: { bg: PageBackground }) {
  if (!bg || bg.type === "none") return null;
  if (bg.type === "gradient") return <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${bg.value} opacity-10`} />;
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <img src={bg.value} alt="" className="h-full w-full object-cover opacity-15" />
      <div className="absolute inset-0 bg-black" style={{ opacity: bg.overlay / 200 }} />
    </div>
  );
}

interface AboutProps { settings: SiteSettings; background: PageBackground; }

const PILLARS = [
  { title: "Innovation", icon: <Lightbulb weight="fill" className="h-6 w-6" />, body: "We prototype ideas that solve real problems in our school and community, not just homework.", color: "from-rose-500 to-orange-500" },
  { title: "Peer Mentorship", icon: <HandHeart weight="fill" className="h-6 w-6" />, body: "Senior Tech-Benders guide juniors through pair programming, code reviews and build nights.", color: "from-violet-500 to-fuchsia-500" },
  { title: "Digital Literacy", icon: <GraduationCap weight="fill" className="h-6 w-6" />, body: "Every member leaves with practical, job-ready ICT skills across web, data and hardware.", color: "from-cyan-500 to-sky-500" },
  { title: "Regional Impact", icon: <GlobeHemisphereWest weight="fill" className="h-6 w-6" />, body: "We compete and collaborate across East Africa, putting ICT FOR LIFE on the map.", color: "from-emerald-500 to-teal-500" },
];

export function AboutSection({ settings, background }: AboutProps) {
  return (
    <section id="about" className="relative mx-auto max-w-7xl px-4 sm:px-6">
      <BgLayer bg={background} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">About The Club</p>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tighter text-zinc-900 sm:text-4xl dark:text-white">
            {settings.aboutTitle || `Who are the ${settings.motto}?`}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
            {settings.aboutBody}
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                <Target weight="fill" className="h-5 w-5" />
                <h3 className="font-extrabold text-zinc-900 dark:text-white">Our Mission</h3>
              </div>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{settings.missionText}</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <Sparkle weight="fill" className="h-5 w-5" />
                <h3 className="font-extrabold text-zinc-900 dark:text-white">Our Vision</h3>
              </div>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{settings.visionText}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
            <UsersThree weight="fill" className="h-5 w-5" />
            <h3 className="font-extrabold text-zinc-900 dark:text-white">What we stand for</h3>
          </div>
          <ul className="mt-4 space-y-3">
            {[
              "Build in public, learn out loud",
              "No question is too small",
              "Ship something every term",
              "Represent our school with pride",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Check weight="bold" className="h-3 w-3" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((p, i) => (
          <motion.div key={p.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="glass rounded-2xl p-5 transition hover:-translate-y-1">
            <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${p.color} text-white shadow-lg`}>{p.icon}</div>
            <h4 className="mt-3 font-extrabold text-zinc-900 dark:text-white">{p.title}</h4>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{p.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const LEADER_INPUT = "w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-violet-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white";

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  return parts.slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join("");
}

const BLANK_LEADER: Omit<Leader, "id"> = {
  name: "", role: "", title: "", bio: "", initials: "", badge: "", skills: [], accent: GRADIENT_PRESETS[0].value,
};

const LBL = "block text-xs font-bold uppercase tracking-wide text-zinc-500";

export function LeaderFormModal({ open, onClose, initial, onSubmit }: {
  open: boolean; onClose: () => void; initial: Leader | null; onSubmit: (l: Leader) => void;
}) {
  const [form, setForm] = useState<Omit<Leader, "id">>(BLANK_LEADER);
  const [skillsText, setSkillsText] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm(initial ? { ...initial } : { ...BLANK_LEADER });
    setSkillsText((initial?.skills ?? []).join(", "));
  }, [open, initial]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.title.trim()) { toast.error("Leader name and title are required."); return; }
    onSubmit({
      ...form,
      id: initial?.id ?? `l-${Date.now()}`,
      name: form.name.trim(),
      title: form.title.trim(),
      role: form.role.trim() || form.title.trim(),
      badge: form.badge.trim() || form.title.trim(),
      initials: form.initials.trim() || initialsFrom(form.name),
      skills: skillsText.split(",").map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
          <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[88vh] overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-white/10">
              <div className="flex items-center gap-2 font-extrabold text-zinc-900 dark:text-white">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-rose-500 to-violet-600 text-white"><UserPlus weight="fill" className="h-4 w-4" /></span>
                {initial ? "Edit Council Leader" : "Add Council Leader"}
              </div>
              <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/10"><X weight="bold" className="h-4 w-4" /></button>
            </div>
            <div className="max-h-[calc(88vh-64px)] overflow-y-auto p-6">
              <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-4 rounded-2xl bg-zinc-50 p-4 sm:col-span-2 dark:bg-white/5">
                  <div className={`grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br ${form.accent} text-xl font-black text-white shadow-lg`}>
                    {form.avatar ? <img src={form.avatar} alt={form.name} className="h-full w-full object-cover" /> : (form.initials || initialsFrom(form.name) || "??")}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-extrabold text-zinc-900 dark:text-white">{form.name || "New leader name"}</p>
                    <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{form.title || "Position / title"}</p>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <ImageUploader value={form.avatar} onChange={(v) => setForm((p) => ({ ...p, avatar: v }))} label="Leader photo (optional)" aspect="aspect-square" hint="Square portraits look best · up to 3 MB" />
                </div>
                <label className={LBL}>Full name
                  <input className={`${LEADER_INPUT} mt-1 normal-case`} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Namuli Grace" />
                </label>
                <label className={LBL}>Position / title
                  <input className={`${LEADER_INPUT} mt-1 normal-case`} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Club Patron" />
                </label>
                <label className={LBL}>Role label
                  <input className={`${LEADER_INPUT} mt-1 normal-case`} value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} placeholder="e.g. Faculty Advisor" />
                </label>
                <label className={LBL}>Badge text
                  <input className={`${LEADER_INPUT} mt-1 normal-case`} value={form.badge} onChange={(e) => setForm((p) => ({ ...p, badge: e.target.value }))} placeholder="e.g. 2026 Council" />
                </label>
                <label className={LBL}>Email (optional)
                  <input className={`${LEADER_INPUT} mt-1 normal-case`} value={form.email ?? ""} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="name@school.edu" />
                </label>
                <label className={LBL}>Phone (optional)
                  <input className={`${LEADER_INPUT} mt-1 normal-case`} value={form.phone ?? ""} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+256 ..." />
                </label>
                <label className={`${LBL} sm:col-span-2`}>Short bio
                  <textarea rows={3} className={`${LEADER_INPUT} mt-1 normal-case`} value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} placeholder="One or two sentences about this leader..." />
                </label>
                <label className={`${LBL} sm:col-span-2`}>Skills (comma separated)
                  <input className={`${LEADER_INPUT} mt-1 normal-case`} value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="Leadership, Python, Robotics" />
                </label>
                <label className={`${LBL} sm:col-span-2`}>Accent gradient
                  <select className={`${LEADER_INPUT} mt-1 normal-case`} value={form.accent} onChange={(e) => setForm((p) => ({ ...p, accent: e.target.value }))}>
                    {GRADIENT_PRESETS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </label>
                <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
                  <button type="button" onClick={onClose} className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-bold text-zinc-600 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5">Cancel</button>
                  <button type="submit" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-rose-500/20 transition hover:scale-[1.02] active:scale-95">
                    <FloppyDisk weight="fill" className="h-4 w-4" /> {initial ? "Save Changes" : "Add Leader"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function LeaderManager({ leaders, onAddLeader, onUpdateLeader, onDeleteLeader, onResetLeaders }: {
  leaders: Leader[]; onAddLeader: (l: Leader) => void; onUpdateLeader: (l: Leader) => void;
  onDeleteLeader: (id: string) => void; onResetLeaders: () => void;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Leader | null>(null);

  const handleSubmit = (l: Leader) => {
    if (editing) { onUpdateLeader(l); toast.success("Leader updated."); }
    else { onAddLeader(l); toast.success("Leader added to the council."); }
    setFormOpen(false); setEditing(null);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-extrabold text-zinc-900 dark:text-white"><UsersThree weight="fill" className="h-4 w-4 text-violet-500" /> Council &amp; Leadership ({leaders.length})</h3>
        <div className="flex gap-2">
          <button onClick={() => { setEditing(null); setFormOpen(true); }} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 px-3 py-2 text-xs font-bold text-white"><UserPlus weight="bold" className="h-3.5 w-3.5" /> Add Leader</button>
          <button onClick={() => { onResetLeaders(); toast.success("Council reset to defaults."); }} className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5">Reset</button>
        </div>
      </div>
      {leaders.length === 0 ? (
        <p className="rounded-xl bg-amber-500/10 px-4 py-6 text-center text-sm font-semibold text-amber-600 dark:text-amber-400">No council leaders yet. Add your first leader above.</p>
      ) : (
        <div className="space-y-2">
          {leaders.map((l) => (
            <div key={l.id} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 p-3 dark:border-white/10">
              <div className="flex min-w-0 items-center gap-3">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${l.accent} text-sm font-black text-white`}>{l.initials}</span>
                <div className="min-w-0"><p className="truncate text-sm font-bold text-zinc-800 dark:text-white">{l.name}</p><p className="truncate text-xs text-zinc-500">{l.title} · {l.badge}</p></div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => { setEditing(l); setFormOpen(true); }} aria-label={`Edit ${l.name}`} className="grid h-8 w-8 place-items-center rounded-lg bg-violet-500/15 text-violet-600 hover:bg-violet-500/25 dark:text-violet-400"><PencilSimple weight="bold" className="h-4 w-4" /></button>
                <button onClick={() => { onDeleteLeader(l.id); toast.success("Leader removed."); }} aria-label={`Delete ${l.name}`} className="grid h-8 w-8 place-items-center rounded-lg bg-rose-500/15 text-rose-600 hover:bg-rose-500/25 dark:text-rose-400"><Trash weight="bold" className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <LeaderFormModal open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} initial={editing} onSubmit={handleSubmit} />
    </div>
  );
}

interface LeadersProps {
  leaders: Leader[]; background: PageBackground; user?: User | null;
  onAddLeader?: (l: Leader) => void; onUpdateLeader?: (l: Leader) => void;
  onDeleteLeader?: (id: string) => void; onResetLeaders?: () => void;
}

export function LeadershipSection({ leaders, background, user, onAddLeader, onUpdateLeader, onDeleteLeader, onResetLeaders }: LeadersProps) {
  const canManage = !!user && (user.role === "patron" || user.role === "designer");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Leader | null>(null);

  const openAdd = () => { setEditing(null); setFormOpen(true); };

  const handleSubmit = (l: Leader) => {
    if (editing) { onUpdateLeader?.(l); toast.success("Leader updated."); }
    else { onAddLeader?.(l); toast.success("Leader added to the council."); }
    setFormOpen(false); setEditing(null);
  };

  return (
    <section id="leadership" className="relative mx-auto max-w-7xl px-4 sm:px-6">
      <BgLayer bg={background} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">The 2026 Leadership</p>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tighter text-zinc-900 sm:text-4xl dark:text-white">Meet the Tech-Benders Council</h2>
          <p className="mt-2 max-w-[60ch] text-sm text-zinc-600 dark:text-zinc-300">
            Students and staff steering the club through the {`"ICT FOR LIFE"`} year.
          </p>
        </div>
        {canManage && (
          <button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-rose-500/20 transition hover:scale-[1.02] active:scale-95">
            <UserPlus weight="bold" className="h-4 w-4" /> Add Leader
          </button>
        )}
      </div>

      {leaders.length === 0 ? (
        <div className="glass mt-8 rounded-3xl p-10 text-center">
          <UsersThree weight="fill" className="mx-auto h-10 w-10 text-violet-500" />
          <h3 className="mt-3 text-lg font-extrabold text-zinc-900 dark:text-white">No council members yet</h3>
          <p className="mx-auto mt-1 max-w-[42ch] text-sm text-zinc-600 dark:text-zinc-300">Add the first club leader to start building the 2026 council, or restore the default lineup.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {canManage && <button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 px-4 py-2.5 text-sm font-black text-white"><UserPlus weight="bold" className="h-4 w-4" /> Add First Leader</button>}
            <button onClick={() => { onResetLeaders?.(); toast.success("Council reset to defaults."); }} className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-bold text-zinc-600 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5">Reset Default Council</button>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {leaders.map((l, i) => (
            <motion.div key={l.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.06 }} className="group glass relative overflow-hidden rounded-3xl p-6 transition hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-violet-500/10">
              <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${l.accent}`} />
              <div className="flex items-center gap-4">
                <div className={`grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br ${l.accent} text-xl font-black text-white shadow-lg`}>
                  {l.avatar ? <img src={l.avatar} alt={l.name} className="h-full w-full object-cover" /> : l.initials}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold leading-tight text-zinc-900 dark:text-white">{l.name}</h3>
                  <p className="flex items-center gap-1 text-sm font-bold text-rose-600 dark:text-rose-400">
                    {l.role === "Club Patron" ? <Crown weight="fill" className="h-4 w-4" /> : <ShieldStar weight="fill" className="h-4 w-4" />}
                    {l.title}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">{l.bio}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {l.skills.map((s) => (
                  <span key={s} className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-600 dark:bg-white/10 dark:text-zinc-300">{s}</span>
                ))}
              </div>
              {canManage && (
                <div className="mt-4 flex gap-2 border-t border-zinc-200/70 pt-3 dark:border-white/10">
                  <button onClick={() => { setEditing(l); setFormOpen(true); }} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-violet-500/15 py-2 text-xs font-bold text-violet-600 hover:bg-violet-500/25 dark:text-violet-400"><PencilSimple weight="bold" className="h-3.5 w-3.5" /> Edit</button>
                  <button onClick={() => { onDeleteLeader?.(l.id); toast.success("Leader removed."); }} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-rose-500/15 py-2 text-xs font-bold text-rose-600 hover:bg-rose-500/25 dark:text-rose-400"><Trash weight="bold" className="h-3.5 w-3.5" /> Delete</button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <LeaderFormModal open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} initial={editing} onSubmit={handleSubmit} />
    </section>
  );
}

interface ContactProps { settings: SiteSettings; background: PageBackground; }

const FAQ_ITEMS = [
  { q: "How do I join the Tech-Benders club?", a: "Visit the Members page and use the Register button, or ask any council member for a QR invite during weekly sessions." },
  { q: "Do I need prior coding experience?", a: "No. We run beginner tracks in Python, web and robotics. All you need is curiosity and a school email." },
  { q: "Where are meetings held?", a: "In the ICT Lab on the second floor. Sessions are every Wednesday and Saturday afternoon." },
  { q: "Can I submit a project without being a member?", a: "Yes. Use the Submit Project button in the navbar and the council will review it within 48 hours." },
];

export function ContactSection({ settings, background }: ContactProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const cards = [
    { icon: <EnvelopeSimple weight="fill" className="h-5 w-5" />, label: "Club Email", value: settings.contactEmail },
    { icon: <Megaphone weight="fill" className="h-5 w-5" />, label: "Patron", value: settings.patronEmail },
    { icon: <MapPin weight="fill" className="h-5 w-5" />, label: "Location", value: settings.location },
    { icon: <Clock weight="fill" className="h-5 w-5" />, label: "Meeting Times", value: settings.meetingTimes },
  ];
  const socials = [
    { icon: <FacebookLogo weight="fill" className="h-5 w-5" />, name: "Facebook" },
    { icon: <InstagramLogo weight="fill" className="h-5 w-5" />, name: "Instagram" },
    { icon: <LinkedinLogo weight="fill" className="h-5 w-5" />, name: "LinkedIn" },
    { icon: <YoutubeLogo weight="fill" className="h-5 w-5" />, name: "YouTube" },
    { icon: <WhatsappLogo weight="fill" className="h-5 w-5" />, name: "WhatsApp" },
    { icon: <Phone weight="fill" className="h-5 w-5" />, name: "Call" },
  ];

  return (
    <section id="contact" className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <BgLayer bg={background} />
      <div className="glass overflow-hidden rounded-[2rem] p-8 sm:p-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">Get in touch</p>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tighter text-zinc-900 sm:text-4xl dark:text-white">Bend the future with us</h2>
            <p className="mt-3 max-w-[48ch] text-sm text-zinc-600 dark:text-zinc-300">
              Want to join the {settings.motto}, sponsor an event or partner on a project? Reach the club through any channel below.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {cards.map((c) => (
                <div key={c.label} className="flex items-start gap-3 rounded-2xl bg-white/60 p-4 dark:bg-white/5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-violet-600 text-white">{c.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{c.label}</p>
                    <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Follow the Tech-Benders</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {socials.map((s) => (
                  <button key={s.name} onClick={() => toast.success(`Opening ${s.name}`)} aria-label={s.name} className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 bg-white/60 text-zinc-600 transition hover:-translate-y-0.5 hover:border-rose-500/40 hover:text-rose-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                    {s.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-rose-500 via-violet-600 to-indigo-600 p-8 text-white shadow-2xl shadow-rose-500/30">
            <h3 className="text-xl font-extrabold">Send a direct message</h3>
            <p className="mt-1 text-sm text-white/80">Drop your note and the club leadership will reply within 48 hours.</p>
            <form className="mt-5 space-y-3" onSubmit={(e) => { e.preventDefault(); toast.success("Message sent to the Tech-Benders council!"); (e.target as HTMLFormElement).reset(); }}>
              <input required placeholder="Your name" className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/60 outline-none focus:border-white/50" />
              <input required type="email" placeholder="Your email" className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/60 outline-none focus:border-white/50" />
              <textarea required rows={4} placeholder="Your message" className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/60 outline-none focus:border-white/50" />
              <button type="submit" className="w-full rounded-xl bg-white py-3 text-sm font-black text-rose-600 transition hover:scale-[1.02] active:scale-95">Send Message</button>
            </form>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="mt-8 border-t border-zinc-200/60 pt-8 dark:border-white/10">
          <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">Frequently Asked Questions</h3>
          <div className="mt-4 space-y-2">
            {FAQ_ITEMS.map((faq, i) => (
              <div key={i} className="rounded-xl border border-zinc-200 bg-white/60 dark:border-white/10 dark:bg-white/5">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-bold text-zinc-800 dark:text-zinc-100"
                >
                  {faq.q}
                  <CaretDown weight="bold" className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}