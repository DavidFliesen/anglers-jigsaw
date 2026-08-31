# Angler's Jigsaw v3.9.8

Runtime recovery release after a complete review of v3.9.7.

## Root cause fixed
The previous code called four geometry helpers that had been accidentally deleted during an earlier deduplication pass:
- `ribbonProfile()`
- `buildPieceShape()`
- `edgeSegment()`
- `sharedCutPath()`

Because those names are valid JavaScript references, syntax checks passed. The app then failed only when `layoutPuzzle()` ran. That produced the exact symptom seen on iPad: the outer board rectangle appeared, but no shaped board cutlines, tray thumbnails, or puzzle pieces were rendered.

## v3.9.8 changes
- restores the complete original deep circular tab/blank geometry helper set exactly once
- keeps the v3.9.1 SVG puzzle-piece renderer rather than introducing another rendering method
- keeps magnetic piece-to-piece grouping and board snapping
- keeps numerical fish progression
- keeps single-row puzzle controls
- piece-count cards start the level directly and ignore double-clicks while startup is in progress
- retains the stronger known-good Trace and board-outline visibility for this recovery release
- bumps the PWA cache to v3.9.8

## Validation performed
- JavaScript syntax check
- duplicate function-definition audit
- DOM ID/reference audit
- all 15 swimming-image and 15 puzzle-image path audit
- Chromium runtime test
- browser runtime test in Chromium, plus direct review of the standards-based SVG geometry used by Safari/Chrome
- 12-piece and 48-piece startup tests
- tray thumbnails / table piece / board cutline visibility checks
- PUSH/PULL and ALL/EDGES control checks
- Trace toggle check
- ZIP integrity check
