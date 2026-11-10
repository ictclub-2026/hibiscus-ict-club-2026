import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor,
  DeviceTablet,
  DeviceMobile,
  ArrowsOut,
  ArrowClockwise,
  X,
  Play,
  Terminal,
  Cpu,
  WifiHigh,
  ShieldCheck,
  CreditCard,
  Brain,
  Robot,
  GlobeHemisphereWest,
  Palette,
  Lightning,
  Copy,
  ArrowSquareOut,
  CaretRight,
  Globe,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import type { Project, ProjectCategory } from "../types";
import { getGoogleSearchQuery } from "@/lib/utils";

type DeviceView = "desktop" | "tablet" | "mobile";

interface DemoLog {
  time: string;
  msg: string;
  type: "info" | "success" | "action" | "error";
}

const DEVICE_SIZES: Record<DeviceView, { w: string; h: string; label: string }> = {
  desktop: { w: "100%", h: "100%", label: "Desktop" },
  tablet: { w: "768px", h: "1024px", label: "Tablet" },
  mobile: { w: "375px", h: "812px", label: "Mobile" },
};

const CATEGORY_CONFIG: Record<ProjectCategory, { icon: React.ReactNode; color: string; simTitle: string }> = {
  "AI & Data": { icon: <Brain weight="fill" className="h-5 w-5" />, color: "from-violet-500 to-purple-600", simTitle: "AI Campus Bot" },
  "Robotics & IoT": { icon: <Robot weight="fill" className="h-5 w-5" />, color: "from-cyan-500 to-blue-600", simTitle: "IoT Telemetry" },
  "Web & Apps": { icon: <GlobeHemisphereWest weight="fill" className="h-5 w-5" />, color: "from-rose-500 to-pink-600", simTitle: "Web App" },
  "Graphic & UI Design": { icon: <Palette weight="fill" className="h-5 w-5" />, color: "from-amber-500 to-orange-600", simTitle: "Design System" },
};

