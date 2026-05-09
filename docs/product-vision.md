# PhotoSwipe — Product Vision

## One-line thesis
A fast, gesture-driven triage tool that turns the dread of cleaning out a photo library into a satisfying, swipeable game — entirely on-device, no uploads, no accounts.

## Who it's for
- **Phone-camera packrats** — people whose Camera Roll has thousands of near-duplicates, screenshots, and accidental shots they'll never sort through in the native Photos app.
- **iCloud / Google Photos exporters** — users who periodically dump a folder of photos and want to cull before re-importing or archiving.
- **Privacy-conscious users** — anyone unwilling to upload personal photos to a cloud service just to organize them.
- **Mobile-first thumb-swipers** — the muscle memory of Tinder/Hinge applied to a chore that's normally tedious on desktop.

## The problem
Native photo apps optimize for *viewing*, not *culling*. Deleting hundreds of photos requires:
- Tap-to-select each one (slow, easy to misclick)
- No fast "keep vs trash" decision UI
- No favorite-while-deciding flow
- Cloud-tied workflows that feel risky for bulk ops

Most people give up and let the library bloat forever.

## The solution
A single-purpose web app with three primitives:
1. **One photo, one decision** — full-bleed card, swipe left to mark for delete, swipe right to keep.
2. **Double-tap to favorite** — the lightweight "this one's special" signal you make mid-triage without breaking flow.
3. **Reviewable lists** — nothing is destructive. The "To Delete" list is a plan you act on later (export filenames, delete in Photos.app), not a live deletion.

Everything runs in-browser via the File API. Photos never leave the device.

## Design principles
- **Gesture-first, keyboard-equal** — swipe on mobile, arrow keys on desktop. Both feel native.
- **Reversible** — undo last action, restore from review lists. The user should never fear a misclick.
- **No backend, no account** — zero friction to start, zero data risk.
- **Honest about platform limits** — the browser can't reach into iCloud; we say so and give a clean manual handoff (filename export).

## Out of scope (for now)
- Direct iCloud / Google Photos API integration
- Server-side storage or sync across devices
- AI-powered duplicate detection or auto-categorization
- Native mobile apps

## Success looks like
A user drops in 500 photos, clears the deck in under 10 minutes, exports the delete list, and finishes the cleanup in Photos.app — feeling like they actually *enjoyed* it.
