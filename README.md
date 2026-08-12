# Angler's Jigsaw — v3.1

Version 3.1 fixes the v3.0 board-positioning problem and replaces the puzzle template geometry with a deeper, rounder traditional ribbon-cut system based on the supplied 12-piece mockup.

## You do not need to supply every piece combination
The game now builds every piece from three reusable side profiles:
- flat edge
- deep outward circular tab
- deep inward circular blank/socket

Those profiles are rotated and combined automatically for every top, right, bottom, and left side. That produces all corner, edge, and interior combinations needed for 12, 48, 108, and 192 piece puzzles.

## v3.1 changes
- fixed the board being shifted partly outside the play area
- full 4:3 puzzle board now uses the JavaScript-calculated position directly
- deeper tabs and blanks with narrow necks and wider circular heads
- special balanced 4×3 cut arrangement for the 12-piece level based on the supplied reference
- board cut lines are now drawn once per shared boundary instead of double-drawing every neighboring piece outline
- cache bumped to `anglers-jigsaw-v3-1`

## Changed files
- `index.html`
- `css/styles.css`
- `js/app.js`
- `sw.js`
- `README.md`
