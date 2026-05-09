# PRD — Swipe Deck

## Feature summary
The core triage surface: one photo at a time, full-bleed, decided with a single gesture.

## Problem
Native photo apps require multi-tap selection flows to bulk-delete. There's no "one decision per photo" UI that makes culling feel fast and definitive.

## Goals
- A user can decide on a photo in under 1 second.
- Gestures feel physical (drag with rotation, edge color tint, snap-back below threshold).
- Every decision is reversible (undo).
- Works equally well on phone (thumb swipe) and desktop (keyboard).

## User stories
- As a user, I swipe left to mark a photo for deletion.
- As a user, I swipe right to keep a photo.
- As a user, I double-tap to favorite a photo without leaving the deck.
- As a user, I press Undo when I swipe the wrong way.
- As a user on desktop, I use arrow keys instead of the mouse.

## Interactions
| Input | Action |
|---|---|
| Swipe left / `←` / ✕ button | Mark for deletion |
| Swipe right / `→` / ✓ button | Keep |
| Double-tap / `F` / heart button | Toggle favorite (with pulse animation) |
| `U` / Undo button | Reverse last decision |

## Visual feedback
- Card rotates with drag (`drag.x / 18` degrees).
- Red gradient tint on left edge when dragging left; green on right.
- "DELETE" / "KEEP" stamp labels appear past 20px drag.
- Next-card peek behind the active card (95% scale, 60% opacity).
- Heart pulse animation on favorite.
- Filename shown in a footer gradient.

## Thresholds
- Swipe commits when `|dx| > 110px`. Otherwise snap back.
- Double-tap window: 280ms.
- Tap detected when total movement < 8px and duration < 300ms.

## Edge cases
- Pointer cancel mid-drag → snap back, no commit.
- Photo with `favorite: true` shows a persistent heart badge.
- Empty deck → caller renders the review screen instead.

## Out of scope
- Multi-photo gestures (e.g. swipe through stacks).
- Inline zoom / pan on the active card.
- Per-photo metadata editing.

## Success metrics (qualitative)
- Time-per-photo feels sub-second on a real device.
- Users report Undo is "always there when I need it."
