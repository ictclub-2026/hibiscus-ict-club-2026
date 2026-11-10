import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Images, Camera, Star, Heart, Tag, ArrowCounterClockwise, Plus, Trash,
  Flower, PencilSimple, UploadSimple, FilmSlate, MonitorPlay, Play,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import ImageUploader, { compressImage, readVideoFile } from "./ImageUploader";
import { LOGO_PRESETS, PHOTO_CATEGORIES } from "../mockData";
import {
  isVideo, thumbOf, MediaUploadModal, EditMediaModal, Lightbox,
} from "./GalleryMediaModals";
import type { ClubPhoto, PhotoCategory, SiteSettings, User } from "../types";

const fmtDur = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;

interface GalleryProps {
  photos: ClubPhoto[];
  onAddPhoto: (data: Omit<ClubPhoto, "id" | "date">) => void;
  onAddPhotos: (data: Omit<ClubPhoto, "id" | "date">[]) => void;
  onUpdatePhoto: (id: string, data: Partial<Omit<ClubPhoto, "id" | "date">>) => void;
  onDeletePhoto: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  settings: SiteSettings;
  onUpdateSettings: (s: SiteSettings) => void;
  user: User | null;
}

const glass = "glass rounded-2xl border border-zinc-200/60 dark:border-white/10";

const filterBtn = (on: boolean) =>
  `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
    on
      ? "bg-gradient-to-r from-rose-500 to-violet-600 text-white shadow-lg shadow-rose-500/25"
      : "border border-zinc-200 bg-white/70 text-zinc-600 hover:text-rose-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
  }`;
const filterCount = (on: boolean) => `rounded-full px-1.5 py-0.5 text-[10px] ${on ? "bg-white/25" : "bg-zinc-200 dark:bg-white/10"}`;

