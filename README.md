# Angler's Jigsaw — v3.0

Angler's Jigsaw is a fishing-themed Progressive Web App (PWA) that lets players piece together fish species in a cleaner, more table-first jigsaw experience.

Version 3.0 is a **major gameplay and layout redesign** based on real player workflow and feedback about what actually makes puzzle games enjoyable.

## What changed in v3.0

### Major redesign
- Reworked the puzzle screen into a more focused, full-table play experience.
- Kept unnecessary UI out of the main play area.
- Added a small version label at the bottom of the play screen for easier testing and bug reporting.

### New gameplay direction
- All pieces now start in the **Tackle Tray** by default.
- **Edges to Table** scatters only edge pieces onto the table.
- **All to Table** scatters all tray pieces onto the table.
- Pressing **All to Table** again after the tray is empty recalls loose single pieces back into the tray.
- Players can drag pieces back into the tray manually.

### Traditional jigsaw piece style
- Rebuilt puzzle shapes around a more traditional **ribbon-cut jigsaw look**.
- Deeper tabs and blanks make the pieces read more like a real jigsaw puzzle.
- Board cut lines are always visible so the puzzle frame looks like a puzzle board instead of a plain box.

### Layout improvements
- The main board uses a **4:3 puzzle area** across all supported difficulty levels:
  - Easy — 12 pieces (4 × 3)
  - Angler — 48 pieces (8 × 6)
  - Guide — 108 pieces (12 × 9)
  - Captain — 192 pieces (16 × 12)
- The board scales responsively to give players a large working area.
- The tray remains at the bottom for a more familiar puzzle-game feel.

### Controls and quality-of-life
- Preview toggle for seeing the full picture behind the cut lines.
- Full-screen toggle for a larger playing area.
- Tray filter still supports sorting by edges, corners, and outward-tab counts.
- Snap-to-place behavior locks a piece when it reaches its correct position.
- New puzzle resets the previous board cleanly.

## Files changed in v3.0
- `index.html`
- `css/styles.css`
- `js/app.js`
- `manifest.json`
- `sw.js`
- `README.md`

## Notes
- This version is focused on a stronger board layout, better visual structure, and more traditional piece styling.
- Fish species data continues to come from `js/data.js`.
- Existing image assets and icons are still used:
  - `assets/images/logo.png`
  - `assets/icons/icon-192.png`
  - `assets/icons/icon-512.png`
  - fish artwork in `assets/fish/`

## Future direction
Recommended next improvements after v3.0:
- tighter piece-shape refinement if needed after testing
- optional piece clustering/group movement
- richer, more appealing fish artwork and puzzle image sets
- more player sorting tools and tray presets
- better completion rewards and puzzle browsing
