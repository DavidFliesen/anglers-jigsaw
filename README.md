# Angler's Jigsaw v3.10.2

## Focus
Tray-to-table drag regression repair built directly on v3.10.1.

## Root cause
The v3.10.1 fullscreen startup retry installed a capture-phase document `pointerdown` listener. On iPad/Safari, a fullscreen/viewport transition beginning on the same pointer used to drag a tray piece can cancel or invalidate that drag. The tray drag also cached the play-table rectangle at pointerdown, so any fullscreen/immersive layout change could leave the table hit-test stale.

## Fixes
- Removed the global first-pointer fullscreen retry.
- Fullscreen Lock still defaults ON and `UIKIT.applyFSLock()` still runs at startup and from `startPuzzle()`; the piece-count tap is the safe user gesture for true fullscreen.
- Tray thumbnails no longer use pointer capture. Window-level pointer listeners own the cross-layer drag.
- The play-table rectangle is refreshed continuously until the tray piece actually enters the table.
- The table rectangle is refreshed again at the exact tray-to-table handoff.
- Tray thumbnails explicitly use `touch-action:none` while empty tray space retains horizontal scrolling.
- Fixed 58px tray thumbnails and 116px tray height remain unchanged.

## Unchanged
Puzzle geometry, magnetic snapping, board sizing, audio/UI modules, fish artwork, progression, Push/Pull, Trace, and tray sizing.

## Changed files
- `index.html`
- `css/styles.css`
- `js/app.js`
- `sw.js`
- `README.md`
- `CODE-REVIEW-v3.10.2.txt`
