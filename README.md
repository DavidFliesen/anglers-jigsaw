# Angler's Jigsaw v3.9.3

Focused progression-order repair.

## Fixed
- Fish levels now always advance in strict numerical species order: 1, 2, 3 ... 15.
- Startup no longer trusts a stale `nextLevel` value from earlier builds.
- If an earlier broken build recorded a later fish as caught before a missing earlier level, that out-of-order catch is removed automatically.
- The next playable level is always the first missing species number.
- Fish Caught count/list therefore stays consistent with the sequential game progression.

## Unchanged
- v3.9.2 one-row gameplay GUI
- magnetic connected-piece snapping
- iPad drag stability protections
- puzzle artwork and all fish assets
- ALL/EDGES, PUSH/PULL, Trace controls

## Changed files
- index.html
- js/app.js
- sw.js
- README.md
