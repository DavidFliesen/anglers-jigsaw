# Angler's Jigsaw v3.10.0

## ARTEZIQ shared audio + UI integration

This release starts from the v3.9.9 structural interaction baseline and wires in the provided ARTEZIQ modules without rewriting them.

### Added as-is
- `arteziq-audio.js` — exact file from the supplied kit
- `arteziq-ui.js` — exact file from the supplied kit
- `arteziq-ui.css` — exact file from the supplied kit

### Added audio
- `assets/audio/menu.mp3`
- `assets/audio/play-freshwater.mp3`
- `assets/audio/play-deep.mp3`
- `assets/audio/reveal-sting.mp3`

### Jigsaw wiring
- Both `AUDIO.init()` and `UIKIT.init()` use storage prefix **`aj_`**.
- Menu/home/selection/How to Play/Fish Caught use the menu bed.
- Puzzle levels alternate the two provided gameplay beds for variety: odd levels use `freshwater`, even levels use `deep`.
- Puzzle completion plays `AUDIO.sting()`, which fully ducks the gameplay bed under the supplied reveal sting.
- Board lock -> `sfx("lock")`.
- Non-locking piece drop -> `sfx("place")`.
- Push/Pull -> `sfx("shuffle")`.
- No-op Push/Pull -> `sfx("wrong")`.
- Generic app buttons -> `sfx("tap")`.
- Optional `sfx-*.mp3` files are not included; the supplied engine treats them as silent no-ops until they are added.

### UI kit
- Adds fullscreen, sound and settings buttons at the true top-right.
- Settings panel provides persisted music volume, SFX volume and fullscreen lock.
- `UIKIT.applyFSLock()` is called at puzzle start.
- The normal app header/footer carry `app-chrome`; iOS immersive fallback can hide them without hiding puzzle controls.
- Range slider `tabindex="-1" inputmode="none"` and blur behavior come from the supplied UI module unchanged.
- No new `keydown` audio-unlock handling was added.

### Service worker
Cache bumped to `anglers-jigsaw-v3-10-0`; shared modules and the four supplied audio files are precached.
