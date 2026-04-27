import { useState } from "react";
import { Heart, RotateCcw, X } from "lucide-react";
import { type Photo, photoStore } from "@/lib/photo-store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function ReviewGrid({ photos }: { photos: Photo[] }) {
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const toDelete = photos.filter((p) => p.status === "deleted");
  const kept = photos.filter((p) => p.status === "kept");
  const favorites = photos.filter((p) => p.favorite && p.status !== "deleted");

  return (
    <>
      <Tabs defaultValue="delete" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="delete">To Delete ({toDelete.length})</TabsTrigger>
          <TabsTrigger value="kept">Kept ({kept.length})</TabsTrigger>
          <TabsTrigger value="favorites">Favorites ({favorites.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="delete">
          <Grid photos={toDelete} onOpen={setLightbox} showRestore />
          {toDelete.length === 0 && <Empty text="Nothing marked for deletion." />}
          {toDelete.length > 0 && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              These are flagged for you to delete manually in Photos.app — the app can't reach into
              your library.
            </p>
          )}
        </TabsContent>

        <TabsContent value="kept">
          <Grid photos={kept} onOpen={setLightbox} />
          {kept.length === 0 && <Empty text="No kept photos yet." />}
        </TabsContent>

        <TabsContent value="favorites">
          <Grid photos={favorites} onOpen={setLightbox} />
          {favorites.length === 0 && <Empty text="Double-tap a photo to favorite it." />}
        </TabsContent>
      </Tabs>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightbox.url}
            alt={lightbox.name}
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        </div>
      )}
    </>
  );
}

function Grid({
  photos,
  onOpen,
  showRestore,
}: {
  photos: Photo[];
  onOpen: (p: Photo) => void;
  showRestore?: boolean;
}) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {photos.map((p) => (
        <div key={p.id} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
          <button onClick={() => onOpen(p)} className="block h-full w-full">
            <img src={p.url} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
          </button>
          {p.favorite && (
            <div className="absolute left-2 top-2 rounded-full bg-background/80 p-1 backdrop-blur">
              <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
            </div>
          )}
          {showRestore && (
            <button
              onClick={() => photoStore.restore(p.id)}
              className="absolute inset-x-2 bottom-2 flex items-center justify-center gap-1 rounded-md bg-background/90 px-2 py-1.5 text-xs font-medium opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
            >
              <RotateCcw className="h-3 w-3" /> Restore
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="mt-12 text-center text-sm text-muted-foreground">{text}</p>;
}
