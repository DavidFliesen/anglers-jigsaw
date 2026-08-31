# Angler's Jigsaw v3.9.6

## iPad puzzle texture rendering repair

This release replaces the fragile inline-SVG `<image>` rendering used inside every puzzle piece. iPad/Safari was rendering the SVG shapes but not painting the external PNG inside them, leaving the board and tray visually blank.

Puzzle pieces now use the scenic puzzle PNG as a CSS background and use a Safari-compatible SVG mask only for the jigsaw silhouette. The existing deep circular piece geometry, drag engine, magnetic grouping, board snapping, and level progression are unchanged.

### Changed files
- `index.html`
- `css/styles.css`
- `js/app.js`
- `manifest.json`
- `sw.js`
- `README.md`
