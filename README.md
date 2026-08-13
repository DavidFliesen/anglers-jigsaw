# Angler's Jigsaw — v3.3.1

Version 3.3.1 focuses on credible fish movement, smoother iPad puzzle-piece dragging, randomized tray ordering, and making the underwater themes visibly different instead of only changing the blue gradient.

## v3.3.1 changes

### Fish always swim nose-first
- Rainbow Trout and Flounder assets naturally face right.
- Catfish naturally faces left.
- Each fish can still travel in either direction, but the code now flips the artwork only when needed so the fish's nose always points in the direction of travel.
- The subtle breathing animation works with both normal and flipped fish.

### iPad drag stability
- Puzzle mode now locks document scrolling and Safari rubber-band/overscroll behavior while playing.
- Active piece drags explicitly prevent `touchmove` from scrolling the page.
- Pointer capture is requested during a drag when the browser supports it.
- The bottom tray keeps horizontal touch scrolling, while the main play surface stays fixed.

### Random tray order
- Puzzle pieces receive a random tray order when a new puzzle is created.
- The bottom tray no longer reveals the original puzzle's left-to-right / top-to-bottom sequence.
- Pieces returned to the tray receive a fresh random position.

### Visible underwater themes
The previous build mainly changed color gradients. v3.3.1 adds an actual lightweight scene layer for each theme:
- **Open Ocean** — water-light rays and a distant seabed silhouette
- **Deep Abyss** — a drifting anglerfish silhouette with a gently pulsing lure
- **Coral Reef** — low-contrast coral and reef shapes along the seabed
- **Shipwreck** — a broken ship silhouette and a subtle treasure chest glint
- **Kelp Lagoon** — tall kelp fronds rising through the water

These are procedural SVG/CSS scene elements, so they stay lightweight, work offline, and do not require large background image files. They can later be replaced with richer artwork without changing the theme system.

## Included ambient fish assets
- `assets/images/ambient/rainbow-trout.png`
- `assets/images/ambient/catfish.png`
- `assets/images/ambient/flounder.png`

## Changed files
- `index.html`
- `js/app.js`
- `sw.js`
- `README.md`
- `assets/images/ambient/rainbow-trout.png`
- `assets/images/ambient/catfish.png`
- `assets/images/ambient/flounder.png`
