import { useRef, useState, useEffect } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUploadImage, validateImageFile } from "@/hooks/use-uploads";
import type { components } from "@/api/schema.d.ts";

type UploadFolder = components["schemas"]["GeneratePresignDto"]["folder"];

interface ImageUploadProps {
  folder: UploadFolder;
  initialUrl?: string;
  onUploadComplete: (url: string | null) => void;
  className?: string;
}

export default function ImageUpload({
  folder,
  initialUrl,
  onUploadComplete,
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(initialUrl);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  const { upload, isPending } = useUploadImage({ onProgress: setProgress });

  // Sync when initialUrl changes (e.g. switching between edit targets)
  useEffect(() => {
    setPreview(initialUrl);
  }, [initialUrl]);

  async function handleFile(file: File) {
    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setProgress(0);

    try {
      const fileUrl = await upload(file, folder);
      URL.revokeObjectURL(objectUrl);
      setPreview(fileUrl);
      onUploadComplete(fileUrl);
    } catch {
      URL.revokeObjectURL(objectUrl);
      setPreview(initialUrl);
      toast.error("Image upload failed. Please try again.");
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) void handleFile(file);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    setPreview(undefined);
    onUploadComplete(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleInputChange}
        disabled={isPending}
      />

      {preview ? (
        <div
          role="button"
          tabIndex={0}
          className={cn(
            "group relative cursor-pointer overflow-hidden rounded-lg border",
            isPending && "cursor-wait",
          )}
          onClick={() => !isPending && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isPending) inputRef.current?.click();
          }}
        >
          <img src={preview} alt="Preview" className="aspect-square w-full object-cover" />

          {isPending ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50">
              <Loader2 className="size-4 animate-spin text-white" />
              <span className="text-xs font-medium text-white">{progress}%</span>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="text-xs font-medium text-white">Change image</span>
            </div>
          )}

          {!isPending && (
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              className="absolute top-1.5 right-1.5 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={handleClear}
            >
              <X className="size-3" />
            </Button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => {
            setIsDragging(false);
          }}
          onDrop={handleDrop}
          disabled={isPending}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
          )}
        >
          <div className="bg-muted rounded-full p-2">
            <Upload className="text-muted-foreground size-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Click or drag to upload</p>
            <p className="text-muted-foreground text-xs">PNG, JPG, WEBP · max 5 MB</p>
          </div>
        </button>
      )}
    </div>
  );
}
