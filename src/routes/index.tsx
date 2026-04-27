import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Images, LayoutGrid, Sparkles, Trash2 } from "lucide-react";
import { usePhotoStore, photoStore } from "@/lib/photo-store";
import { DropZone } from "@/components/DropZone";
import { SwipeDeck } from "@/components/SwipeDeck";
import { ReviewGrid } from "@/components/ReviewGrid";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PhotoSwipe — Sort photos by swiping" },
      {
        name: "description",
        content:
          "Triage a folder of photos by swiping. Swipe right to keep, left to delete, double-tap to favorite.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { photos, history } = usePhotoStore();
  const [view, setView] = useState<"deck" | "review">("deck");

  const pending = useMemo(() => photos.filter((p) => p.status === "pending"), [photos]);
  const sorted = photos.length - pending.length;
  const favCount = photos.filter((p) => p.favorite && p.status !== "deleted").length;
  const delCount = photos.filter((p) => p.status === "deleted").length;

  const showReview = view === "review" || (photos.length > 0 && pending.length === 0);

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      <style>{`
        @keyframes heartPulse {
          0% { transform: scale(0.4); opacity: 0; }
          40% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>

      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-orange-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">PhotoSwipe</h1>
          </div>

          {photos.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
                <span className="flex items-center gap-1"><Trash2 className="h-3.5 w-3.5" /> {delCount}</span>
                <span>·</span>
                <span>Kept {photos.filter((p) => p.status === "kept").length}</span>
                <span>·</span>
                <span>♥ {favCount}</span>
              </div>
              {pending.length > 0 && (
                <Button
                  variant={view === "review" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView(view === "review" ? "deck" : "review")}
                >
                  <LayoutGrid /> {view === "review" ? "Back to deck" : "Review"}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm("Reset everything and start over?")) {
                    photoStore.reset();
                    setView("deck");
                  }
                }}
              >
                Reset
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
        {photos.length === 0 ? (
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Triage your photos by swiping
              </h2>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                Drop a batch of photos, then swipe right to keep, left to delete, or double-tap to
                favorite. All on-device — nothing leaves your browser.
              </p>
            </div>
            <DropZone />
            <div className="mt-8 grid grid-cols-1 gap-4 text-sm text-muted-foreground sm:grid-cols-3">
              <Tip icon="→" title="Swipe right to keep" />
              <Tip icon="←" title="Swipe left to delete" />
              <Tip icon="♥" title="Double-tap to favorite" />
            </div>
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Using iCloud Photos? Open Photos.app on Mac, select your photos, then File → Export →
              Export Unmodified Originals (or as JPG), and drop the folder here.
            </p>
          </div>
        ) : showReview ? (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {pending.length === 0 ? "All done!" : "Review"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {sorted} of {photos.length} sorted
                </p>
              </div>
              <DropZone compact />
            </div>
            <ReviewGrid photos={photos} />
          </div>
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Images className="h-4 w-4" />
              <span>
                {sorted + 1} / {photos.length}
              </span>
            </div>
            <SwipeDeck
              photo={pending[0]}
              next={pending[1] ?? null}
              canUndo={history.length > 0}
            />
          </div>
        )}
      </main>
    </div>
  );
}

function Tip({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
        {icon}
      </span>
      <span className="font-medium text-foreground">{title}</span>
    </div>
  );
}
