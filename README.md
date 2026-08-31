# Angler's Jigsaw v3.10.8

## Puzzle-toolbar reliability repair

This release fixes intermittent iPad toolbar presses for Home, ALL, EDGES, PULL, PUSH, Trace and Fish Caught.

### Root cause
The gameplay toolbar depended on `pointerup`, with `click` suppressed for a short period afterward. iPadOS/Safari can cancel or swallow `pointerup` after fullscreen, system gestures, interrupted puzzle drags, or other touch transitions. When that happened, the intended action never ran and the fallback click could also be suppressed.

### Fix
- Gameplay toolbar now uses one delegated `pointerdown` action path.
- One physical touch executes the action before iPadOS can cancel the end of the gesture.
- `click` is retained only for keyboard/accessibility activation.
- PUSH/PULL requests are queued instead of silently ignored while a previous board operation is rendering.
- Explicit toolbar stacking/pointer rules keep the play table, tray, pieces and drag layer from intercepting toolbar touches.
- Added immediate press feedback.

No puzzle rendering, fish artwork, audio/UI kit module, theme, tray tap, magnetics or progression logic was changed.
