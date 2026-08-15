# Angler's Jigsaw v3.5.4 — Viewport Stabilization

This release removes the programmatic fullscreen system to isolate and reduce iPad/Safari screen jumping during puzzle play.

## Changes
- removed the Full Screen / Exit Full Screen control
- removed all calls to the browser Fullscreen API
- header is now **Home | Angler's Jigsaw | Cooler**
- removed forced `100dvh` body sizing and fixed viewport behavior
- removed repeated `window.scrollTo(0,0)` corrections during dragging
- removed the `visualViewport` resize relayout hook that could fire while Safari browser chrome changed
- limited touch suppression to the puzzle table and draggable pieces instead of the entire page
- changed tray-to-board dragging so the original iPad pointer-down element remains alive until the drag ends
- added stable pointer capture and release handling for tray pieces
- keeps the puzzle board/tray mechanics and artwork unchanged

## Changed files
- index.html
- css/styles.css
- js/app.js
- sw.js
- README.md
