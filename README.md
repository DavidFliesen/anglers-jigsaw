# Angler's Jigsaw — v3.2.2

Version 3.2.2 adds subtle ambient fish animation to the water background so the game feels more alive without distracting from puzzle play.

## v3.2.2 changes

### Ambient fish swimmers
- Added three animated background fish that loop gently behind the interface:
  - Rainbow Trout
  - Catfish
  - Flounder
- Fish swim across the background just above the water layer.
- The system limits the scene to **no more than 3 fish on screen at one time**.
- Fish sizes stay modest so they do not dominate the play area.

### Subtle “breathing” motion
- Each fish has a very light breathing / life-like motion.
- The animation is intentionally restrained so it does not become tiring on the eyes while solving puzzles.
- Swim speed, opacity, direction, and vertical drift are varied for a more natural feel.

### Accessibility / motion restraint
- Ambient fish are non-interactive and sit behind the gameplay UI.
- Reduced-motion users are respected through `prefers-reduced-motion`, which disables the ambient fish animation.

### Version / cache notes
- App version text updated to: `v3.2.2`
- Asset query strings updated in `index.html` to help refresh the new build.

## Changed files
- `index.html`
- `README.md`
- `assets/images/ambient/rainbow-trout.png`
- `assets/images/ambient/catfish.png`
- `assets/images/ambient/flounder.png`
