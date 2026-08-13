# Angler's Jigsaw v3.4.2

This patch fixes the broken fish-selection screen introduced in v3.4.1.

## Root cause
`js/data.js` contained JavaScript strings with unescaped apostrophes (for example, `world's` and `ocean's`) inside single-quoted strings. That caused the entire data file to fail parsing, so `speciesData` never loaded and the fish preview cards could not be rendered.

## Fixed
- Restored the fish selection preview cards.
- Each puzzle fish now appears as a clickable image card under **Choose a Fish**.
- Kept all eight current puzzle species:
  - Channel Catfish
  - Rainbow Trout
  - Flounder
  - Largemouth Bass
  - Redfish
  - Mudfish
  - Angler Fish
  - Swordfish
- Kept the new full-background puzzle images from v3.4.1.
- Bumped the service-worker cache to v3.4.2 so the repaired JavaScript is refreshed.

## Changed files
- `index.html`
- `js/app.js`
- `js/data.js`
- `sw.js`
- `README.md`