export default function GalleryAndMediaSection({
  photos, onAddPhoto, onAddPhotos, onUpdatePhoto, onDeletePhoto,
  onToggleFavorite, settings, onUpdateSettings, user,
}: GalleryProps) {
  const canManage = user?.role === "designer" || user?.role === "patron";

  const categories = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => { if (p.category) set.add(p.category); });
    return Array.from(set);
  }, [photos]);

  const allCategoryOptions = useMemo(() => {
    const base: string[] = [...PHOTO_CATEGORIES];
    categories.forEach((c) => { if (!base.includes(c)) base.push(c); });
    return base;
  }, [categories]);

  const [active, setActive] = useState<string>("All");
  const [mediaFilter, setMediaFilter] = useState<"all" | "image" | "video">("all");

  const visible = useMemo(
    () =>
      photos.filter((p) => {
        const catOk = active === "All" || p.category === active;
        const typeOk =
          mediaFilter === "all" ? true : mediaFilter === "video" ? isVideo(p) : !isVideo(p);
        return catOk && typeOk;
      }),
    [photos, active, mediaFilter],
  );

  const counts = useMemo(
    () => ({
      all: photos.length,
      image: photos.filter((p) => !isVideo(p)).length,
      video: photos.filter(isVideo).length,
    }),
    [photos],
  );

  const [uploadOpen, setUploadOpen] = useState(false);
  const [editPhoto, setEditPhoto] = useState<ClubPhoto | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const openLightbox = (photo: ClubPhoto) => setLightbox(visible.findIndex((p) => p.id === photo.id));
  const step = (dir: number) => setLightbox((i) => (i === null ? i : (i + dir + visible.length) % visible.length));

  const handleInlineDrop = useCallback(async (files: FileList) => {
    if (!canManage) { toast.error("Sign in as designer or patron to upload."); return; }
    const batch: Omit<ClubPhoto, "id" | "date">[] = [];
    for (const file of Array.from(files)) {
      const name = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
      const title = name.charAt(0).toUpperCase() + name.slice(1);
      const category = (active !== "All" ? active : categories[0] || "Community") as PhotoCategory;
      try {
        if (file.type.startsWith("video/")) {
          const meta = await readVideoFile(file);
          batch.push({
            title,
            url: meta.thumbnail || meta.url,
            category,
            uploadedBy: user?.fullName || "Guest",
            favorite: false,
            mediaType: "video",
            videoUrl: meta.url,
            thumbnailUrl: meta.thumbnail,
            duration: meta.duration,
          });
          continue;
        }
        if (!file.type.startsWith("image/")) continue;
        const url = await compressImage(file);
        batch.push({
          title,
          url,
          category,
          uploadedBy: user?.fullName || "Guest",
          favorite: false,
          mediaType: "image",
        });
      } catch (err) { toast.error((err as Error).message); }
    }
    if (batch.length > 0) {
      onAddPhotos(batch);
      toast.success(`${batch.length} item${batch.length > 1 ? "s" : ""} added to the gallery!`);
    }
  }, [canManage, active, categories, user, onAddPhotos]);

  const [inlineDragging, setInlineDragging] = useState(false);

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <Images weight="fill" className="h-3.5 w-3.5" /> Club Media Hub
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tighter text-zinc-900 sm:text-4xl dark:text-white">
            Club <span className="text-gradient">Gallery</span>
          </h2>
          <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            Photos and videos from hackathons, workshops, lab nights and award ceremonies, plus your custom club logo.
          </p>
        </div>
        <button onClick={() => setUploadOpen(true)}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition hover:scale-[1.03] active:scale-95">
          <Plus weight="bold" className="h-4 w-4" /> Add Media
        </button>
      </div>

      <div className={`${glass} mt-8 grid gap-6 p-5 sm:p-6 lg:grid-cols-[auto_1fr]`}>
        <div className="flex items-center gap-4">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 via-fuchsia-600 to-indigo-600 text-white shadow-lg shadow-rose-500/30">
            {settings.clubLogo ? (
              <img src={settings.clubLogo} alt="Club logo" className="h-full w-full object-cover" />
            ) : (
              <Flower weight="fill" className="h-10 w-10" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Club Logo</p>
            <p className="text-sm font-bold text-zinc-900 dark:text-white">
              {settings.clubLogo ? "Custom logo active" : "Default emblem in use"}
            </p>
            <p className="text-xs text-zinc-500">Shown in the navbar and hero banner.</p>
          </div>
        </div>
        <div className="space-y-3">
          <ImageUploader
            value={settings.clubLogo}
            onChange={(v) => { onUpdateSettings({ ...settings, clubLogo: v }); if (v) toast.success("Club logo updated."); }}
            label="Upload or link a logo"
            hint="Square PNG, JPG or SVG works best"
            aspect="aspect-square max-w-[200px]"
          />
          <div className="flex flex-wrap items-center gap-2">
            {LOGO_PRESETS.map((p) => (
              <button key={p.label} onClick={() => { onUpdateSettings({ ...settings, clubLogo: p.url }); toast.success(`${p.label} applied.`); }}
                className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-zinc-700 transition hover:border-rose-500/40 hover:text-rose-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">
                <img src={p.url} alt="" className="h-5 w-5 rounded-full object-cover" /> {p.label}
              </button>
            ))}
            {settings.clubLogo && (
              <button onClick={() => { onUpdateSettings({ ...settings, clubLogo: undefined }); toast.info("Reverted to the default emblem."); }}
                className="flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-500/20 dark:text-rose-400">
                <ArrowCounterClockwise weight="bold" className="h-3.5 w-3.5" /> Reset to default
              </button>
            )}
          </div>
        </div>
      </div>

      {canManage && (
        <div
          onDragOver={(e) => { e.preventDefault(); setInlineDragging(true); }}
          onDragLeave={() => setInlineDragging(false)}
          onDrop={(e) => { e.preventDefault(); setInlineDragging(false); void handleInlineDrop(e.dataTransfer.files); }}
          className={`mt-6 flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-4 text-sm font-bold transition ${
            inlineDragging ? "border-rose-500 bg-rose-500/10 text-rose-600" : "border-zinc-200 text-zinc-500 hover:border-rose-500/40 dark:border-white/10"
          }`}>
          <UploadSimple weight="bold" className="h-4 w-4" />
          Drop photos or videos here for instant insertion, or use the button above for full control
        </div>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-2">
        <button onClick={() => setMediaFilter("all")} className={filterBtn(mediaFilter === "all")}>
          <Images weight="fill" className="h-4 w-4" /> All Media <span className={filterCount(mediaFilter === "all")}>{counts.all}</span>
        </button>
        <button onClick={() => setMediaFilter("image")} className={filterBtn(mediaFilter === "image")}>
          <Camera weight="fill" className="h-4 w-4" /> Photos <span className={filterCount(mediaFilter === "image")}>{counts.image}</span>
        </button>
        <button onClick={() => setMediaFilter("video")} className={filterBtn(mediaFilter === "video")}>
          <MonitorPlay weight="fill" className="h-4 w-4" /> Videos <span className={filterCount(mediaFilter === "video")}>{counts.video}</span>
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {["All", ...categories].map((c) => (
          <button key={c} onClick={() => setActive(c)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              active === c
                ? "bg-gradient-to-r from-rose-500 to-violet-600 text-white shadow-lg shadow-rose-500/25"
                : "border border-zinc-200 bg-white/70 text-zinc-600 hover:text-rose-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
            }`}>
            {c}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className={`${glass} mt-6 flex flex-col items-center gap-3 px-6 py-16 text-center`}>
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-rose-500/15 to-violet-500/15 text-rose-600 dark:text-rose-400">
            <Camera weight="fill" className="h-7 w-7" />
          </span>
          <p className="text-lg font-bold text-zinc-900 dark:text-white">Nothing here yet</p>
          <p className="max-w-[44ch] text-sm text-zinc-500">
            {active === "All"
              ? "This view is empty. Upload the first club photo or video to get started."
              : `Nothing filed under ${active}. Try another category or add new media.`}
          </p>
          <button onClick={() => setUploadOpen(true)}
            className="mt-1 flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-violet-600 px-5 py-2.5 text-sm font-bold text-white">
            <Plus weight="bold" className="h-4 w-4" /> Add Media
          </button>
        </div>
      ) : (
        <div className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {visible.map((p) => (
            <motion.figure key={p.id}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4 }}
              className="group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/10">
              <button onClick={() => openLightbox(p)} className="relative block w-full">
                <img src={thumbOf(p)} alt={p.title} className="w-full object-cover transition duration-500 group-hover:scale-105" />
                {isVideo(p) && (
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm transition duration-300 group-hover:scale-110 group-hover:bg-rose-500/80">
                      <Play weight="fill" className="h-6 w-6" />
                    </span>
                  </span>
                )}
                {isVideo(p) && p.duration ? (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                    <FilmSlate weight="fill" className="h-3 w-3" /> {fmtDur(p.duration)}
                  </span>
                ) : null}
              </button>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-90" />
              <figcaption className="absolute inset-x-0 bottom-0 p-4">
                <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
                  {isVideo(p) ? <FilmSlate weight="fill" className="h-3 w-3" /> : <Tag weight="fill" className="h-3 w-3" />} {p.category}
                </span>
                <p className="text-sm font-bold leading-tight text-white">{p.title}</p>
              </figcaption>
              <div className="absolute right-3 top-3 flex gap-2">
                <button onClick={() => onToggleFavorite(p.id)} aria-label="Favorite"
                  className={`grid h-8 w-8 place-items-center rounded-full backdrop-blur transition ${
                    p.favorite ? "bg-amber-400 text-white" : "bg-black/40 text-white hover:bg-black/60"
                  }`}>
                  {p.favorite ? <Star weight="fill" className="h-4 w-4" /> : <Heart weight="bold" className="h-4 w-4" />}
                </button>
                {canManage && (
                  <>
                    <button onClick={() => setEditPhoto(p)} aria-label="Edit media"
                      className="grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-violet-600">
                      <PencilSimple weight="bold" className="h-4 w-4" />
                    </button>
                    <button onClick={() => { onDeletePhoto(p.id); if (lightbox !== null) setLightbox(null); }} aria-label="Delete media"
                      className="grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-rose-500">
                      <Trash weight="bold" className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </motion.figure>
          ))}
        </div>
      )}

      <AnimatePresence>
        {uploadOpen && (
          <MediaUploadModal
            categories={allCategoryOptions}
            defaultCategory={active !== "All" ? active : categories[0] || "Community"}
            uploadedBy={user?.fullName || "Guest"}
            onClose={() => setUploadOpen(false)}
            onSubmitSingle={(data) => { onAddPhoto(data); }}
            onSubmitBatch={(batch) => { onAddPhotos(batch); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editPhoto && (
          <EditMediaModal
            photo={editPhoto}
            categories={allCategoryOptions}
            onClose={() => setEditPhoto(null)}
            onSave={(data) => { onUpdatePhoto(editPhoto.id, data); setEditPhoto(null); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightbox !== null && visible[lightbox] && (
          <Lightbox photo={visible[lightbox]} onClose={() => setLightbox(null)} onPrev={() => step(-1)} onNext={() => step(1)} />
        )}
      </AnimatePresence>
    </section>
  );
}