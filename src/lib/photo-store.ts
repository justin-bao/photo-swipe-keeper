import { useSyncExternalStore } from "react";

export type PhotoStatus = "pending" | "kept" | "deleted";

export type Photo = {
  id: string;
  name: string;
  url: string;
  size: number;
  status: PhotoStatus;
  favorite: boolean;
};

type Action = { type: "swipe"; id: string; from: PhotoStatus; to: PhotoStatus; prevFavorite: boolean }
  | { type: "favorite"; id: string; prev: boolean };

type State = {
  photos: Photo[];
  history: Action[];
};

let state: State = { photos: [], history: [] };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function setState(next: State) {
  state = next;
  emit();
}

export const photoStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): State {
    return state;
  },
  addFiles(files: File[]) {
    const valid = files.filter((f) => f.type.startsWith("image/") && !/heic|heif/i.test(f.type));
    const newPhotos: Photo[] = valid.map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: f.name,
      url: URL.createObjectURL(f),
      size: f.size,
      status: "pending",
      favorite: false,
    }));
    setState({ ...state, photos: [...state.photos, ...newPhotos] });
    return { added: newPhotos.length, skipped: files.length - valid.length };
  },
  swipe(id: string, to: "kept" | "deleted") {
    const photo = state.photos.find((p) => p.id === id);
    if (!photo || photo.status !== "pending") return;
    const action: Action = {
      type: "swipe",
      id,
      from: photo.status,
      to,
      prevFavorite: photo.favorite,
    };
    setState({
      photos: state.photos.map((p) =>
        p.id === id ? { ...p, status: to, favorite: to === "deleted" ? false : p.favorite } : p,
      ),
      history: [...state.history, action],
    });
  },
  toggleFavorite(id: string) {
    const photo = state.photos.find((p) => p.id === id);
    if (!photo) return;
    const action: Action = { type: "favorite", id, prev: photo.favorite };
    setState({
      photos: state.photos.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p)),
      history: [...state.history, action],
    });
  },
  restore(id: string) {
    setState({
      ...state,
      photos: state.photos.map((p) => (p.id === id ? { ...p, status: "pending" } : p)),
    });
  },
  setFavoriteMany(ids: string[], favorite: boolean) {
    const idSet = new Set(ids);
    setState({
      ...state,
      photos: state.photos.map((p) => (idSet.has(p.id) ? { ...p, favorite } : p)),
    });
  },
  restoreMany(ids: string[]) {
    const idSet = new Set(ids);
    setState({
      ...state,
      photos: state.photos.map((p) => (idSet.has(p.id) ? { ...p, status: "pending" } : p)),
    });
  },
  undo() {
    const last = state.history[state.history.length - 1];
    if (!last) return;
    const history = state.history.slice(0, -1);
    if (last.type === "swipe") {
      setState({
        photos: state.photos.map((p) =>
          p.id === last.id ? { ...p, status: last.from, favorite: last.prevFavorite } : p,
        ),
        history,
      });
    } else {
      setState({
        photos: state.photos.map((p) => (p.id === last.id ? { ...p, favorite: last.prev } : p)),
        history,
      });
    }
  },
  reset() {
    state.photos.forEach((p) => URL.revokeObjectURL(p.url));
    setState({ photos: [], history: [] });
  },
};

export function usePhotoStore() {
  return useSyncExternalStore(
    photoStore.subscribe,
    photoStore.getSnapshot,
    photoStore.getSnapshot,
  );
}
