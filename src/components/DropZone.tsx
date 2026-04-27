import { useCallback, useRef, useState } from "react";
import { Upload, ImagePlus } from "lucide-react";
import { photoStore } from "@/lib/photo-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DropZone({ compact = false }: { compact?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const { added, skipped } = photoStore.addFiles(Array.from(files));
    if (added > 0) toast.success(`Added ${added} photo${added === 1 ? "" : "s"}`);
    if (skipped > 0)
      toast.warning(
        `Skipped ${skipped} file${skipped === 1 ? "" : "s"} (HEIC or unsupported — convert to JPG/PNG first)`,
      );
  }, []);

  if (compact) {
    return (
      <>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <ImagePlus /> Add more
        </Button>
      </>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
        dragOver ? "border-primary bg-primary/5" : "border-border bg-card"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Upload className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-xl font-semibold">Drop your photos here</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Drag & drop a folder of photos, or click to choose. Everything stays on your device — no
        uploads. Tip: export from Photos.app as JPG.
      </p>
      <Button className="mt-6" onClick={() => inputRef.current?.click()}>
        <ImagePlus /> Choose photos
      </Button>
    </div>
  );
}
