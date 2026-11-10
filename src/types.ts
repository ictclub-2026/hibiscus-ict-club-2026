export type Role = "student" | "patron" | "designer";

export type Sex = "Male" | "Female";

export type Nationality =
  | "Uganda"
  | "Tanzania"
  | "Kenya"
  | "Rwanda"
  | "Burundi"
  | "South Sudan"
  | "Others";

export type ProjectCategory =
  | "Web & Apps"
  | "Robotics & IoT"
  | "AI & Data"
  | "Graphic & UI Design";

export type ActivityCategory =
  | "Hackathon"
  | "Workshop"
  | "Bootcamp"
  | "Exhibition"
  | "Symposium";

export type Priority = "low" | "normal" | "high";

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: Role;
  sex: Sex;
  nationality: Nationality;
  createdAt: string;
  avatar?: string;
}

export interface Project {
  id: string;
  title: string;
  author: string;
  authorEmail: string;
  category: ProjectCategory;
  description: string;
  gradient: string;
  image?: string;
  demoUrl?: string;
  repoUrl?: string;
  techStack: string[];
  votes: number;
  submissionDate: string;
  approved: boolean;
}

export interface Activity {
  id: string;
  title: string;
  date: string;
  category: ActivityCategory;
  description: string;
  status: "completed" | "upcoming";
  attendeesCount: number;
  location: string;
  resources: string[];
  image?: string;
}

export type AttendanceStatus = "present" | "late" | "absent" | "excused";

export interface AttendanceSession {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  facilitator: string;
  description: string;
  pin: string;
  status: "scheduled" | "ongoing" | "completed";
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  nationality: Nationality;
  status: AttendanceStatus;
  timestamp: string;
  notes?: string;
}

export interface Leader {
  id: string;
  name: string;
  role: string;
  title: string;
  bio: string;
  initials: string;
  badge: string;
  skills: string[];
  accent: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: string;
  date: string;
  priority: Priority;
  author: string;
  image?: string;
}

export type BackgroundType = "gradient" | "image" | "none";

export interface PageBackground {
  type: BackgroundType;
  value: string;
  overlay: number;
}

export type PageId =
  | "home"
  | "about"
  | "projects"
  | "attendance"
  | "leadership"
  | "members"
  | "broadcasts"
  | "gallery"
  | "contact";

export type PhotoCategory =
  | "Community"
  | "Events"
  | "Workshop"
  | "Awards"
  | "Projects";

export type MediaType = "image" | "video";

export interface ClubPhoto {
  id: string;
  title: string;
  url: string;
  caption?: string;
  category: PhotoCategory;
  uploadedBy: string;
  date: string;
  favorite?: boolean;
  mediaType?: MediaType;
  videoUrl?: string;
  thumbnailUrl?: string;
  /** Detected length of an uploaded video, in seconds. */
  duration?: number;
  /** Total view/play count (optional analytics). */
  viewsCount?: number;
}

export interface SiteSettings {
  clubName: string;
  year: string;
  motto: string;
  theme: string;
  patronEmail: string;
  contactEmail: string;
  heroTagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  announcementBanner: string;
  location: string;
  meetingTimes: string;
  bannerEnabled: boolean;
  aboutTitle: string;
  aboutBody: string;
  missionText: string;
  visionText: string;
  clubLogo?: string;
}

export interface ClubDataSnapshot {
  version: 1;
  exportedAt: string;
  exportedBy: string;
  settings: SiteSettings;
  backgrounds: Record<PageId, PageBackground>;
  users: User[];
  projects: Project[];
  activities: Activity[];
  attendanceSessions: AttendanceSession[];
  attendanceRecords: AttendanceRecord[];
  leaders: Leader[];
  announcements: Announcement[];
  photos: ClubPhoto[];
  votedProjectIds: string[];
}