# Angler's Jigsaw v3.9.4

Focused control/reliability recovery after full v3.9.3 code review.

## Fixes
- removed duplicate function definitions accidentally accumulated in `js/app.js`
- rebuilt button binding through one defensive event path
- repaired PUSH and PULL actions and added visible action-result messages
- PULL returns every table piece that is not locked and is not connected to another piece
- PUSH resets pushed pieces to independent groups before scattering them
- reduced Trace/reference-image opacity from 34% to 17%
- moved Return to Game to the top-right Fish Caught heading area when a puzzle is active
- retained numerical level order, magnetic snapping, iPad drag stability, and the 15-species asset library

## Changed files
- index.html
- css/styles.css
- js/app.js
- manifest.json
- sw.js
- README.md
- CODE-REVIEW-v3.9.4.txt
