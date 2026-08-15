# Angler's Jigsaw v3.5.7

Focused iPad drag stability and piece-rendering release.

## Fixes applied
- stops rebuilding every table piece SVG during ordinary syncs; SVG/raster content is rebuilt only when puzzle geometry changes
- marks pieces dirty only when `layoutPuzzle()` recalculates their shape/size
- prevents resize/orientation relayouts while a piece is being dragged
- debounces genuine viewport resize handling and ignores small Safari URL-bar height changes
- reduces non-initial puzzle relayouts from four passes to one
- caches the play-table `getBoundingClientRect()` at drag start instead of forcing layout on every pointer move
- queues any genuine orientation/viewport relayout until after the drag gesture ends
- removes the contradictory older `body.puzzle-mode` viewport rules so the final stable puzzle layout is the single active rule
- updates service-worker/cache-busting version to v3.5.7

## Changed files
- index.html
- css/styles.css
- js/app.js
- sw.js
- README.md
