# Angler's Jigsaw v3.10.1

## Focus of this release

This is a layout/fullscreen-only update built on the working v3.10.0 puzzle engine. Puzzle geometry, magnetic snapping, drag behavior, progression, audio files, and the ARTEZIQ shared UI/audio modules are unchanged.

### Fullscreen startup
- Fullscreen Lock now defaults ON once for the v3.10.1 migration using the existing `aj_` storage prefix.
- The existing UI kit is still used as-is.
- The app calls `UIKIT.applyFSLock()` on launch and when a puzzle starts.
- Browsers that block true fullscreen without a user gesture retry on the first pointer interaction.
- iOS fallback behavior remains the UI kit's `body.immersive` mode.
- No keydown-based fullscreen or audio-unlock behavior was added.

### Tackle Tray normalization
- Every difficulty now uses the same 58px tray thumbnail size.
- The Tackle Tray has a fixed 116px height at 12, 48, 108, and 192 pieces.
- This matches the compact tray behavior of the prior 108-piece layout.
- Actual puzzle piece size on the play table is unchanged; only tray thumbnails are normalized.
- Tray scrolling remains horizontal.

## Changed files
- `index.html`
- `css/styles.css`
- `js/app.js`
- `sw.js`
- `README.md`

## Not changed
- `arteziq-audio.js`
- `arteziq-ui.js`
- `arteziq-ui.css`
- fish/puzzle artwork
- puzzle geometry / magnetic snapping
- audio files
