import { useState, useCallback, useEffect, useMemo } from "react";
import { Toaster, toast } from "sonner";
import Navbar from "./components/Navbar";
import HeroAndStats from "./components/HeroAndStats";
import { AboutSection, LeadershipSection, ContactSection } from "./components/AboutAndLeadership";
import ProjectsAndActivities from "./components/ProjectsAndActivities";
import MembersDirectory from "./components/MembersDirectory";
import BroadcastsSection from "./components/BroadcastsSection";
import GalleryAndMediaSection from "./components/GalleryAndMediaSection";
import { AuthModal, SubmitModal, PatronHubModal, DesignerAdminModal } from "./components/AuthAndPortalModals";
import AttendanceSection from "./components/AttendanceSection";
import {
  DEFAULT_SETTINGS,
  DEFAULT_BACKGROUNDS,
  SEED_USERS,
  SEED_PROJECTS,
  SEED_ACTIVITIES,
  SEED_LEADERS,
  SEED_ANNOUNCEMENTS,
  SEED_PHOTOS,
  SEED_ATTENDANCE_SESSIONS,
  SEED_ATTENDANCE_RECORDS,
} from "./mockData";
import type {
  User, Project, Activity, Leader, Announcement, ClubPhoto,
  SiteSettings, PageBackground, PageId, AttendanceSession, AttendanceRecord,
} from "./types";

function usePersist<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch { return initial; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(state)); }, [key, state]);
  return [state, setState];
}

