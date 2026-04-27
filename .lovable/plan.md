## Photo Sorter — Swipe to Keep, Delete, or Favorite

A fast, gesture-driven web app for triaging a batch of photos. Since iCloud Photos has no public web API, you'll bring photos in by drag-and-drop (export from iCloud Photos via Photos.app → Export, or just drop any folder of images).

### Core flow
1. **Drop zone (home screen)** — Big drag-and-drop area + "Choose photos" button. Accepts JPG, PNG, WEBP, GIF, HEIC*. Shows count once loaded; "Start sorting" button appears.
2. **Swipe deck** — One photo at a time, full-bleed card, counter (e.g. "12 / 240").
   - Swipe **left** → Mark for deletion
   - Swipe **right** → Keep
   - **Double-tap** → Toggle Favorite (heart pulse animation; favorited photos are also auto-kept)
   - Buttons below the card for the same actions (left ✕, heart, right ✓) for desktop/accessibility
   - **Undo** button to reverse the last action
   - Keyboard shortcuts: ← delete, → keep, F favorite, U undo
3. **Review screen** (auto when deck is empty, or via top-bar button anytime) — Three tabs:
   - **To Delete** — thumbnails grid, each with "Restore" to send back to the deck
   - **Kept** — thumbnails grid
   - **Favorites** — thumbnails grid (subset of Kept)
   - Click any thumbnail to view full-size in a lightbox
   - "Sort more photos" button to add another batch

### UX details
- Smooth drag physics with rotation tilt; color tint on the card edge (red left, green right) as you drag
- Snap-back if drag is below threshold
- All processing is fully in-browser — photos never leave your device, no upload/storage backend
- Session state persists in localStorage so a refresh doesn't lose your progress
- Mobile-first responsive layout; works great on phone for thumb-swiping

### Tech notes
- Built as a single-page TanStack Start app (`/` deck + drop zone, `/review` review screen)
- Photos held as in-memory object URLs from the File API
- *HEIC support: browsers don't render HEIC natively, so HEIC files will show a "convert to JPG first" notice (Photos.app can export as JPG)

### Out of scope (web platform limits)
- Cannot delete files from your iCloud / device — the "To Delete" list is a review list you act on manually in Photos.app
- No iCloud sync / no account / no cloud storage

### Future options (ask later if wanted)
- Export the "To Delete" list as a text file of filenames
- Connect Google Photos or Google Drive for a real cloud-backed library
- Bulk download Kept/Favorites as ZIPs
