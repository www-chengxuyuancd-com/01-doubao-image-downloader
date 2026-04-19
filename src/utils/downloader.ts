import JSZip from "jszip";
import { saveAs } from "file-saver";

const CONCURRENCY = 5;

export async function fetchImage(url: string): Promise<Blob> {
  const res = await fetch(url, { method: "GET", mode: "cors", cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return await res.blob();
}

export function getFileNameFromUrl(url: string, fallbackIndex = 0): string {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop();
    if (last) return decodeURIComponent(last);
  } catch {
    // ignore
  }
  return `image_${Date.now()}_${fallbackIndex}.jpg`;
}

export interface DownloadOptions {
  zipName?: string;
  onProgress?: (current: number, total: number) => void;
  onError?: (url: string, error: unknown) => void;
}

export async function downloadImages(
  urls: string[],
  options: DownloadOptions = {},
): Promise<void> {
  const { zipName = "doubao-images", onProgress, onError } = options;

  if (urls.length === 0) return;

  if (urls.length === 1) {
    const url = urls[0];
    try {
      const blob = await fetchImage(url);
      saveAs(blob, getFileNameFromUrl(url));
      onProgress?.(1, 1);
    } catch (e) {
      onError?.(url, e);
      throw e;
    }
    return;
  }

  const zip = new JSZip();
  const usedNames = new Set<string>();
  const total = urls.length;
  let completed = 0;

  for (let i = 0; i < total; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (url, idxInBatch) => {
        try {
          const blob = await fetchImage(url);
          let name = getFileNameFromUrl(url, i + idxInBatch);
          if (usedNames.has(name)) {
            const dot = name.lastIndexOf(".");
            const base = dot >= 0 ? name.slice(0, dot) : name;
            const ext = dot >= 0 ? name.slice(dot) : "";
            name = `${base}_${i + idxInBatch}${ext}`;
          }
          usedNames.add(name);
          zip.file(name, blob);
          completed += 1;
          onProgress?.(completed, total);
        } catch (e) {
          onError?.(url, e);
        }
      }),
    );
  }

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${zipName}.zip`);
}
