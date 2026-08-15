# Angler's Jigsaw v3.5.6

Critical board-layout recovery release.

## What was wrong
The v3.5.4/v3.5.5 viewport stabilization work removed the fixed/fullscreen behavior but left conflicting older CSS rules in place. The puzzle screen's flex container could collapse the play-table height to almost zero. Because `layoutPuzzle()` intentionally refused to render into a tiny table, the app opened with `0/0 locked`, an empty tray, and no visible board.

## What changed
- replaced the puzzle page's conflicting flex/viewport rules with one final stable CSS grid
- reserves explicit rows for toolbar, board, and tray
- uses `100svh` on iPad/Safari for a stable small viewport without the Fullscreen API
- added a JavaScript fail-safe that gives the board a usable height if Safari temporarily reports a collapsed table
- updates puzzle title/count immediately before layout so a failed measurement can no longer masquerade as a 0-piece puzzle
- retained the no-fullscreen approach and current drag mechanics
- updated cache/version to v3.5.6

## Changed files
- index.html
- css/styles.css
- js/app.js
- sw.js
- README.md
