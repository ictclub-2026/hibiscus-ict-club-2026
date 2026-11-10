import { useState } from "react";
import { Plus, Trash, Camera, FilmSlate, Play } from "@phosphor-icons/react";
import { toast } from "sonner";
import ImageUploader from "./ImageUploader";
import { PHOTO_CATEGORIES } from "../mockData";
import type { ClubPhoto, MediaType, PhotoCategory } from "../types";

const inputCls =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-rose-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white";

interface Props {
  photos: ClubPhoto[];
  onAddPhoto: (d: Omit<ClubPhoto, "id" | "date">) => void;
  onDeletePhoto: (id: string) => void;
  uploadedBy: string;
}

export function PatronGalleryTab({ photos, onAddPhoto, onDeletePhoto, uploadedBy }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [mediaType, setMediaType] = useState<MediaType>("image");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [thumb, setThumb] = useState<string | undefined>(undefined);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<string>(PHOTO_CATEGORIES[0]);

  const categories = Array.from(new Set<string>([...PHOTO_CATEGORIES, ...photos.map((p) => p.category)]));

  const submit = () => {
    if (!title.trim()) { toast.error("Give the media a title."); return; }
    if (!url.trim()) { toast.error(mediaType === "video" ? "Paste a video link." : "Add a photo first."); return; }
    onAddPhoto({
      title: title.trim(),
      url: mediaType === "video" ? (thumb || url.trim()) : url.trim(),
      caption: caption.trim() || undefined,
      category: category as PhotoCategory,
      uploadedBy,
      favorite: false,
      mediaType,
      videoUrl: mediaType === "video" ? url.trim() : undefined,
      thumbnailUrl: mediaType === "video" ? thumb : undefined,
    });
    setTitle(""); setUrl(""); setThumb(undefined); setCaption("");
    toast.success(mediaType === "video" ? "Video added to the gallery!" : "Photo added to the gallery!");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-extrabold text-zinc-900 dark:text-white">
          <FilmSlate weight="fill" className="h-4 w-4 text-rose-500" /> Gallery Media ({photos.length})
        </h3>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-500/25">
          <Plus weight="bold" className="h-3.5 w-3.5" /> {showForm ? "Close" : "Add Media"}
        </button>
      </div>

      {showForm && (
        <div className="space-y-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-white p-1 dark:bg-white/5">
            {(["image", "video"] as const).map((t) => (
              <button key={t} onClick={() => setMediaType(t)}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold ${mediaType === t ? "bg-rose-500 text-white" : "text-zinc-500"}`}>
                {t === "image" ? <Camera weight="bold" className="h-4 w-4" /> : <FilmSlate weight="bold" className="h-4 w-4" />}
                {t === "image" ? "Photo" : "Video"}
              </button>
            ))}
          </div>
          <input className={inputCls} placeholder="Media title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {mediaType === "video" ? (
            <>
              <input className={inputCls} placeholder="YouTube, Vimeo or MP4 link" value={url} onChange={(e) => setUrl(e.target.value)} />
              <ImageUploader value={thumb} onChange={setThumb} label="Thumbnail (optional)" aspect="aspect-video" hint="Shown on the gallery card" />
            </>
          ) : (
            <ImageUploader value={url} onChange={setUrl} label="Photo" hint="Upload an image or paste a URL" />
          )}
          <textarea className={inputCls} rows={2} placeholder="Caption (optional)" value={caption} onChange={(e) => setCaption(e.target.value)} />
          <button onClick={submit}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 py-2.5 text-sm font-black text-white">
            <Plus weight="bold" className="h-4 w-4" /> Add to Gallery
          </button>
        </div>
      )}

      {photos.length === 0 ? (
        <p className="text-sm text-zinc-500">No media in the gallery yet. Add photos and videos above.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((p) => (
            <div key={p.id} className="group relative overflow-hidden rounded-xl border border-zinc-200 dark:border-white/10">
              <img src={p.mediaType === "video" ? (p.thumbnailUrl || p.url) : p.url} alt={p.title} className="h-28 w-full object-cover" />
              {p.mediaType === "video" && (
                <span className="absolute left-1/2 top-[34%] grid h-8 w-8 -translate-x-1/2 place-items-center rounded-full bg-black/55 text-white">
                  <Play weight="fill" className="h-4 w-4" />
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-2">
                <p className="truncate text-[11px] font-bold text-white">{p.title}</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold uppercase text-white backdrop-blur">
                  {p.mediaType === "video" ? "Video" : "Photo"} · {p.category}
                </span>
              </div>
              <button onClick={() => onDeletePhoto(p.id)} aria-label="Remove media"
                className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur transition hover:bg-rose-500 group-hover:opacity-100">
                <Trash weight="bold" className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}