import { useState, useMemo } from "react";
import { CheckSquare, Download, Heart, HeartOff, RotateCcw, Square, X } from "lucide-react";
import { type Photo, photoStore } from "@/lib/photo-store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

type TabKey = "delete" | "kept" | "favorites";

export function ReviewGrid({ photos }: { photos: Photo[] }) {
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const [tab, setTab] = useState<TabKey>("delete");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toDelete = useMemo(() => photos.filter((p) => p.status === "deleted"), [photos]);
  const kept = useMemo(() => photos.filter((p) => p.status === "kept"), [photos]);
  const favorites = useMemo(
    () => photos.filter((p) => p.favorite && p.status !== "deleted"),
    [photos],
  );

  const currentList = tab === "delete" ? toDelete : tab === "kept" ? kept : favorites;
  const visibleIds = currentList.map((p) => p.id);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));

  const switchTab = (next: string) => {
    setTab(next as TabKey);
    setSelected(new Set());
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(visibleIds));
  };

  const exportDeleteList = () => {
    if (toDelete.length === 0) return;
    const lines = [
      `# PhotoSwipe — files marked for deletion (${toDelete.length})`,
      `# Generated ${new Date().toLocaleString()}`,
      "",
      ...toDelete.map((p) => p.name),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `photoswipe-delete-list-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${toDelete.length} filenames`);
  };

  const bulkRestore = () => {
    const ids = [...selected];
    photoStore.restoreMany(ids);
    setSelected(new Set());
    toast.success(`Restored ${ids.length} to the deck`);
  };

  const bulkFavorite = (favorite: boolean) => {
    const ids = [...selected];
    photoStore.setFavoriteMany(ids, favorite);
    setSelected(new Set());
    toast.success(`${favorite ? "Favorited" : "Unfavorited"} ${ids.length}`);
  };

  return (
    <>
      <Tabs value={tab} onValueChange={switchTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="delete">To Delete ({toDelete.length})</TabsTrigger>
          <TabsTrigger value="kept">Kept ({kept.length})</TabsTrigger>
          <TabsTrigger value="favorites">Favorites ({favorites.length})</TabsTrigger>
        </TabsList>

        {/* Action bar */}
        {currentList.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card p-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleAll}>
                {allSelected ? <CheckSquare /> : <Square />}
                {allSelected ? "Deselect all" : "Select all"}
              </Button>
              {selected.size > 0 && (
                <span className="text-xs text-muted-foreground">{selected.size} selected</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {tab === "delete" && (
                <>
                  {selected.size > 0 && (
                    <Button variant="outline" size="sm" onClick={bulkRestore}>
                      <RotateCcw /> Restore selected
                    </Button>
                  )}
                  <Button variant="default" size="sm" onClick={exportDeleteList}>
                    <Download /> Export list (.txt)
                  </Button>
                </>
              )}
              {tab === "kept" && selected.size > 0 && (
                <Button variant="default" size="sm" onClick={() => bulkFavorite(true)}>
                  <Heart /> Favorite selected
                </Button>
              )}
              {tab === "favorites" && selected.size > 0 && (
                <Button variant="outline" size="sm" onClick={() => bulkFavorite(false)}>
                  <HeartOff /> Unfavorite selected
                </Button>
              )}
            </div>
          </div>
        )}

        <TabsContent value="delete">
          <Grid
            photos={toDelete}
            onOpen={setLightbox}
            selected={selected}
            onToggle={toggleOne}
          />
          {toDelete.length === 0 && <Empty text="Nothing marked for deletion." />}
          {toDelete.length > 0 && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Export the list, then in Photos.app paste each filename into search and ⌘-delete —
              the app can't reach into your library.
            </p>
          )}
        </TabsContent>

        <TabsContent value="kept">
          <Grid photos={kept} onOpen={setLightbox} selected={selected} onToggle={toggleOne} />
          {kept.length === 0 && <Empty text="No kept photos yet." />}
        </TabsContent>

        <TabsContent value="favorites">
          <Grid
            photos={favorites}
            onOpen={setLightbox}
            selected={selected}
            onToggle={toggleOne}
          />
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
  selected,
  onToggle,
}: {
  photos: Photo[];
  onOpen: (p: Photo) => void;
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {photos.map((p) => {
        const isSelected = selected.has(p.id);
        return (
          <div
            key={p.id}
            className={`group relative aspect-square overflow-hidden rounded-lg bg-muted ring-2 transition-all ${
              isSelected ? "ring-primary" : "ring-transparent"
            }`}
          >
            <button onClick={() => onOpen(p)} className="block h-full w-full">
              <img
                src={p.url}
                alt={p.name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </button>

            {/* Selection checkbox */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle(p.id);
              }}
              aria-label={isSelected ? "Deselect" : "Select"}
              className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md border backdrop-blur transition-all ${
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-white/60 bg-background/70 opacity-0 group-hover:opacity-100"
              }`}
            >
              {isSelected && <CheckSquare className="h-4 w-4" />}
            </button>

            {p.favorite && (
              <div className="absolute left-2 top-2 rounded-full bg-background/80 p-1 backdrop-blur">
                <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="mt-12 text-center text-sm text-muted-foreground">{text}</p>;
}
