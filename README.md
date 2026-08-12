# Angler's Jigsaw v2.1.0

Angler's Jigsaw is a fishing-themed jigsaw puzzle Progressive Web App built for GitHub Pages, modern browsers, and future iOS / Android packaging.

Version **2.1.0** focuses on one thing above all else: making the actual jigsaw pieces feel more like a real jigsaw puzzle and keeping the play experience closer to how real players work a tabletop puzzle.

## What changed in v2.1.0

### 1) Traditional ribbon-cut puzzle-piece geometry
This build replaces the earlier simplified puzzle silhouettes with a more traditional **ribbon-cut** look:

- flat outer borders on frame pieces;
- centered rounded tabs and blanks;
- straight row-and-column cut logic;
- mirrored neighboring edges so matching pieces line up cleanly;
- a more familiar physical-jigsaw appearance based on the reference examples supplied during testing.

The goal is for players to instantly recognize the shapes as real jigsaw-piece forms rather than generic or cartoon-like puzzle blobs.

### 2) Better 4:3 artwork fitting inside the puzzle
The piece-image rendering now uses a cover-style layout model for the board image. For the current prototype art, the image is treated as square source artwork and is fitted across the full 4:3 puzzle canvas so the board no longer feels like it was designed around filler side strips.

This is still prototype art, but the fitting logic is cleaner and more professional.

### 3) Hard reset when starting a new puzzle
Starting a new puzzle now fully clears the previous board state before creating the next one. This is meant to prevent leftover pieces from the earlier puzzle from remaining on screen or in memory when changing fish or difficulty.

### 4) Larger puzzle-frame emphasis
The board sizing was adjusted to give the puzzle itself a bit more presence on the table while preserving space for sorting and free play.

### 5) Pseudo full-screen support retained for iPad-style play
The app still supports the stable app-style full-screen mode used to avoid Safari drag issues, and the CSS now includes an explicit fixed-position full-screen shell state.

### 6) Home logo cleanup
The home-screen logo styling was simplified so the transparent-background logo can be shown more naturally without relying on the earlier workaround that visually produced a heavy black-edge feel.

## Core gameplay philosophy

The game should support how people really solve jigsaws, not force a rigid slot-filling workflow.

Players should be able to:

- use a large play surface;
- scatter edge pieces first;
- scatter all pieces to the board;
- make piles and sub-groups;
- connect matching pieces anywhere on the table;
- move connected clusters as one unit;
- drag a loose single piece back into the tray;
- recall only loose single pieces while keeping real progress on the board;
- use optional tray filters for sorting by outward-tab count and direction;
- hide the tray for more room;
- use full-screen mode to maximize the play area.

## Difficulty levels

All puzzles use a 4:3 board proportion:

- **12 pieces** — 4 × 3
- **48 pieces** — 8 × 6
- **108 pieces** — 12 × 9
- **192 pieces** — 16 × 12

## Piece states

Each piece can be in one of four states:

1. **Tray**
2. **Loose on Table**
3. **Connected Cluster**
4. **Locked to Puzzle**

Correct neighboring pieces can connect anywhere on the tabletop. Once a group reaches the correct board location, it snap-locks into place.

## Artwork status

The current fish images are still prototype assets and are not yet the final commercial-quality puzzle art.

The intended long-term visual direction is:

- attractive, appealing images that are worth solving;
- compositions built specifically for a 4:3 puzzle board;
- no filler side bars;
- stronger detail and texture;
- no species-name text printed into the final puzzle image itself.

## Version label

The active version number is displayed in small type at the bottom of the app:

`Angler's Jigsaw • v2.1.0`

This is intentional and should remain visible for testing and bug reporting.

## Files changed for v2.1.0

- `index.html`
- `css/styles.css`
- `js/app.js`
- `js/data.js`
- `sw.js`
- `README.md`

## Cache version

The service worker cache version for this build is:

`anglers-jigsaw-v2-1`

## Main testing focus for v2.1.0

1. Confirm the new puzzle-piece shapes look like traditional jigsaw pieces.
2. Confirm neighboring pieces line up correctly.
3. Start a new puzzle before finishing the last one and verify old pieces are cleared.
4. Drag loose single pieces from the board back into the tray.
5. Test iPad full-screen play for stability.
6. Check that the puzzle image fills the board more cleanly.
7. Confirm the version label reads `v2.1.0`.

## Project goal

Angler's Jigsaw should feel like a real puzzle table for anglers — simple, replayable, visually appealing, and satisfying to solve.
