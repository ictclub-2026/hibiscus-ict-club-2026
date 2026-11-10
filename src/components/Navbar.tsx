import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flower,
  Rocket,
  UploadSimple,
  Sun,
  Moon,
  ListBullets,
  X,
  SignOut,
  IdentificationCard,
  ShieldStar,
  UsersThree,
} from "@phosphor-icons/react";
import type { PageId, SiteSettings, User } from "../types";

interface NavbarProps {
  settings: SiteSettings;
  user: User | null;
  page: PageId;
  theme: "light" | "dark";
  setPage: (p: PageId) => void;
  toggleTheme: () => void;
  openAuth: () => void;
  openSubmit: () => void;
  openPatron: () => void;
  openAdmin: () => void;
  logout: () => void;
}

const NAV: { id: PageId; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About Us" },
  { id: "projects", label: "Projects" },
  { id: "attendance", label: "Attendance" },
  { id: "leadership", label: "Leadership" },
  { id: "members", label: "Members" },
  { id: "broadcasts", label: "Broadcasts" },
  { id: "gallery", label: "Gallery" },
  { id: "contact", label: "Contact" },
];

export default function Navbar({
  settings,
  user,
  page,
  theme,
  setPage,
  toggleTheme,
  openAuth,
  openSubmit,
  openPatron,
  openAdmin,
  logout,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (p: PageId) => {
    setPage(p);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass shadow-lg shadow-rose-500/5"
          : "bg-transparent"
      }`}
    >
      {/* Top ribbon: motto + theme */}
      <div className="hidden md:block overflow-hidden border-b border-rose-500/10 bg-gradient-to-r from-rose-600 via-violet-700 to-cyan-600 text-white">
        <div className="flex whitespace-nowrap py-1 text-xs font-medium tracking-wide animate-marquee">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="mx-6 flex items-center gap-2">
              <Flower weight="fill" className="h-3.5 w-3.5" />
              {settings.motto} <span className="opacity-60">//</span> {settings.theme}
              <span className="opacity-60">//</span> {settings.clubName} {settings.year}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo */}
        <button onClick={() => go("home")} className="group flex items-center gap-3">
          <div className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 via-fuchsia-600 to-indigo-600 text-white shadow-lg shadow-rose-500/30">
            {settings.clubLogo ? (
              <img src={settings.clubLogo} alt={`${settings.clubName} logo`} className="h-full w-full object-cover" />
            ) : (
              <Flower weight="fill" className="h-6 w-6" />
            )}
            <span className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-cyan-400 text-[8px] font-black text-indigo-950 ring-2 ring-white dark:ring-indigo-950">
              IC
            </span>
          </div>
          <div className="text-left leading-tight">
            <p className="text-sm font-extrabold tracking-tight text-zinc-900 dark:text-white">
              {settings.clubName}
            </p>
            <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
              {settings.motto} <span className="text-zinc-400">·</span>{" "}
              <span className="text-cyan-600 dark:text-cyan-400">{settings.theme}</span>
            </p>
          </div>
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              className={`relative rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                page === n.id
                  ? "text-white"
                  : "text-zinc-600 hover:text-rose-600 dark:text-zinc-300 dark:hover:text-rose-400"
              }`}
            >
              {page === n.id && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-500 to-violet-600"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{n.label}</span>
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200 bg-white/70 text-zinc-700 transition hover:text-rose-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:text-cyan-400"
          >
            {theme === "dark" ? <Sun weight="bold" className="h-4 w-4" /> : <Moon weight="bold" className="h-4 w-4" />}
          </button>

          <button
            onClick={openSubmit}
            className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition hover:scale-[1.03] active:scale-95 sm:flex"
          >
            <UploadSimple weight="bold" className="h-4 w-4" />
            Submit Work
          </button>

          {user ? (
            <div className="relative">
              <RoleMenu
                user={user}
                openPatron={openPatron}
                openAdmin={openAdmin}
                logout={logout}
              />
            </div>
          ) : (
            <button
              onClick={openAuth}
              className="flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-sm font-bold text-violet-700 transition hover:bg-violet-500/20 dark:text-violet-300"
            >
              <IdentificationCard weight="bold" className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200 text-zinc-700 lg:hidden dark:border-white/10 dark:text-zinc-200"
          >
            {mobileOpen ? <X weight="bold" className="h-5 w-5" /> : <ListBullets weight="bold" className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass overflow-hidden border-t border-rose-500/10 lg:hidden"
          >
            <div className="grid grid-cols-2 gap-2 p-4">
              {NAV.map((n) => (
                <button
                  key={n.id}
                  onClick={() => go(n.id)}
                  className={`rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                    page === n.id
                      ? "bg-gradient-to-r from-rose-500 to-violet-600 text-white"
                      : "bg-zinc-100 text-zinc-700 dark:bg-white/5 dark:text-zinc-200"
                  }`}
                >
                  {n.label}
                </button>
              ))}
              <button
                onClick={() => {
                  openSubmit();
                  setMobileOpen(false);
                }}
                className="col-span-2 mt-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 px-4 py-3 text-sm font-bold text-white"
              >
                <Rocket weight="fill" className="h-4 w-4" /> Upload &amp; Submit Project
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function RoleMenu({
  user,
  openPatron,
  openAdmin,
  logout,
}: {
  user: User;
  openPatron: () => void;
  openAdmin: () => void;
  logout: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 py-1.5 pl-1.5 pr-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-500/20 dark:text-emerald-300"
      >
                 <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-xs text-white">
           {user.avatar ? <img src={user.avatar} alt={user.fullName} className="h-full w-full object-cover" /> : user.fullName.split(" ").map((s) => s[0]).slice(0, 2).join("")}
         </span>
        <span className="hidden max-w-[90px] truncate sm:inline">{user.fullName}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-zinc-900">
            <div className="px-3 py-2">
              <p className="text-sm font-bold text-zinc-900 dark:text-white">{user.fullName}</p>
              <p className="text-xs capitalize text-rose-600 dark:text-rose-400">{user.role} · {user.nationality}</p>
            </div>
            <div className="my-1 h-px bg-zinc-100 dark:bg-white/10" />
            {user.role === "patron" && (
              <MenuItem icon={<MegaphoneMini />} label="Patron Hub" onClick={() => { openPatron(); setOpen(false); }} />
            )}
            {user.role === "designer" && (
              <MenuItem icon={<ShieldStar weight="bold" className="h-4 w-4" />} label="Designer Admin" onClick={() => { openAdmin(); setOpen(false); }} />
            )}
            {user.role === "student" && (
              <MenuItem icon={<UsersThree weight="bold" className="h-4 w-4" />} label="My Submissions" onClick={() => { openPatron(); setOpen(false); }} />
            )}
            <MenuItem icon={<SignOut weight="bold" className="h-4 w-4" />} label="Sign Out" onClick={() => { logout(); setOpen(false); }} />
          </div>
        </>
      )}
    </div>
  );
}

function MegaphoneMini() {
  return <ShieldStar weight="bold" className="h-4 w-4" />;
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-rose-500/10 hover:text-rose-600 dark:text-zinc-200 dark:hover:text-rose-400"
    >
      {icon}
      {label}
    </button>
  );
}