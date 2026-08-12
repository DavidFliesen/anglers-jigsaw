# Angler's Jigsaw — v3.2.3

Version 3.2.3 refines the ambient background fish so they feel more present and natural without becoming distracting during puzzle play.

## v3.2.3 changes

### Ambient fish tuning
- Fish are now **less transparent** so they read more clearly in the background.
- The **current fish size is now the smallest size**, and some fish can appear larger.
- Larger fish are assigned a **higher visual layer** so they appear in front of smaller fish if their paths cross.

### More natural population
- The background can now show **a few more fish than before**.
- The number of fish on screen now **fluctuates** instead of staying capped at a fixed constant count.
- Population varies gently within a restrained range so the scene stays lively without becoming crowded.

### Persistent background across screens
- The ambient fish layer remains a **continuous background element** while moving between screens in the PWA.
- Fish should **not restart just because you switch screens** inside the app.
- The controller is now initialized as a persistent singleton so it keeps running across in-app screen changes.

### Version / cache updates
- App version updated to `v3.2.3`.
- Service worker cache updated for the new build.

## Changed files
- `index.html`
- `js/app.js`
- `sw.js`
- `README.md`
