import { useRef, useState, useCallback } from "react";
import { Image, LinkSimple, UploadSimple, Clipboard } from "@phosphor-icons/react";
import { toast } from "sonner";

/** Compress/resize an image file via canvas to keep localStorage manageable. */
export async function compressImage(file: File, maxDim = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file."));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      reject(new Error("Image must be smaller than 8 MB."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = document.createElement("img");
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas not supported.")); return; }
        ctx.drawImage(img, 0, 0, width, height);
        const ext = file.type === "image/png" ? "image/png" : "image/jpeg";
        resolve(canvas.toDataURL(ext, quality));
      };
      img.onerror = () => reject(new Error("Could not load image."));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("We could not read that image."));
    reader.readAsDataURL(file);
  });
}

/** Reads a single image file with compression. */
export async function readImageFile(file: File): Promise<string> {
  return compressImage(file);
}

export interface VideoMeta {
  url: string;
  thumbnail?: string;
  duration?: number;
}

/**
 * Reads a video file: builds a session object URL, extracts a poster frame via
 * an offscreen <video> + <canvas> at the 1s mark, and detects the duration.
 */
export async function readVideoFile(file: File): Promise<VideoMeta> {
  if (!file.type.startsWith("video/")) throw new Error("Please choose a video file.");
  if (file.size > 120 * 1024 * 1024) throw new Error("Video must be smaller than 120 MB.");
  const url = URL.createObjectURL(file);
  return new Promise<VideoMeta>((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    let settled = false;
    const finish = (thumbnail?: string, duration?: number) => {
      if (settled) return;
      settled = true;
      resolve({ url, thumbnail, duration: duration && isFinite(duration) ? duration : undefined });
    };
    const grabFrame = () => {
      try {
        const canvas = document.createElement("canvas");
        const w = video.videoWidth || 640;
        const h = video.videoHeight || 360;
        const ratio = Math.min(1, 800 / w);
        canvas.width = Math.round(w * ratio);
        canvas.height = Math.round(h * ratio);
        const ctx = canvas.getContext("2d");
        if (!ctx) { finish(undefined, video.duration); return; }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        finish(canvas.toDataURL("image/jpeg", 0.82), video.duration);
      } catch {
        finish(undefined, video.duration);
      }
    };
    video.onloadedmetadata = () => {
      const target = Math.min(1, (video.duration || 2) / 2);
      try { video.currentTime = target; } catch { finish(undefined, video.duration); }
    };
    video.onseeked = grabFrame;
    video.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read that video file.")); };
    window.setTimeout(() => { if (!settled) grabFrame(); }, 5000);
    video.src = url;
  });
}

interface ImageUploaderProps {
  value?: string;
  onChange: (value?: string) => void;
  label?: string;
  hint?: string;
  aspect?: string;
}

/**
 * Reusable single-picture picker: file upload via click or drag & drop,
 * live preview, replace/remove controls, optional URL fallback.
 */
