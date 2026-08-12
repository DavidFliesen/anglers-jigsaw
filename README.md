# Angler's Jigsaw — v3.2.1

Version 3.2 refines the traditional jigsaw geometry and improves the Fish Cooler discovery system.

## v3.2.1 changes

### Cleaner piece appearance
- Removed the white perimeter stroke from loose puzzle pieces on the table.
- Removed the white perimeter stroke from pieces shown in the Tackle Tray.
- Kept the puzzle-board cut-line guide so the target layout remains visible while solving.
- The actual clipped image now defines each piece edge, producing a cleaner, less artificial look.

### Exact matching tabs and blanks
- Every outward tab and inward blank now uses **one shared canonical connector profile**.
- Tabs and blanks use the same circle size, neck width, depth, and curve math.
- The smaller connector size requested during testing is now used for both male and female connections.
- The puzzle board cut lines use that same connector profile, so the loose piece and its destination are generated from the same geometry.

### Fish Cooler now shows discoveries only
- The Fish Cooler no longer shows undiscovered species.
- If no fish have been discovered yet, the Cooler shows an empty-state message.
- Completed fish become visible in the Cooler after their puzzle is finished.
- The discovered count continues to reflect the number of fish actually caught/completed.

### Fish Cooler species cards are clickable
- Tap a discovered fish to open its species-information screen.
- The species screen now includes:
  - common name
  - scientific name
  - description
  - **How to Identify It**
  - typical habitat
  - species history
- From that screen, the player can play that fish again or return to the Fish Cooler.

### Version / cache
- App version: `v3.2.1`
- Service-worker cache: `anglers-jigsaw-v3-2-1`

## Changed files
- `index.html`
- `css/styles.css`
- `js/app.js`
- `js/data.js`
- `sw.js`
- `README.md`
