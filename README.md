# Angler's Jigsaw v3.9.9

Structural interaction-stability release based on the working v3.9.8 puzzle renderer.

## Changes
- maximizes the 4:3 puzzle board inside the available play-table area with only a very small safety inset
- keeps the v3.9.8 SVG puzzle renderer, geometry, magnetic grouping, and board snapping unchanged
- isolates toolbar, play table, board, pieces, tray, drag preview, and ambient background into explicit stacking layers
- routes every in-game toolbar button through one delegated handler using `data-puzzle-action`, preventing stale/overlapping button bindings
- adds drag cleanup on blur, visibility changes, pointer cancel, and normal release
- changes tray dragging so a tray piece stays in the tray while the finger is below the board and follows the finger as a drag preview
- converts the tray piece to a real board piece only when the pointer actually crosses into the play table, eliminating the initial jump/clamp to the bottom edge
- preserves ALL/EDGES, PUSH/PULL, Trace, magnetic piece groups, Return to Game, numerical fish progression, and iPad viewport protections
- bumps the service-worker and asset cache version to v3.9.9

## Changed files
- `index.html`
- `css/styles.css`
- `js/app.js`
- `sw.js`
- `README.md`
- `CODE-REVIEW-v3.9.9.txt`

## Validation
- JavaScript syntax check
- duplicate core-function audit
- DOM ID/reference audit
- browser runtime startup at 12, 48, 108, and 192 pieces
- toolbar ALL/EDGES and PUSH/PULL click tests
- Trace toggle test
- tray-to-table continuous drag test
- board-size utilization check
- ZIP integrity check
