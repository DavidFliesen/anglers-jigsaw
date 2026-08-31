# Angler's Jigsaw v3.9.2

Focused board-space and gameplay-toolbar release.

## Changes
- hides the normal app header during active puzzle play
- consolidates Home, level/piece status, ALL/EDGES, PULL/PUSH, Trace, locked count, and Fish Caught into one gameplay row
- ALL/EDGES is a two-option segmented control with the active choice highlighted
- PULL/PUSH is a two-option segmented control; selecting PUSH sends the currently filtered tray pieces to the board, while PULL returns loose unconnected pieces
- expands the play table to use nearly all available vertical space
- removes most empty water above and below the 4:3 puzzle board
- reduces puzzle-outline visibility by roughly half
- adds Return to Game on Home and Fish Caught whenever an unfinished puzzle exists
- entering Home or Fish Caught no longer destroys an unfinished puzzle
- preserves magnetic connected-piece groups and the v3.5.7 iPad drag-stability protections

## Changed files
- index.html
- css/styles.css
- js/app.js
- manifest.json
- sw.js
- README.md