function now() {
  return new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function ChatbotSim({ addLog }: { addLog: (msg: string, type: DemoLog["type"]) => void }) {
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Hi! I'm the Gebeya Campus AI Assistant. Ask me about courses, schedules, or events!" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const responses: Record<string, string> = {
    schedule: "Your next class is CS201 at 10:00 AM in Room B-12. Lab session at 2:00 PM.",
    events: "Hackathon on Dec 15! Registration closes Dec 10. Check the Events tab for details.",
    courses: "You're enrolled in 4 courses: Web Dev, AI/ML, Data Structures, and UX Design.",
    wifi: "Campus WiFi: Gebeya-Net | Password: tech2024 | Speed: 200Mbps",
    default: "Great question! Based on your profile, I recommend checking the student portal for that. Anything else?",
  };

  const send = useCallback(() => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setInput("");
    setTyping(true);
    addLog(`User query: "${userMsg.slice(0, 30)}..."`, "action");
    setTimeout(() => {
      const lower = userMsg.toLowerCase();
      const key = Object.keys(responses).find((k) => k !== "default" && lower.includes(k)) || "default";
      setMessages((m) => [...m, { role: "bot", text: responses[key] }]);
      setTyping(false);
      addLog(`AI response generated (${key})`, "success");
    }, 1200);
  }, [input, addLog]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white" : "bg-zinc-100 text-zinc-800 dark:bg-white/10 dark:text-zinc-200"}`}>
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-zinc-100 px-4 py-2.5 dark:bg-white/10">
              <div className="flex gap-1">
                {[0, 1, 2].map((d) => (
                  <motion.span key={d} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }} className="h-2 w-2 rounded-full bg-violet-400" />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-zinc-200 p-3 dark:border-white/10">
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask about schedule, events, courses..." className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 dark:border-white/10 dark:bg-white/5 dark:text-white" />
          <button onClick={send} className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2 text-sm font-bold text-white active:scale-95">
            <Play weight="fill" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function IoTSim({ addLog }: { addLog: (msg: string, type: DemoLog["type"]) => void }) {
  const [sensors, setSensors] = useState([
    { name: "Temp Sensor", value: 24.5, unit: "°C", status: "online" },
    { name: "Humidity", value: 62, unit: "%", status: "online" },
    { name: "Motion Det.", value: 0, unit: "events", status: "online" },
    { name: "Power Draw", value: 12.3, unit: "W", status: "online" },
  ]);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!active) return;
    const iv = setInterval(() => {
      setSensors((prev) =>
        prev.map((s) => {
          const delta = (Math.random() - 0.5) * 2;
          const newVal = Math.max(0, s.value + delta);
          return { ...s, value: Math.round(newVal * 10) / 10 };
        })
      );
      addLog(`Telemetry update: ${Math.floor(Math.random() * 3 + 1)} packets received`, "info");
    }, 2000);
    return () => clearInterval(iv);
  }, [active, addLog]);

  const triggerAlert = () => {
    setSensors((prev) => prev.map((s) => (s.name === "Motion Det." ? { ...s, value: s.value + 1, status: "alert" } : s)));
    addLog("⚠ Motion detected! Alert dispatched to security.", "error");
    setTimeout(() => setSensors((prev) => prev.map((s) => (s.name === "Motion Det." ? { ...s, status: "online" } : s))), 3000);
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-600">Live Telemetry</span>
        <button onClick={() => setActive(!active)} className={`rounded-full px-3 py-1 text-xs font-bold ${active ? "bg-emerald-500/15 text-emerald-600" : "bg-zinc-200 text-zinc-500"}`}>
          {active ? "● Streaming" : "○ Paused"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {sensors.map((s) => (
          <motion.div key={s.name} animate={{ scale: s.status === "alert" ? [1, 1.05, 1] : 1 }} transition={{ duration: 0.3 }} className={`rounded-xl border p-3 ${s.status === "alert" ? "border-red-300 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10" : "border-zinc-200 bg-white dark:border-white/10 dark:bg-white/5"}`}>
            <div className="flex items-center gap-1.5">
              <WifiHigh weight="bold" className={`h-3.5 w-3.5 ${s.status === "alert" ? "text-red-500" : "text-cyan-500"}`} />
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{s.name}</span>
            </div>
            <p className="mt-1 text-xl font-black text-zinc-900 dark:text-white">{s.value}<span className="ml-1 text-xs font-medium text-zinc-400">{s.unit}</span></p>
          </motion.div>
        ))}
      </div>
      <div className="mt-auto flex gap-2">
        <button onClick={triggerAlert} className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-bold text-white active:scale-95">
          <ShieldCheck weight="bold" className="mr-1 inline h-4 w-4" /> Simulate Intrusion
        </button>
        <button onClick={() => { setSensors((p) => p.map((s) => ({ ...s, value: 0 }))); addLog("All sensors reset to baseline", "success"); }} className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-bold text-zinc-600 active:scale-95 dark:border-white/10 dark:text-zinc-300">
          <ArrowClockwise weight="bold" className="mr-1 inline h-4 w-4" /> Reset
        </button>
      </div>
    </div>
  );
}