export default function App() {
  const [settings, setSettings] = usePersist<SiteSettings>("cms_settings", DEFAULT_SETTINGS);
  const [storedBackgrounds, setBackgrounds] = usePersist<Partial<Record<PageId, PageBackground>>>("cms_backgrounds", DEFAULT_BACKGROUNDS);
  // Defensive hydration: stale/empty/corrupt localStorage must never leave a page background undefined.
  const backgrounds = useMemo<Record<PageId, PageBackground>>(() => {
    const merged: Record<PageId, PageBackground> = { ...DEFAULT_BACKGROUNDS };
    const src = storedBackgrounds as Record<string, PageBackground> | null;
    if (src && typeof src === "object") {
      (Object.keys(merged) as PageId[]).forEach((k) => {
        const v = src[k];
        if (v && typeof v === "object" && !Array.isArray(v)) merged[k] = { ...merged[k], ...v };
      });
    }
    return merged;
  }, [storedBackgrounds]);
  const [users, setUsers] = usePersist<User[]>("cms_users", SEED_USERS);
  const [projects, setProjects] = usePersist<Project[]>("cms_projects", SEED_PROJECTS);
  const [activities, setActivities] = usePersist<Activity[]>("cms_activities", SEED_ACTIVITIES);
  const [attendanceSessions, setAttendanceSessions] = usePersist<AttendanceSession[]>("cms_attendance_sessions", SEED_ATTENDANCE_SESSIONS);
  const [attendanceRecords, setAttendanceRecords] = usePersist<AttendanceRecord[]>("cms_attendance_records", SEED_ATTENDANCE_RECORDS);
  const [leaders, setLeaders] = usePersist<Leader[]>("cms_leaders", SEED_LEADERS);
  const [announcements, setAnnouncements] = usePersist<Announcement[]>("cms_announcements", SEED_ANNOUNCEMENTS);
  const [photos, setPhotos] = usePersist<ClubPhoto[]>("cms_photos", SEED_PHOTOS);

  const [currentUser, setCurrentUser] = usePersist<User | null>("cms_session", null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const toggleTheme = () => setTheme((t) => t === "light" ? "dark" : "light");
  const [page, setPage] = useState<PageId>("home");
  const [authOpen, setAuthOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [patronOpen, setPatronOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [votedProjectIds, setVotedProjectIds] = usePersist<string[]>("club_user_voted_projects", []);
  const [deepLinkProject, setDeepLinkProject] = useState<string | null>(null);

  const handleLogin = useCallback((identifier: string, password: string) => {
    const u = users.find((x) =>
      (x.username.toLowerCase() === identifier.toLowerCase() || x.email.toLowerCase() === identifier.toLowerCase()) && x.password === password
    );
    if (u) { setCurrentUser(u); setAuthOpen(false); toast.success(`Welcome back, ${u.fullName}!`); }
    else { toast.error("Invalid credentials. Check your username/email and password."); }
  }, [users, setCurrentUser]);

  const handleRegister = useCallback((data: Omit<User, "id" | "createdAt">) => {
    if (users.some((u) => u.password === data.password)) {
      toast.error("This password is already taken by another user. Please choose a unique password.");
      return undefined;
    }
    const newUser: User = { ...data, id: `u-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10) };
    setUsers((prev) => [...prev, newUser]);
    toast.success(`Welcome to the club, ${newUser.fullName.split(" ")[0]}! Your account is ready.`);
    return newUser;
  }, [users, setUsers]);

  const handleVote = useCallback((id: string) => {
    const already = votedProjectIds.includes(id);
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, votes: Math.max(0, p.votes + (already ? -1 : 1)) } : p));
    setVotedProjectIds((prev) => (already ? prev.filter((x) => x !== id) : [...prev, id]));
    if (already) { toast.info("Vote removed."); }
    else { toast.success(currentUser ? `Thanks for voting, ${currentUser.fullName.split(" ")[0]}!` : "Thanks for your vote, guest!"); }
  }, [votedProjectIds, currentUser, setProjects, setVotedProjectIds]);

  const handleSubmitProject = useCallback((data: Omit<Project, "id" | "votes" | "submissionDate" | "approved">) => {
    const newProject: Project = { ...data, id: `p-${Date.now()}`, votes: 0, submissionDate: new Date().toISOString().slice(0, 10), approved: false };
    setProjects((prev) => [...prev, newProject]);
    setSubmitOpen(false);
    toast.success("Project submitted! It will appear once approved by the council.");
  }, [setProjects]);

  const handleApprove = useCallback((id: string) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, approved: true } : p));
    toast.success("Project approved and published to the showcase!");
  }, [setProjects]);

  const handleReject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast.info("Project rejected and removed from the queue.");
  }, [setProjects]);

  const handleBroadcast = useCallback((data: Omit<Announcement, "id" | "date">) => {
    const ann: Announcement = { ...data, id: `an-${Date.now()}`, date: new Date().toISOString().slice(0, 10) };
    setAnnouncements((prev) => [ann, ...prev]);
  }, [setAnnouncements]);

  const handleDeleteAnnouncement = useCallback((id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    toast.success("Announcement deleted.");
  }, [setAnnouncements]);

  const handleDeleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast.success("Project removed.");
  }, [setProjects]);

  const handleDeleteUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success("Member record deleted.");
  }, [setUsers]);

  const handleDeleteActivity = useCallback((id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    toast.success("Activity deleted.");
  }, [setActivities]);

  const handleAddLeader = useCallback((l: Leader) => {
    setLeaders((prev) => [...prev, l]);
  }, [setLeaders]);

  const handleUpdateLeader = useCallback((l: Leader) => {
    setLeaders((prev) => prev.map((x) => (x.id === l.id ? l : x)));
  }, [setLeaders]);

  const handleDeleteLeader = useCallback((id: string) => {
    setLeaders((prev) => prev.filter((x) => x.id !== id));
  }, [setLeaders]);

  const handleResetLeaders = useCallback(() => {
    setLeaders(SEED_LEADERS);
  }, [setLeaders]);

  const handleAddPhoto = useCallback((data: Omit<ClubPhoto, "id" | "date">) => {
    const photo: ClubPhoto = { ...data, id: `ph-${Date.now()}`, date: new Date().toISOString().slice(0, 10) };
    setPhotos((prev) => [photo, ...prev]);
    toast.success("Photo added to the club gallery!");
  }, [setPhotos]);

  const handleAddPhotos = useCallback((batch: Omit<ClubPhoto, "id" | "date">[]) => {
    const now = Date.now();
    const newPhotos: ClubPhoto[] = batch.map((data, i) => ({ ...data, id: `ph-${now}-${i}`, date: new Date().toISOString().slice(0, 10) }));
    setPhotos((prev) => [...newPhotos, ...prev]);
    toast.success(`${newPhotos.length} photos added to the gallery!`);
  }, [setPhotos]);

  const handleUpdatePhoto = useCallback((id: string, data: Partial<Omit<ClubPhoto, "id" | "date">>) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  }, [setPhotos]);

  const handleDeletePhoto = useCallback((id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    toast.success("Photo removed from the gallery.");
  }, [setPhotos]);

  const handleToggleFavorite = useCallback((id: string) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p)));
  }, [setPhotos]);

  const openAuth = () => setAuthOpen(true);
  const openSubmit = () => setSubmitOpen(true);

  // Deep-link support: ?project=<id> opens the project; ?page=<id> / ?tab=<id> switches views.
  useEffect(() => {
    const apply = () => {
      const params = new URLSearchParams(window.location.search);
      const proj = params.get("project");
      const tab = params.get("page") || params.get("tab");
      const validPages: PageId[] = ["home", "about", "projects", "attendance", "leadership", "members", "broadcasts", "gallery", "contact"];
      if (tab && (validPages as string[]).includes(tab)) setPage(tab as PageId);
      if (proj) { setPage("projects"); setDeepLinkProject(proj); }
    };
    apply();
    window.addEventListener("popstate", apply);
    return () => window.removeEventListener("popstate", apply);
  }, []);

  const leaderProps = {
    leaders,
    background: backgrounds.leadership,
    user: currentUser,
    onAddLeader: handleAddLeader,
    onUpdateLeader: handleUpdateLeader,
    onDeleteLeader: handleDeleteLeader,
    onResetLeaders: handleResetLeaders,
  };

  const projectsAndActivitiesProps = {
    projects,
    activities,
    onVote: handleVote,
    onSubmitClick: openSubmit,
    user: currentUser,
    onDeleteProject: handleDeleteProject,
    votedProjectIds,
    deepLinkProjectId: deepLinkProject,
    onDeepLinkHandled: () => {
      setDeepLinkProject(null);
      window.history.replaceState({}, "", window.location.pathname);
    },
  };

  const renderPage = () => {
    switch (page) {
      case "home":
        return (
          <>
            <HeroAndStats settings={settings} announcements={announcements} background={backgrounds.home} setPage={setPage} openAuth={openAuth} openSubmit={openSubmit} users={users} projects={projects} activities={activities} attendanceSessions={attendanceSessions} />
            <AboutSection settings={settings} background={backgrounds.about} />
            <ProjectsAndActivities {...projectsAndActivitiesProps} background={backgrounds.projects} />
            <LeadershipSection {...leaderProps} />
            <ContactSection settings={settings} background={backgrounds.contact} />
          </>
        );
      case "about":
        return <><AboutSection settings={settings} background={backgrounds.about} /><LeadershipSection {...leaderProps} /></>;
      case "projects":
        return <ProjectsAndActivities {...projectsAndActivitiesProps} background={backgrounds.projects} />;
      case "attendance":
        return (
          <AttendanceSection
            sessions={attendanceSessions}
            records={attendanceRecords}
            members={users}
            background={backgrounds.attendance}
            user={currentUser}
            setSessions={setAttendanceSessions}
            setRecords={setAttendanceRecords}
          />
        );
      case "leadership":
        return <LeadershipSection {...leaderProps} />;
      case "members":
        return <MembersDirectory users={users} projects={projects} background={backgrounds.members} />;
      case "broadcasts":
        return <BroadcastsSection announcements={announcements} background={backgrounds.broadcasts} user={currentUser} onBroadcast={handleBroadcast} onDeleteAnnouncement={handleDeleteAnnouncement} />;
      case "gallery":
        return (
          <GalleryAndMediaSection
            photos={photos}
            onAddPhoto={handleAddPhoto}
            onAddPhotos={handleAddPhotos}
            onUpdatePhoto={handleUpdatePhoto}
            onDeletePhoto={handleDeletePhoto}
            onToggleFavorite={handleToggleFavorite}
            settings={settings}
            onUpdateSettings={setSettings}
            user={currentUser}
          />
        );
      case "contact":
        return <ContactSection settings={settings} background={backgrounds.contact} />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-white">
      <Toaster position="top-right" richColors />
      <Navbar
        settings={settings}
        page={page}
        setPage={setPage}
        user={currentUser}
        theme={theme}
        toggleTheme={toggleTheme}
        openAuth={openAuth}
        openSubmit={openSubmit}
        openPatron={() => setPatronOpen(true)}
        openAdmin={() => setAdminOpen(true)}
        logout={() => { setCurrentUser(null); toast.info("Signed out. See you next time!"); }}
      />
      <main>{renderPage()}</main>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} users={users} onLogin={handleLogin} onRegister={handleRegister} />
      <SubmitModal open={submitOpen} onClose={() => setSubmitOpen(false)} onSubmit={handleSubmitProject} user={currentUser} />
      
      <PatronHubModal
        open={patronOpen}
        onClose={() => setPatronOpen(false)}
        projects={projects}
        announcements={announcements}
        users={users}
        activities={activities}
        currentUser={currentUser}
        onApprove={handleApprove}
        onReject={handleReject}
        onBroadcast={handleBroadcast}
        onDeleteAnnouncement={handleDeleteAnnouncement}
        onDeleteProject={handleDeleteProject}
        onDeleteUser={handleDeleteUser}
        onDeleteActivity={handleDeleteActivity}
        leaders={leaders}
        onAddLeader={handleAddLeader}
        onUpdateLeader={handleUpdateLeader}
        onDeleteLeader={handleDeleteLeader}
        onResetLeaders={handleResetLeaders}
        photos={photos}
        onAddPhoto={handleAddPhoto}
        onDeletePhoto={handleDeletePhoto}
      />
      <DesignerAdminModal
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        backgrounds={backgrounds}
        onUpdateBackgrounds={setBackgrounds}
        activities={activities}
        onUpdateActivities={setActivities}
        projects={projects}
        users={users}
        leaders={leaders}
        onAddLeader={handleAddLeader}
        onUpdateLeader={handleUpdateLeader}
        onDeleteLeader={handleDeleteLeader}
        onResetLeaders={handleResetLeaders}
        sessions={attendanceSessions}
        onUpdateSessions={setAttendanceSessions}
      />
    </div>
  );
}