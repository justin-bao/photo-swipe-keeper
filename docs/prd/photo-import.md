# PRD — Photo Import (Drop Zone)

## Feature summary
The entry point: a drag-and-drop zone (and file picker) that loads local photos into the app as in-memory object URLs.

## Problem
Browsers can't reach into iCloud Photos or the OS photo library directly. Users need a frictionless way to pull a batch of photos into the app without uploading anything to a server.

## Goals
- Zero-config: drop or click, photos appear.
- 100% client-side. Files never leave the device.
- Clear feedback on what was added vs skipped.
- Support the "I want to add more later" flow without losing existing progress.

## User stories
- As a user, I drag a folder of photos onto the page and they load instantly.
- As a user, I click a button to open the OS file picker as an alternative.
- As a user mid-session, I add another batch on top of my existing deck.
- As a user, I'm told when files are skipped (e.g. HEIC, non-images).

## Behavior
- Accepts `image/*` (JPG, PNG, WEBP, GIF). HEIC is skipped with a toast explaining the conversion path.
- Each accepted file becomes a `Photo` with a `URL.createObjectURL(file)` URL and `status: "pending"`.
- Drag-over visual state (border color + bg tint) confirms a valid drop target.
- Compact variant (button only) for use inside the deck/review header to add more photos mid-session.

## Feedback
- Success toast: `Added N photos`.
- Warning toast when files are skipped, with the reason.

## Edge cases
- Empty file list → no-op.
- Mixed valid + invalid files → add the valid ones, warn for the rest.
- Re-adding the same file → currently treated as a new entry (acceptable; rare in practice).

## Memory & lifecycle
- Object URLs are revoked when the photo is removed from the store, to avoid memory leaks on long sessions.

## Out of scope
- Server upload / cloud import.
- HEIC decoding in-browser.
- Folder structure preservation (filenames only).
- EXIF-based sorting on import.

## Success metrics (qualitative)
- A user with 500 photos can load and start swiping in under 5 seconds.
- No confusion about where their photos "went" (i.e. they understand nothing was uploaded).