function WebAppSim({ addLog }: { addLog: (msg: string, type: DemoLog["type"]) => void }) {
  const [items] = useState([
    { name: "React Course", price: 49, img: "🎯" },
    { name: "AI Workshop", price: 79, img: "🤖" },
    { name: "UX Masterclass", price: 39, img: "🎨" },
  ]);
  const [cart, setCart] = useState<string[]>([]);
  const [checkout, setCheckout] = useState(false);

  const addToCart = (name: string) => {
    setCart((c) => [...c, name]);
    addLog(`Added "${name}" to cart`, "action");
  };

  const doCheckout = () => {
    setCheckout(true);
    addLog("Processing payment...", "info");
    setTimeout(() => {
      addLog("Payment successful! Order confirmed.", "success");
      setCart([]);
      setTimeout(() => setCheckout(false), 2000);
    }, 1500);
  };

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Course Marketplace</span>
        <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-600">{cart.length} items</span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto">
        {items.map((item) => (
          <div key={item.name} className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.img}</span>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">{item.name}</p>
                <p className="text-xs text-zinc-500">${item.price}</p>
              </div>
            </div>
            <button onClick={() => addToCart(item.name)} className="rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 px-3 py-1.5 text-xs font-bold text-white active:scale-95">
              Add
            </button>
          </div>
        ))}
      </div>
      {cart.length > 0 && (
        <div className="mt-3 rounded-xl bg-zinc-50 p-3 dark:bg-white/5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-zinc-700 dark:text-zinc-200">Total: ${cart.reduce((s, n) => s + (items.find((i) => i.name === n)?.price || 0), 0)}</span>
            <button onClick={doCheckout} disabled={checkout} className="rounded-full bg-gradient-to-r from-rose-500 to-violet-600 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-50">
              {checkout ? "Processing..." : "Checkout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DesignSim({ addLog }: { addLog: (msg: string, type: DemoLog["type"]) => void }) {
  const [selected, setSelected] = useState(0);
  const palettes = [
    { name: "Gebeya Brand", colors: ["#7c3aed", "#ec4899", "#06b6d4", "#f59e0b", "#10b981"] },
    { name: "Dark Tech", colors: ["#0f172a", "#1e293b", "#334155", "#94a3b8", "#e2e8f0"] },
    { name: "Sunset", colors: ["#f97316", "#ef4444", "#ec4899", "#a855f7", "#6366f1"] },
  ];

  const pick = (i: number) => {
    setSelected(i);
    addLog(`Palette switched to "${palettes[i].name}"`, "action");
  };

  return (
    <div className="flex h-full flex-col p-4">
      <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Design System Preview</span>
      <div className="mt-3 flex gap-2">
        {palettes.map((p, i) => (
          <button key={p.name} onClick={() => pick(i)} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${selected === i ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "border border-zinc-200 text-zinc-600 dark:border-white/10 dark:text-zinc-300"}`}>
            {p.name}
          </button>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        {palettes[selected].colors.map((c, i) => (
          <motion.div key={`${selected}-${i}`} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.05 }} className="h-16 flex-1 rounded-xl shadow-inner" style={{ backgroundColor: c }} />
        ))}
      </div>
      <div className="mt-4 space-y-3">
        <div className="rounded-xl p-4" style={{ backgroundColor: palettes[selected].colors[0] }}>
          <p className="text-sm font-bold text-white">Primary CTA Button</p>
        </div>
        <div className="rounded-xl border-2 p-4" style={{ borderColor: palettes[selected].colors[2] }}>
          <p className="text-sm font-bold" style={{ color: palettes[selected].colors[2] }}>Outlined Secondary</p>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: palettes[selected].colors[1] + "20" }}>
          <p className="text-sm font-bold" style={{ color: palettes[selected].colors[1] }}>Surface Card with Accent</p>
        </div>
      </div>
    </div>
  );
}

function SimulationContent({ project, addLog }: { project: Project; addLog: (msg: string, type: DemoLog["type"]) => void }) {
  const cat = project.category;
  if (cat === "AI & Data") return <ChatbotSim addLog={addLog} />;
  if (cat === "Robotics & IoT") return <IoTSim addLog={addLog} />;
  if (cat === "Web & Apps") return <WebAppSim addLog={addLog} />;
  return <DesignSim addLog={addLog} />;
}

interface Props {
  project: Project | null;
  open: boolean;
  onClose: () => void;
}

export default function ProjectLiveDemoModal({ project, open, onClose }: Props) {
  const [device, setDevice] = useState<DeviceView>("desktop");
  const [fullscreen, setFullscreen] = useState(false);
  const [logs, setLogs] = useState<DemoLog[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [showLogs, setShowLogs] = useState(true);
  const [urlInput, setUrlInput] = useState("");
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"sim" | "live">("sim");
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((msg: string, type: DemoLog["type"]) => {
    setLogs((prev) => [...prev.slice(-50), { time: now(), msg, type }]);
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  useEffect(() => {
    if (open && project) {
      setLogs([{ time: now(), msg: `Initializing "${project.title}" demo environment...`, type: "info" }]);
      setTimeout(() => addLog("Simulation ready. Interact with the demo!", "success"), 800);
    }
  }, [open, project, reloadKey, addLog]);

  useEffect(() => {
    if (open && project) {
      setUrlInput(project.demoUrl || `https://demo.gebeya.tech/${project.id}`);
      setLiveUrl(null);
      setViewMode("sim");
    }
  }, [open, project]);

  const reload = () => {
    setReloadKey((k) => k + 1);
    setLogs([]);
  };

  if (!project) return null;

  const navigate = () => {
    let u = urlInput.trim();
    if (!u) return;
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    setLiveUrl(u);
    setViewMode("live");
    addLog(`Navigating embedded preview to ${u}`, "action");
  };

  const copyShare = () => {
    const url = `${window.location.origin}${window.location.pathname}?project=${project.id}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => toast.success("Share link copied to clipboard")).catch(() => toast.error("Could not copy link"));
    } else {
      toast.error("Clipboard is not available in this browser");
    }
  };

  const cfg = CATEGORY_CONFIG[project.category];
  const size = DEVICE_SIZES[device];

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-2 backdrop-blur-md sm:p-4" onClick={onClose}>
          <motion.div
            initial={{ scale: 0.92, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 24 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className={`flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900 ${fullscreen ? "h-[calc(100dvh-1rem)] max-w-none" : "h-[85dvh] max-w-5xl"}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className={`grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-r ${cfg.color} text-white`}>{cfg.icon}</div>
                <div>
                  <p className="text-sm font-extrabold text-zinc-900 dark:text-white">{project.title}</p>
                  <p className="text-[11px] text-zinc-500">{cfg.simTitle} • Interactive Demo</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {/* View mode toggle */}
                <div className="mr-1 hidden rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 sm:flex dark:border-white/10 dark:bg-white/5">
                  <button onClick={() => setViewMode("sim")} className={`rounded-md px-2 py-1 text-[11px] font-bold transition ${viewMode === "sim" ? "bg-white text-zinc-900 shadow-sm dark:bg-white/20 dark:text-white" : "text-zinc-400 hover:text-zinc-600"}`}>Simulation</button>
                  <button onClick={() => { if (liveUrl) setViewMode("live"); else navigate(); }} className={`rounded-md px-2 py-1 text-[11px] font-bold transition ${viewMode === "live" ? "bg-white text-zinc-900 shadow-sm dark:bg-white/20 dark:text-white" : "text-zinc-400 hover:text-zinc-600"}`}>Live URL</button>
                </div>
                <button onClick={copyShare} title="Copy share link" className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-white">
                  <Copy weight="bold" className="h-4 w-4" />
                </button>
                <a href={`https://www.google.com/search?q=${encodeURIComponent(getGoogleSearchQuery(project))}`} target="_blank" rel="noopener noreferrer" title="Search on Google" className="rounded-lg p-2 text-zinc-500 hover:bg-cyan-100 hover:text-cyan-700 dark:hover:bg-cyan-500/10 dark:hover:text-cyan-400">
                  <MagnifyingGlass weight="bold" className="h-4 w-4" />
                </a>
                {/* Device toggle */}
                <div className="mr-2 flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-white/10 dark:bg-white/5">
                  {(["desktop", "tablet", "mobile"] as DeviceView[]).map((d) => (
                    <button key={d} onClick={() => setDevice(d)} className={`rounded-md p-1.5 transition ${device === d ? "bg-white text-zinc-900 shadow-sm dark:bg-white/20 dark:text-white" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"}`}>
                      {d === "desktop" && <Monitor weight="bold" className="h-4 w-4" />}
                      {d === "tablet" && <DeviceTablet weight="bold" className="h-4 w-4" />}
                      {d === "mobile" && <DeviceMobile weight="bold" className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
                <button onClick={reload} title="Reload simulation" className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-white">
                  <ArrowClockwise weight="bold" className="h-4 w-4" />
                </button>
                <button onClick={() => setShowLogs(!showLogs)} title="Toggle logs" className={`rounded-lg p-2 ${showLogs ? "bg-violet-100 text-violet-600 dark:bg-violet-500/20" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/10"}`}>
                  <Terminal weight="bold" className="h-4 w-4" />
                </button>
                <button onClick={() => setFullscreen(!fullscreen)} title="Fullscreen" className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-white">
                  <ArrowsOut weight="bold" className="h-4 w-4" />
                </button>
                <a href={liveUrl || project.demoUrl || `https://demo.gebeya.tech/${project.id}`} target="_blank" rel="noreferrer" title="Open in new tab" className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-white">
                  <ArrowSquareOut weight="bold" className="h-4 w-4" />
                </a>
                <button onClick={onClose} className="ml-1 grid h-8 w-8 place-items-center rounded-lg bg-zinc-100 text-zinc-600 hover:bg-rose-100 hover:text-rose-600 dark:bg-white/10 dark:text-zinc-300">
                  <X weight="bold" className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">
              {/* Device viewport */}
              <div className="flex flex-1 items-center justify-center bg-zinc-100 p-4 dark:bg-zinc-950">
                <motion.div
                  key={reloadKey}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-white/10 dark:bg-zinc-900"
                  style={{ width: size.w, height: size.h, maxWidth: "100%", maxHeight: "100%" }}
                >
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="ml-2 flex flex-1 items-center gap-1 rounded-md bg-white px-2 py-0.5 dark:bg-white/10">
                      <Globe weight="bold" className="h-3 w-3 shrink-0 text-zinc-400" />
                      <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") navigate(); }} className="min-w-0 flex-1 bg-transparent font-mono text-[10px] text-zinc-600 outline-none dark:text-zinc-300" placeholder="Enter a project URL..." />
                      <button onClick={navigate} title="Navigate embedded preview" className="grid h-5 w-5 shrink-0 place-items-center rounded bg-violet-500 text-white hover:bg-violet-600"><CaretRight weight="fill" className="h-3 w-3" /></button>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="h-[calc(100%-36px)] overflow-hidden">
                    {viewMode === "live" && liveUrl ? (
                      <iframe key={reloadKey} src={liveUrl} title={`${project.title} live preview`} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" className="h-full w-full border-0 bg-white" />
                    ) : (
                      <SimulationContent project={project} addLog={addLog} />
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Log panel */}
              <AnimatePresence>
                {showLogs && (
                  <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 220, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="hidden shrink-0 overflow-hidden border-l border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 sm:block">
                    <div className="w-[220px]">
                      <div className="flex items-center gap-1.5 border-b border-zinc-200 px-3 py-2 dark:border-white/10">
                        <Terminal weight="bold" className="h-3.5 w-3.5 text-violet-500" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Console</span>
                      </div>
                      <div ref={logRef} className="h-[calc(100%-37px)] space-y-1 overflow-y-auto p-2 font-mono text-[10px]">
                        {logs.map((l, i) => (
                          <div key={i} className="flex gap-1.5">
                            <span className="shrink-0 text-zinc-400">{l.time}</span>
                            <span className={l.type === "success" ? "text-emerald-600" : l.type === "error" ? "text-rose-500" : l.type === "action" ? "text-violet-600" : "text-zinc-500"}>
                              {l.msg}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-2 dark:border-white/10">
              <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                <span className="flex items-center gap-1"><Cpu weight="bold" className="h-3 w-3" /> {device === "desktop" ? "1920×1080" : device === "tablet" ? "768×1024" : "375×812"}</span>
                <span className="flex items-center gap-1"><Play weight="fill" className="h-3 w-3 text-emerald-500" /> Simulation Active</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.slice(0, 3).map((t) => (
                  <span key={t} className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[10px] text-zinc-500 dark:bg-white/10 dark:text-zinc-400">{t}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}