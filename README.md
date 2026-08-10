# Angler's Jigsaw v0.3

A starter Progressive Web App for GitHub Pages.

## Included in this starter build
- Home screen and brand styling
- Body-of-water selection
- Simple fishing interaction with hotspots and reel-in phase
- Puzzle transformation flow after a catch
- 3x3 fish puzzle board
- Cross-platform drag-and-drop using Pointer Events (mouse, touch, pen)
- Tap-to-select fallback retained for accessibility and precision
- **Edges Only** tray filter
- Fish Cooler collection stored in localStorage
- Species descriptions and history cards
- PWA manifest and service worker for install/offline basics

## Current waters
- Farm Pond
- Mountain Stream
- Coastal Marsh

## Current species
- Largemouth Bass
- Bluegill
- Channel Catfish
- Rainbow Trout
- Brook Trout
- Red Drum

## Suggested next steps
1. Upgrade from square tile puzzle pieces to real interlocking jigsaw shapes.
2. Add more waters and species.
3. Add puzzle difficulty levels (piece counts).
4. Improve fishing scenes and animations.
5. Add sound effects and achievements.
6. Add a body-of-water progress tracker.

## GitHub Pages notes
This folder can be pushed directly to a GitHub Pages repo root or to a project subfolder.


## v0.2 drag support
Puzzle pieces can now be dragged directly from the Tackle Tray to the board.

The implementation uses the browser Pointer Events API rather than old desktop-only HTML5 drag-and-drop. This gives one interaction model for iOS/iPadOS, Android, Windows, macOS, and Linux, including mouse, touch, stylus, and trackpad input.


## v0.3 — true jigsaw pieces
- Replaced square puzzle tiles with interlocking SVG jigsaw-piece shapes.
- Every adjoining edge is generated as an exact tab/blank opposite so pieces visually fit.
- Pieces drag with Pointer Events: mouse, touch, pen, stylus, and trackpad.
- Drop near the correct location and the piece snaps into place.
- Edges Only still works and automatically reveals all pieces after the border is completed.
- Tap-to-place remains available as a fallback.
- Board resizes responsively for iOS, Android, Windows, macOS, and Linux browsers.

### Important
This is still the starter 3x3 difficulty so the interaction can be tested cleanly.
The engine is structured to support larger piece counts next.


## v0.4 — puzzle silhouette and iPad interaction fix
- Removed the fishing/reel mini-game. Choosing a body of water now immediately selects a fish from that habitat and starts the puzzle.
- Rebuilt the puzzle-piece renderer to use SVG image patterns inside traditional jigsaw silhouettes instead of clipped rectangular images.
- Tabs and blanks now render transparently outside the actual piece shape.
- Matching shared edges are exact opposites, so neighboring pieces visually interlock.
- Added iOS/iPadOS touch handling to prevent repeated taps and puzzle dragging from triggering browser zoom.
- Kept Edges Only, All Pieces, Spread Pieces, snapping, and the Fish Cooler.
