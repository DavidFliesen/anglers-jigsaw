# Angler's Jigsaw v3.5.5

Full code-review repair release.

## Critical fixes
- Restored `confirmLeavePuzzle()`, `checkCompletion()`, `pickPuzzleTheme()`, `applyPuzzleTheme()`, and `renderSeaThemeScene()` that were accidentally dropped from v3.5.4.
- Fixed the fish-selection launch failure. Clicking a fish now starts the puzzle immediately instead of waiting for an image-load event.
- All current puzzle artwork uses the standard 4:3 board ratio, so puzzle startup now uses that known ratio directly.
- Fish-selection cards explicitly use `type="button"`.
- Restored completion detection and Fish Cooler saving after the missing-function regression.
- Restored theme selection using the approved anglerfish, coral reef, and sunken pirate ship assets.

## Branding consistency
Every visible use of the game name now uses the same condensed, heavy Angler's Jigsaw title styling used on the opening screen, scaled appropriately for the header and footer.

## Changed files
- index.html
- css/styles.css
- js/app.js
- sw.js
- README.md
