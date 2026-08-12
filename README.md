# Angler's Jigsaw — v3.2.4

Version 3.2.4 fixes the initial puzzle-board positioning on iPad/Safari and refines the ambient fish entry timing.

## v3.2.4 changes

### Puzzle board now opens fully visible
- Entering the puzzle screen now resets the page scroll position to the top.
- This prevents Safari from carrying over the scroll position from the puzzle-selection screen and hiding the puzzle toolbar/top of the board.
- Puzzle layout is re-measured several times during the first fraction of a second so the iPad visual viewport and flex layout can settle before the final board size is used.
- Temporary tiny layout measurements are ignored instead of creating a board larger than the visible play area.
- Added resize/orientation/visual-viewport layout checks for more reliable iPad behavior.

### Ambient fish enter one at a time
- The first background fish enters almost immediately after the PWA loads.
- Additional fish now enter **one at a time** with a few seconds between arrivals.
- The fish population can still fluctuate naturally, but the app no longer releases an initial cluster of three fish at once.
- The persistent ambient-fish layer continues running as the player changes screens inside the PWA.

## Changed files
- `index.html`
- `js/app.js`
- `sw.js`
- `README.md`
