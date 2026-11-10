import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  X, Sparkle, Camera, FilmSlate, PencilSimple, ArrowLeft, ArrowRight, Play,
  Pause, SpeakerHigh, SpeakerSlash, ArrowsOut, PictureInPicture, DownloadSimple,
  Repeat, Clock,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import ImageUploader, { MultiUploader, readVideoFile, type MultiUploadItem } from "./ImageUploader";
import type { ClubPhoto, PhotoCategory, MediaType } from "../types";

export const isVideo = (p: ClubPhoto) => p.mediaType === "video";
export const thumbOf = (p: ClubPhoto) => (isVideo(p) ? p.thumbnailUrl || p.url : p.url);

/* Resolve a media URL into a playable embed (YouTube / Vimeo / direct file). */
export type VideoEmbed = { kind: "iframe" | "video" | "none"; src: string };

export function toVideoEmbed(url?: string): VideoEmbed {
  if (!url || !url.trim()) return { kind: "none", src: "" };
  const raw = url.trim();
  const yt = raw.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { kind: "iframe", src: `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0` };
  const vm = raw.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { kind: "iframe", src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1` };
  return { kind: "video", src: raw };
}

const field =
  "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-violet-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white";

const fmtTime = (s: number) => {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

/* Interactive custom video player — plays direct files (with full controls) or embeds YouTube/Vimeo. */
export function VideoPlayer({ src, poster, title }: { src: string; poster?: string; title?: string }) {
  const embed = toVideoEmbed(src);
  const ref = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [loop, setLoop] = useState(false);
  const [showRate, setShowRate] = useState(false);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  };
  const seekTo = (t: number) => { const v = ref.current; if (v) v.currentTime = t; };
  const skip = (d: number) => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + d));
  };
  const toggleMute = () => { const v = ref.current; if (!v) return; v.muted = !v.muted; setMuted(v.muted); };
  const changeVolume = (val: number) => {
    const v = ref.current;
    if (!v) return;
    v.volume = val;
    v.muted = val === 0;
    setVolume(val);
    setMuted(val === 0);
  };
  const changeRate = (r: number) => { const v = ref.current; if (!v) return; v.playbackRate = r; setRate(r); setShowRate(false); };
  const toggleLoop = () => { const v = ref.current; if (!v) return; v.loop = !v.loop; setLoop(v.loop); };
  const togglePip = async () => {
    const v = ref.current as (HTMLVideoElement & { requestPictureInPicture?: () => Promise<unknown> }) | null;
    const doc = document as Document & { pictureInPictureElement?: Element; exitPictureInPicture?: () => Promise<void> };
    if (!v || typeof v.requestPictureInPicture !== "function") { toast.info("Picture-in-Picture is not supported in this browser."); return; }
    try {
      if (doc.pictureInPictureElement) await doc.exitPictureInPicture?.();
      else await v.requestPictureInPicture();
    } catch { toast.error("Could not start Picture-in-Picture."); }
  };
  const toggleFullscreen = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  };
  const download = () => {
    const a = document.createElement("a");
    a.href = src;
    a.download = title || "video";
    a.target = "_blank";
    a.rel = "noreferrer";
    a.click();
    toast.success("Download started.");
  };

  useEffect(() => {
    if (embed.kind !== "video") return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault(); toggle(); break;
        case "f": toggleFullscreen(); break;
        case "m": toggleMute(); break;
        case "arrowleft": skip(-5); break;
        case "arrowright": skip(5); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [embed.kind]);

  if (embed.kind === "iframe") {
    return (
      <div className="w-full max-w-4xl">
        <iframe src={embed.src} title={title || "Video"} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen
          className="aspect-video max-h-[75vh] w-full rounded-2xl bg-black" />
        <p className="mt-2 text-center text-[11px] text-white/50">External embed · use the provider play controls</p>
      </div>
    );
  }

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div ref={wrapRef} className="group relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black">
      <video
        ref={ref}
        src={embed.src || src}
        poster={poster}
        autoPlay
        playsInline
        className="max-h-[75vh] w-full bg-black"
        onClick={toggle}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => { setDuration(e.currentTarget.duration || 0); setCurrent(e.currentTarget.currentTime); }}
      />
      {!playing && (
        <button onClick={toggle} aria-label="Play" className="absolute inset-0 grid place-items-center bg-black/25 transition hover:bg-black/35">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md transition group-hover:scale-110">
            <Play weight="fill" className="ml-1 h-9 w-9" />
          </span>
        </button>
      )}

      <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 pt-8">
        <div className="flex items-center gap-2">
          <span className="w-10 shrink-0 text-right text-[11px] font-semibold text-white/80 tabular-nums">{fmtTime(current)}</span>
          <input
            type="range" min={0} max={duration || 0} step={0.1} value={current}
            onChange={(e) => seekTo(Number(e.target.value))} aria-label="Seek"
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full accent-rose-500 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            style={{ background: `linear-gradient(to right, #f43f5e ${progress}%, rgba(255,255,255,0.25) ${progress}%)` }}
          />
          <span className="w-10 shrink-0 text-[11px] font-semibold text-white/80 tabular-nums">{fmtTime(duration)}</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-white">
          <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="grid h-9 w-9 place-items-center rounded-full bg-white/15 transition hover:bg-white/25">
            {playing ? <Pause weight="fill" className="h-4 w-4" /> : <Play weight="fill" className="h-4 w-4" />}
          </button>
          <button onClick={() => skip(-5)} aria-label="Back 5 seconds" className="hidden h-9 w-9 place-items-center rounded-full bg-white/10 text-[10px] font-bold transition hover:bg-white/20 sm:grid">-5s</button>
          <button onClick={() => skip(5)} aria-label="Forward 5 seconds" className="hidden h-9 w-9 place-items-center rounded-full bg-white/10 text-[10px] font-bold transition hover:bg-white/20 sm:grid">+5s</button>
          <div className="flex items-center gap-1.5">
            <button onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20">
              {muted || volume === 0 ? <SpeakerSlash weight="fill" className="h-4 w-4" /> : <SpeakerHigh weight="fill" className="h-4 w-4" />}
            </button>
            <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume} onChange={(e) => changeVolume(Number(e.target.value))} aria-label="Volume"
              className="hidden h-1 w-16 cursor-pointer appearance-none rounded-full bg-white/25 accent-rose-500 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white sm:block" />
          </div>
          <div className="flex-1" />
          <div className="relative">
            <button onClick={() => setShowRate((s) => !s)} className="flex h-9 items-center gap-1 rounded-full bg-white/10 px-2.5 text-[11px] font-bold transition hover:bg-white/20">
              <Clock weight="bold" className="h-4 w-4" /> {rate}×
            </button>
            {showRate && (
              <div className="absolute bottom-11 right-0 flex flex-col gap-0.5 rounded-xl bg-zinc-900/95 p-1 shadow-xl ring-1 ring-white/10">
                {[0.5, 1, 1.25, 1.5, 2].map((r) => (
                  <button key={r} onClick={() => changeRate(r)}
                    className={`rounded-lg px-3 py-1.5 text-left text-xs font-semibold transition ${rate === r ? "bg-rose-500 text-white" : "text-white/80 hover:bg-white/10"}`}>
                    {r}×
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={toggleLoop} aria-label="Loop" className={`grid h-9 w-9 place-items-center rounded-full transition ${loop ? "bg-rose-500 text-white" : "bg-white/10 hover:bg-white/20"}`}>
            <Repeat weight="bold" className="h-4 w-4" />
          </button>
          <button onClick={togglePip} aria-label="Picture in picture" className="hidden h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 sm:grid">
            <PictureInPicture weight="bold" className="h-4 w-4" />
          </button>
          <button onClick={download} aria-label="Download" className="hidden h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 sm:grid">
            <DownloadSimple weight="bold" className="h-4 w-4" />
          </button>
          <button onClick={toggleFullscreen} aria-label="Fullscreen" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20">
            <ArrowsOut weight="bold" className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-white/40">Space play/pause · F fullscreen · M mute · ←/→ seek 5s</p>
      </div>
    </div>
  );
}

/* ─── Media Upload Modal ─── */

export function MediaUploadModal({
  categories, defaultCategory, uploadedBy, onClose, onSubmitSingle, onSubmitBatch,
}: {
  categories: string[];
  defaultCategory: string;
  uploadedBy: string;
  onClose: () => void;
  onSubmitSingle: (data: Omit<ClubPhoto, "id" | "date">) => void;
  onSubmitBatch: (data: Omit<ClubPhoto, "id" | "date">[]) => void;
}) {
  const [tab, setTab] = useState<MediaType>("image");
  const [items, setItems] = useState<MultiUploadItem[]>([]);
  const [customCat, setCustomCat] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [vTitle, setVTitle] = useState("");
  const [vUrl, setVUrl] = useState("");
  const [vThumb, setVThumb] = useState<string | undefined>(undefined);
  const [vCaption, setVCaption] = useState("");
     const [vCategory, setVCategory] = useState(defaultCategory);
   const [vDuration, setVDuration] = useState<number | undefined>(undefined);
   const videoInputRef = useRef<HTMLInputElement>(null);
 
   const allCats = showCustom && customCat.trim() ? [...categories, customCat.trim()] : categories;
 
   const attachVideoFile = async (file?: File) => {
     if (!file) return;
     try {
       const meta = await readVideoFile(file);
       setVUrl(meta.url);
       if (meta.thumbnail) setVThumb(meta.thumbnail);
       setVDuration(meta.duration);
       if (!vTitle.trim()) setVTitle(file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
       toast.success("Video file attached. Preview it below.");
     } catch (err) {
       toast.error((err as Error).message);
     }
   };

  const submitPhotos = () => {
    if (items.length === 0) { toast.error("Add at least one photo first."); return; }
    const batch: Omit<ClubPhoto, "id" | "date">[] = items.map((i) => ({
      title: i.title.trim() || "Untitled",
      url: i.url,
      caption: i.caption.trim() || undefined,
      category: (i.category || defaultCategory) as PhotoCategory,
      uploadedBy,
      favorite: false,
      mediaType: "image",
    }));
    if (batch.length === 1) onSubmitSingle(batch[0]);
    else onSubmitBatch(batch);
    onClose();
  };

  const submitVideo = () => {
    if (!vTitle.trim()) { toast.error("Give the video a title."); return; }
    if (!vUrl.trim()) { toast.error("Paste a YouTube, Vimeo or MP4 link."); return; }
    onSubmitSingle({
      title: vTitle.trim(),
      url: vThumb || vUrl.trim(),
      caption: vCaption.trim() || undefined,
      category: vCategory as PhotoCategory,
      uploadedBy,
      favorite: false,
             mediaType: "video",
       videoUrl: vUrl.trim(),
       thumbnailUrl: vThumb,
       duration: vDuration,
     });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        className="my-auto w-full max-w-xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-100 bg-gradient-to-r from-rose-500 to-violet-600 px-6 py-4 text-white dark:border-white/10">
          <h3 className="flex items-center gap-2 text-lg font-bold"><Camera weight="fill" className="h-5 w-5" /> Add Club Media</h3>
          <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full bg-white/20 transition hover:bg-white/30"><X weight="bold" className="h-4 w-4" /></button>
        </div>

        <div className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-white/5">
            {(["image", "video"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold transition ${
                  tab === t ? "bg-white text-rose-600 shadow dark:bg-zinc-800 dark:text-rose-400" : "text-zinc-500"
                }`}>
                {t === "image" ? <Camera weight="bold" className="h-4 w-4" /> : <FilmSlate weight="bold" className="h-4 w-4" />}
                {t === "image" ? "Photos" : "Video"}
              </button>
            ))}
          </div>

          {tab === "image" ? (
            <MultiUploader items={items} onItemsChange={setItems} categories={allCats} defaultCategory={defaultCategory} />
          ) : (
            <div className="space-y-3">
              <input ref={videoInputRef} type="file" accept="video/*" className="hidden"
                onChange={(e) => { void attachVideoFile(e.target.files?.[0]); e.target.value = ""; }} />
              <button type="button" onClick={() => videoInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); void attachVideoFile(e.dataTransfer.files?.[0]); }}
                className="flex w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-zinc-300 px-4 py-5 text-center transition hover:border-rose-500/50 dark:border-white/15">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-violet-600 text-white shadow-lg">
                  <FilmSlate weight="fill" className="h-5 w-5" />
                </span>
                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">Upload a video file or drop it here</span>
                <span className="text-xs text-zinc-500">MP4, WebM, MOV, OGG · or paste a link below</span>
              </button>
              <input value={vTitle} onChange={(e) => setVTitle(e.target.value)} placeholder="Video title" className={field} />
              <input value={vUrl} onChange={(e) => setVUrl(e.target.value)} placeholder="YouTube, Vimeo or MP4 link" className={field} />
              {vUrl && (
                <div className="overflow-hidden rounded-2xl">
                  <VideoPlayer src={vUrl} poster={vThumb} title={vTitle || "Video preview"} />
                </div>
              )}
              <select value={vCategory} onChange={(e) => setVCategory(e.target.value)} className={field}>
                {allCats.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ImageUploader value={vThumb} onChange={setVThumb} label="Thumbnail (optional)" aspect="aspect-video" hint="Auto-generated from your video, or upload/paste your own" />
              <textarea value={vCaption} onChange={(e) => setVCaption(e.target.value)} rows={2} placeholder="Caption (optional)" className={`${field} resize-none`} />
            </div>
          )}

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setShowCustom((v) => !v)} className="text-xs font-bold text-violet-600 hover:underline dark:text-violet-400">
              {showCustom ? "Hide custom category" : "+ Add custom category"}
            </button>
            {showCustom && (
              <input value={customCat} onChange={(e) => setCustomCat(e.target.value)} placeholder="e.g. Retreats"
                className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-800 outline-none focus:border-violet-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white" />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} className="rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-bold text-zinc-600 transition hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-300">Cancel</button>
            <button onClick={tab === "image" ? submitPhotos : submitVideo}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:scale-[1.03] active:scale-95">
              <Sparkle weight="fill" className="h-4 w-4" />
              {tab === "image" ? (items.length > 1 ? `Add ${items.length} Photos` : "Add to Gallery") : "Add Video"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Edit Media Modal ─── */

export function EditMediaModal({
  photo, categories, onClose, onSave,
}: {
  photo: ClubPhoto;
  categories: string[];
  onClose: () => void;
  onSave: (data: Partial<Omit<ClubPhoto, "id" | "date">>) => void;
}) {
  const video = isVideo(photo);
  const [title, setTitle] = useState(photo.title);
  const [caption, setCaption] = useState(photo.caption || "");
  const [category, setCategory] = useState<string>(photo.category);
  const [url, setUrl] = useState<string | undefined>(photo.url);
  const [videoUrl, setVideoUrl] = useState<string>(photo.videoUrl || "");
  const [thumb, setThumb] = useState<string | undefined>(photo.thumbnailUrl);

  const save = () => {
    if (!title.trim()) { toast.error("Title cannot be empty."); return; }
    if (video) {
      if (!videoUrl.trim()) { toast.error("Video URL is required."); return; }
      onSave({ title: title.trim(), caption: caption.trim() || undefined, category: category as PhotoCategory, videoUrl: videoUrl.trim(), thumbnailUrl: thumb, url: thumb || url });
    } else {
      if (!url) { toast.error("Photo URL is required."); return; }
      onSave({ title: title.trim(), caption: caption.trim() || undefined, category: category as PhotoCategory, url });
    }
    toast.success(video ? "Video updated." : "Photo updated.");
  };

  const full = `${field} px-4`;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        className="my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-100 bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 text-white dark:border-white/10">
          <h3 className="flex items-center gap-2 text-lg font-bold">
            {video ? <FilmSlate weight="fill" className="h-5 w-5" /> : <PencilSimple weight="fill" className="h-5 w-5" />} Edit {video ? "Video" : "Photo"}
          </h3>
          <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full bg-white/20 transition hover:bg-white/30"><X weight="bold" className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4 p-6">
          {video ? (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500">Video URL</label>
                <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className={`mt-1 ${full}`} />
              </div>
              <ImageUploader value={thumb} onChange={setThumb} label="Thumbnail" hint="Upload a poster image or paste a URL" />
            </>
          ) : (
            <ImageUploader value={url} onChange={setUrl} label="Replace Picture" hint="Upload a new image or paste a URL" />
          )}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={`mt-1 ${full}`} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={`mt-1 ${full}`}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500">Caption (optional)</label>
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={3} placeholder="A short caption..." className={`mt-1 ${full} resize-none`} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} className="rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-bold text-zinc-600 transition hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-300">Cancel</button>
            <button onClick={save} className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:scale-[1.03] active:scale-95">
              <Sparkle weight="fill" className="h-4 w-4" /> Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Lightbox ─── */

export function Lightbox({
  photo, onClose, onPrev, onNext,
}: {
  photo: ClubPhoto; onClose: () => void; onPrev: () => void; onNext: () => void;
}) {
  const video = isVideo(photo);
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/90 p-4 backdrop-blur">
      <div className="flex items-center justify-between text-white">
        <div className="min-w-0">
          <p className="truncate text-lg font-bold">{photo.title}</p>
          <p className="text-xs text-white/70">
            {video ? "Video" : "Photo"} · {photo.category} · {photo.uploadedBy} · {photo.date}
          </p>
        </div>
        <button onClick={onClose} aria-label="Close" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"><X weight="bold" className="h-5 w-5" /></button>
      </div>
      <div className="relative flex flex-1 items-center justify-center py-4">
        <button onClick={onPrev} aria-label="Previous" className="absolute left-0 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25"><ArrowLeft weight="bold" className="h-5 w-5" /></button>
        {video ? (
          <VideoPlayer key={photo.id} src={photo.videoUrl || photo.url} poster={photo.thumbnailUrl} title={photo.title} />
        ) : (
          <motion.img key={photo.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            src={photo.url} alt={photo.title} className="max-h-[75vh] max-w-full rounded-2xl object-contain" />
        )}
        <button onClick={onNext} aria-label="Next" className="absolute right-0 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25"><ArrowRight weight="bold" className="h-5 w-5" /></button>
      </div>
      {photo.caption && <p className="mx-auto max-w-2xl text-center text-sm text-white/80">{photo.caption}</p>}
    </div>
  );
}

export function PlayBadge() {
  return (
    <span className="grid h-14 w-14 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm">
      <Play weight="fill" className="h-6 w-6" />
    </span>
  );
}