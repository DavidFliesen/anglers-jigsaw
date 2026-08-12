# Angler's Jigsaw — v3.3.0

Version 3.3.0 adds a more nautical presentation, auto-fullscreen puzzle start behavior, randomized piece scattering, richer ambient water life, and themed underwater backgrounds that change when a new puzzle begins.

## v3.3.0 changes

### Auto-fullscreen when a puzzle starts
- Starting a puzzle now attempts to enter fullscreen immediately from the player's tap/click.
- The fullscreen button now works as a true toggle and updates its label to **Full Screen** or **Exit Full Screen**.
- Extra layout passes still run after the screen change so the board has a better chance of fitting properly on iPad/Safari.

### Randomized piece scattering
- **Edges to Table** no longer places edge pieces near the side where they belong.
- Edge pieces are now scattered more randomly around the outside of the puzzle area so the player has to sort and solve them.
- **All to Table** now spreads pieces in a more random way instead of clustering them in near-solution positions.
- The result is meant to feel more like a traditional jigsaw session where the player does the organizing work.

### More bubbles, more fish, more life
- Increased the number of animated bubbles in the background.
- Ambient fish now use a broader size range, show up in greater overall numbers, and continue entering one at a time.
- Fish continue to vary by size, direction, depth, and timing.
- Added image-error handling for ambient fish so a missing asset does not leave a broken image on screen.

### Nautical GUI polish
- Refined the header, toolbar, tray, and panel styling to lean more nautical with deeper sea tones and warmer brass/gold accents.
- Added randomized underwater background themes for new puzzles.

### Random underwater backdrop themes
Each new puzzle now picks one of several themed looks:
- Open Ocean
- Deep Abyss
- Coral Reef
- Shipwreck
- Kelp Lagoon

## Included asset files
To avoid broken ambient-fish images, this changed-files package also includes:
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
