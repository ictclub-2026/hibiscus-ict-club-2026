import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Builds a clean Google search query for a project's online target.
 * When an external URL exists (demo first, then repo) we search for the bare
 * domain/URL directly (protocol + trailing slash stripped) so Google finds the
 * exact online target instead of mixing the internal project title into the
 * query and returning title-specific results. With no URL, we fall back to the
 * project title (or its category keyword).
 */
export function getGoogleSearchQuery(project: {
  title?: string;
  demoUrl?: string | null;
  repoUrl?: string | null;
  category?: string;
}): string {
  const url = (project.demoUrl || project.repoUrl || "").trim();
  if (url) return url.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  return (project.title || project.category || "Tech-Benders").trim();
}