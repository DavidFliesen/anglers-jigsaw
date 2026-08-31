# Angler's Jigsaw v3.10.4

## Purpose
v3.10.4 makes the puzzle playable on iPad without depending on bottom-edge drag gestures that can be intercepted by iPadOS/Siri/app switching.

## Changes
- Tap is now the primary tray workflow: tapping a tray piece stages it beside the puzzle in a left/right staging lane, never in the bottom-center system gesture area.
- Staged pieces alternate left/right and try to avoid overlapping other loose pieces.
- Drag remains optional. Pointer capture is armed only after a tray gesture has clearly become a drag, improving fast tray-to-table dragging without interfering with taps.
- Added stale-drag recovery on focus/pageshow/new pointerdown so an iPadOS/Siri interruption cannot leave the puzzle controls stuck.
- Added `viewport-fit=cover` and a minimum 30px iPad system-gesture safety strip below the Tackle Tray.
- The 58px tray thumbnails and 116px tray layout remain unchanged.
- Puzzle rendering, magnetic snapping, board geometry, progression, audio, and ARTEZIQ UI kit code are unchanged.

## Recommended iPad workflow
1. Tap a tray piece. It appears beside the puzzle.
2. Drag it the short distance from the side staging lane to where you want it, or keep tapping additional pieces out first.
3. Tap any loose unconnected table piece to send it back to the Tackle Tray.

## Files changed
- `index.html`
- `css/styles.css`
- `js/app.js`
- `sw.js`
- `README.md`
