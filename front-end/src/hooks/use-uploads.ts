import { useState } from "react";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Only JPEG, PNG, and WebP images are allowed.";
  }
  if (file.size > MAX_SIZE_BYTES) return "File must be under 5 MB.";
  return null;
}

export function useGeneratePresignedUrl() {
  const [isPending, setIsPending] = useState(false);
  async function mutateAsync(_body: unknown) {
    setIsPending(true);
    await new Promise((r) => setTimeout(r, 200));
    setIsPending(false);
    return { uploadUrl: "mock://upload", fileUrl: "mock://file" };
  }
  return { mutateAsync, isPending };
}

interface UseUploadImageOptions {
  onProgress?: (pct: number) => void;
}

export function useUploadImage({ onProgress }: UseUploadImageOptions = {}) {
  const [isPending, setIsPending] = useState(false);

  async function upload(file: File, _folder: string): Promise<string> {
    setIsPending(true);
    // Simulate upload progress
    for (let p = 0; p <= 100; p += 20) {
      await new Promise((r) => setTimeout(r, 60));
      onProgress?.(p);
    }
    // Return a local object URL so a preview is visible
    const url = URL.createObjectURL(file);
    setIsPending(false);
    return url;
  }

  return { upload, isPending };
}