export default function ImageUploader({
  value,
  onChange,
  label,
  hint,
  aspect = "aspect-video",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [showUrl, setShowUrl] = useState(false);

  const attach = async (file?: File) => {
    if (!file) return;
    try {
      const url = await compressImage(file);
      onChange(url);
      toast.success("Image attached.");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imgItem = items.find((i) => i.type.startsWith("image/"));
    if (imgItem) {
      const file = imgItem.getAsFile();
      if (file) void attach(file);
    }
  }, []);

  const urlValue = value && !value.startsWith("data:") ? value : "";

  return (
    <div className="space-y-2" onPaste={handlePaste}>
      {label && (
        <span className="block text-xs font-bold uppercase tracking-wide text-zinc-500">{label}</span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void attach(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {value ? (
        <div className={`group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/10 ${aspect}`}>
          <img src={value} alt="Uploaded preview" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-end justify-end gap-2 bg-gradient-to-t from-black/60 via-transparent to-transparent p-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-white/90 px-2.5 py-1.5 text-[11px] font-bold text-zinc-800 shadow transition hover:bg-white"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="rounded-lg bg-rose-500 px-2.5 py-1.5 text-[11px] font-bold text-white shadow transition hover:bg-rose-600"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void attach(e.dataTransfer.files?.[0]);
          }}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-7 text-center transition ${
            dragging
              ? "border-rose-500 bg-rose-500/10"
              : "border-zinc-300 hover:border-rose-500/50 dark:border-white/15"
          }`}
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-violet-600 text-white shadow-lg">
            <Image weight="fill" className="h-5 w-5" />
          </span>
          <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">Click to upload or drag &amp; drop</span>
          <span className="text-xs text-zinc-500">{hint || "PNG, JPG, WEBP or GIF · auto-compressed"}</span>
        </button>
      )}
      <button
        type="button"
        onClick={() => setShowUrl((v) => !v)}
        className="flex items-center gap-1 text-xs font-bold text-violet-600 hover:underline dark:text-violet-400"
      >
        <LinkSimple weight="bold" className="h-3.5 w-3.5" />
        {showUrl ? "Hide URL field" : "Paste an image URL instead"}
      </button>
      {showUrl && (
        <input
          value={urlValue}
          onChange={(e) => onChange(e.target.value || undefined)}
          placeholder="https://example.com/photo.jpg"
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-violet-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      )}
    </div>
  );
}

/* ─── MultiUploader: batch file picker used inside the gallery modal ─── */

export interface MultiUploadItem {
  id: string;
  file?: File;
  url: string;
  title: string;
  category: string;
  caption: string;
}

interface MultiUploaderProps {
  items: MultiUploadItem[];
  onItemsChange: (items: MultiUploadItem[]) => void;
  categories: string[];
  defaultCategory: string;
}

export function MultiUploader({ items, onItemsChange, categories, defaultCategory }: MultiUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const addFiles = async (files: FileList | File[]) => {
    const newItems: MultiUploadItem[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const url = await compressImage(file);
        const name = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
        newItems.push({
          id: `mu-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          file,
          url,
          title: name.charAt(0).toUpperCase() + name.slice(1),
          category: defaultCategory,
          caption: "",
        });
      } catch (err) {
        toast.error(`${file.name}: ${(err as Error).message}`);
      }
    }
    if (newItems.length > 0) {
      onItemsChange([...items, ...newItems]);
      toast.success(`${newItems.length} photo${newItems.length > 1 ? "s" : ""} added to batch.`);
    }
  };

  const addUrl = () => {
    if (!urlInput.trim()) return;
    const id = `mu-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    onItemsChange([...items, { id, url: urlInput.trim(), title: "Linked Photo", category: defaultCategory, caption: "" }]);
    setUrlInput("");
    toast.success("URL photo added to batch.");
  };

  const removeItem = (id: string) => onItemsChange(items.filter((i) => i.id !== id));
  const updateItem = (id: string, patch: Partial<MultiUploadItem>) =>
    onItemsChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const clipItems = Array.from(e.clipboardData.items);
    const imgItem = clipItems.find((i) => i.type.startsWith("image/"));
    if (imgItem) {
      const file = imgItem.getAsFile();
      if (file) void addFiles([file]);
    }
  }, [items]);

  const field = "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none transition focus:border-violet-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white";

  return (
    <div className="space-y-4" onPaste={handlePaste}>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); void addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition ${
          dragging ? "border-rose-500 bg-rose-500/10" : "border-zinc-300 hover:border-rose-500/50 dark:border-white/15"
        }`}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) void addFiles(e.target.files); e.target.value = ""; }} />
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-violet-600 text-white shadow-lg">
          <UploadSimple weight="fill" className="h-5 w-5" />
        </span>
        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">Drop files here, click to browse, or paste from clipboard</span>
        <span className="text-xs text-zinc-500">Multiple images supported · auto-compressed for storage</span>
      </div>

      {/* URL input */}
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setShowUrl((v) => !v)} className="flex items-center gap-1 text-xs font-bold text-violet-600 hover:underline dark:text-violet-400">
          <LinkSimple weight="bold" className="h-3.5 w-3.5" /> {showUrl ? "Hide URL" : "Add by URL"}
        </button>
        {showUrl && (
          <div className="flex flex-1 items-center gap-2">
            <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://example.com/photo.jpg" className={field} onKeyDown={(e) => { if (e.key === "Enter") addUrl(); }} />
            <button type="button" onClick={addUrl} className="shrink-0 rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-violet-700">Add</button>
          </div>
        )}
      </div>

      {/* Batch items */}
      {items.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Batch Preview ({items.length} photo{items.length > 1 ? "s" : ""})</p>
          <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 rounded-xl border border-zinc-200 p-3 dark:border-white/10">
                <img src={item.url} alt={item.title} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                <div className="flex-1 space-y-1.5">
                  <input value={item.title} onChange={(e) => updateItem(item.id, { title: e.target.value })} placeholder="Photo title" className={`${field} !py-1.5 text-xs`} />
                  <div className="flex gap-2">
                    <select value={item.category} onChange={(e) => updateItem(item.id, { category: e.target.value })} className={`${field} !py-1.5 text-xs flex-1`}>
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input value={item.caption} onChange={(e) => updateItem(item.id, { caption: e.target.value })} placeholder="Caption (optional)" className={`${field} !py-1.5 text-xs flex-1`} />
                  </div>
                </div>
                <button type="button" onClick={() => removeItem(item.id)} className="grid h-8 w-8 shrink-0 place-items-center self-start rounded-lg text-zinc-400 transition hover:bg-rose-500/10 hover:text-rose-500" aria-label="Remove from batch">
                  <Clipboard weight="bold" className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}