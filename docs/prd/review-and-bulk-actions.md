# PRD — Review Lists & Bulk Actions

## Feature summary
A tabbed gallery showing the outcome of triage — To Delete, Kept, Favorites — with multi-select bulk actions and an export-to-text-file escape hatch for the delete list.

## Problem
Swipe decisions need to be reviewable and partially reversible. And since the browser can't actually delete from the user's photo library, we need a clean handoff so the user can finish the job in Photos.app without retyping filenames.

## Goals
- Every swiped photo lands in a list the user can review and act on in bulk.
- Restoring a photo to the deck is one click.
- Bulk-favoriting (and unfavoriting) the survivors takes seconds, not hundreds of clicks.
- The "To Delete" list can be exported as a plain `.txt` of filenames the user pastes into Photos.app search.

## User stories
- As a user, after swiping I see three tabs: To Delete, Kept, Favorites.
- As a user, I click any thumbnail to view it full-size in a lightbox.
- As a user, I select multiple photos and apply an action to all of them.
- As a user, I export my "To Delete" list as a text file to use in Photos.app.
- As a user, I send a photo back to the pending deck if I changed my mind.

## Tabs and per-tab actions
| Tab | Bulk actions |
|---|---|
| To Delete | Restore selected · **Export list (.txt)** |
| Kept | Favorite selected · Restore selected |
| Favorites | Unfavorite selected |

## Selection model
- Local `Set<string>` of selected photo IDs, scoped to the current tab.
- "Select all" toggle in the action bar.
- Per-thumbnail checkbox overlay.
- Selection clears when switching tabs or after a bulk action commits.

## Export format
A plain `.txt` file `photoswipe-delete-list.txt` containing:
```
# PhotoSwipe — files marked for deletion (N)
IMG_0001.jpg
IMG_0002.jpg
...
```
The user pastes filenames into Photos.app search to locate and ⌘-delete them in batches.

## Lightbox
- Click thumbnail → full-size overlay.
- Esc / click backdrop → close.
- No edit controls in the lightbox; it's read-only.

## Edge cases
- Empty tab → friendly empty state, no action bar.
- Restoring a photo from any tab puts it back at `status: "pending"` and clears it from the current list.
- Favoriting a photo in the Kept tab keeps it in Kept and adds it to Favorites (Favorites is a subset of Kept).

## Out of scope
- Direct deletion from the OS photo library (impossible in-browser).
- ZIP download of Kept / Favorites (future).
- Per-photo tagging beyond the favorite flag.
- Sharing or exporting to cloud services.

## Success metrics (qualitative)
- A user can finish a 500-photo session and clean up in Photos.app without retyping a single filename.
- Bulk-favoriting a Kept set feels obviously faster than doing it one-by-one in the deck.
