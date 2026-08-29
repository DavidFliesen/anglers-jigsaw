# Angler's Jigsaw v3.9.0

Clean rebuild from the GitHub site archive supplied on August 28, 2026.

## What this rebuild does

- Restores the real Angler's Jigsaw home artwork from `assets/images/logo.png`.
- Keeps the v3.5.7 iPad drag-stability protections.
- Uses traditional deep circular jigsaw tabs/blanks for both the pieces and the board cutlines.
- Keeps drag-to-table, drag-back-to-tray, Edges to Table, All to Table, Preview, and snap-lock behavior.
- Uses `Fish Caught` everywhere in the visible interface.
- Keeps the existing local-storage key so previously completed fish are not lost.
- Normalizes the first 15 species to one permanent naming convention.
- Provides exactly 15 transparent swimming assets and 15 full 4:3 puzzle images.
- Ambient fish remain behind the interface, use randomized depth/size/timing, and are horizontally flipped only when their travel direction is opposite the source artwork.
- Removes old legacy fish/puzzle filenames and the redundant nested ambient folder.
- Moves the retained coral-reef and sunken-pirate-ship artwork to `assets/themes/` so it follows the one-folder-under-`assets` structure.
- Bumps the PWA/service-worker cache to v3.9.0.

## Canonical image convention

Swimming/background fish:

`assets/fish/##_species_name_large.png`

Puzzle images:

`assets/puzzles/##_species_name_puzzle.png`

The current package contains species 01 through 15 with no gaps.

## Reconstructed artwork

The GitHub ZIP was missing the canonical images for Smallmouth Bass, Spotted Bass, Striped Bass, White Bass, the Black Crappie swimming asset, and White Crappie. Those files were reconstructed for this recovery build from artwork already available in the project/workspace. They are functional replacement artwork rather than claims to be byte-for-byte copies of the earlier lost renders.

## Validation performed

- JavaScript syntax checked for `js/app.js` and `js/data.js`.
- All 15 `swimImage` paths exist.
- All 15 `puzzleImage` paths exist.
- All swimming images are RGBA PNGs with transparency.
- All puzzle images are 1448 x 1086 (4:3).
- All DOM IDs referenced by `app.js` exist in `index.html`.
- Visible `Fish Cooler` / `Cooler` labels are removed.
- All displayed code/cache version references are v3.9.0.

See `CODE-REVIEW.txt` for the recovery notes.
