import { useEffect, useRef, useState } from "react";
import { Heart, X, Check, Undo2 } from "lucide-react";
import { type Photo, photoStore } from "@/lib/photo-store";
import { Button } from "@/components/ui/button";

const SWIPE_THRESHOLD = 110;
const DOUBLE_TAP_MS = 280;

export function SwipeDeck({ photo, next, canUndo }: { photo: Photo; next: Photo | null; canUndo: boolean }) {
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [exit, setExit] = useState<"left" | "right" | null>(null);
  const [pulse, setPulse] = useState(false);
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const lastTapRef = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Reset on photo change
  useEffect(() => {
    setDrag({ x: 0, y: 0 });
    setExit(null);
  }, [photo.id]);

  function commit(direction: "left" | "right") {
    setExit(direction);
    setTimeout(() => {
      photoStore.swipe(photo.id, direction === "left" ? "deleted" : "kept");
    }, 220);
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!startRef.current) return;
    setDrag({ x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y });
  }
  function onPointerUp(e: React.PointerEvent) {
    if (!startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    const dt = Date.now() - startRef.current.t;
    const moved = Math.hypot(dx, dy);
    startRef.current = null;

    // Tap detection
    if (moved < 8 && dt < 300) {
      const now = Date.now();
      if (now - lastTapRef.current < DOUBLE_TAP_MS) {
        lastTapRef.current = 0;
        photoStore.toggleFavorite(photo.id);
        setPulse(true);
        setTimeout(() => setPulse(false), 500);
      } else {
        lastTapRef.current = now;
      }
      setDrag({ x: 0, y: 0 });
      return;
    }

    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      commit(dx > 0 ? "right" : "left");
    } else {
      setDrag({ x: 0, y: 0 });
    }
  }

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") commit("left");
      else if (e.key === "ArrowRight") commit("right");
      else if (e.key.toLowerCase() === "f") {
        photoStore.toggleFavorite(photo.id);
        setPulse(true);
        setTimeout(() => setPulse(false), 500);
      } else if (e.key.toLowerCase() === "u") photoStore.undo();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo.id]);

  const rotation = drag.x / 18;
  const opacity = Math.min(Math.abs(drag.x) / 140, 1);

  let transform = `translate(${drag.x}px, ${drag.y}px) rotate(${rotation}deg)`;
  let transition = startRef.current ? "none" : "transform 220ms ease, opacity 220ms ease";
  let cardOpacity = 1;
  if (exit === "left") {
    transform = "translate(-140%, 40px) rotate(-30deg)";
    cardOpacity = 0;
  } else if (exit === "right") {
    transform = "translate(140%, 40px) rotate(30deg)";
    cardOpacity = 0;
  }

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col items-center gap-6">
      <div className="relative aspect-[3/4] w-full">
        {/* Next card peek */}
        {next && (
          <div className="absolute inset-0 scale-95 rounded-3xl bg-muted shadow-md overflow-hidden opacity-60">
            <img src={next.url} alt="" className="h-full w-full object-cover" />
          </div>
        )}

        {/* Active card */}
        <div
          ref={cardRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            startRef.current = null;
            setDrag({ x: 0, y: 0 });
          }}
          className="absolute inset-0 select-none touch-none rounded-3xl bg-card shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
          style={{ transform, transition, opacity: cardOpacity }}
        >
          <img
            src={photo.url}
            alt={photo.name}
            draggable={false}
            className="pointer-events-none h-full w-full object-cover"
          />

          {/* Favorite indicator */}
          {photo.favorite && (
            <div className="absolute right-3 top-3 rounded-full bg-background/80 backdrop-blur px-2.5 py-1.5">
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            </div>
          )}

          {/* Double-tap heart pulse */}
          {pulse && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <Heart
                className="h-32 w-32 fill-red-500 text-red-500 drop-shadow-2xl"
                style={{ animation: "heartPulse 500ms ease-out forwards" }}
              />
            </div>
          )}

          {/* Edge tints */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-red-500/70 to-transparent"
            style={{ opacity: drag.x < 0 ? opacity : 0 }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-emerald-500/70 to-transparent"
            style={{ opacity: drag.x > 0 ? opacity : 0 }}
          />

          {/* Action labels */}
          <div
            className="pointer-events-none absolute left-6 top-8 rounded-lg border-4 border-red-500 px-3 py-1 text-2xl font-extrabold text-red-500 -rotate-12"
            style={{ opacity: drag.x < -20 ? opacity : 0 }}
          >
            DELETE
          </div>
          <div
            className="pointer-events-none absolute right-6 top-8 rounded-lg border-4 border-emerald-500 px-3 py-1 text-2xl font-extrabold text-emerald-500 rotate-12"
            style={{ opacity: drag.x > 20 ? opacity : 0 }}
          >
            KEEP
          </div>

          {/* Filename footer */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
            <p className="truncate text-sm text-white">{photo.name}</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-4">
        <Button
          size="icon"
          variant="outline"
          className="h-14 w-14 rounded-full border-2 hover:border-red-500 hover:text-red-500"
          onClick={() => commit("left")}
          aria-label="Delete"
        >
          <X className="!h-6 !w-6" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className={`h-12 w-12 rounded-full border-2 ${photo.favorite ? "border-red-500 text-red-500" : "hover:border-red-500 hover:text-red-500"}`}
          onClick={() => {
            photoStore.toggleFavorite(photo.id);
            setPulse(true);
            setTimeout(() => setPulse(false), 500);
          }}
          aria-label="Favorite"
        >
          <Heart className={`!h-5 !w-5 ${photo.favorite ? "fill-red-500" : ""}`} />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-14 w-14 rounded-full border-2 hover:border-emerald-500 hover:text-emerald-500"
          onClick={() => commit("right")}
          aria-label="Keep"
        >
          <Check className="!h-6 !w-6" />
        </Button>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          disabled={!canUndo}
          onClick={() => photoStore.undo()}
        >
          <Undo2 /> Undo
        </Button>
        <span className="hidden sm:inline">← delete · → keep · F favorite · U undo</span>
      </div>
    </div>
  );
}
