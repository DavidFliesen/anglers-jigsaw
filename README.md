# Angler's Jigsaw — v3.5.0 GUI Design Release

This release intentionally focuses on presentation and app structure. The puzzle mechanics are left alone except for navigation/fullscreen wiring needed by the new universal chrome.

## What changed

### Cleaner fishing-first visual direction
- Removed the long kelp / grass-like decorative background treatment that made the scene feel amateurish.
- Shifted the interface toward a deeper nautical palette: navy, ocean blue, muted teal, sand/brass accents, and off-white text.
- Let the colorful fish and puzzle artwork provide most of the visual color instead of using large candy-colored controls.

### Home screen redesign
- The existing colorful `assets/images/logo.png` is now the main hero artwork.
- The title uses a stronger condensed sporting/outdoor style while staying readable.
- Start Fishing, How to Play, and Fish Cooler remain the three main choices, but are now quieter dark marine action panels with small accent colors rather than large bright pill buttons.

### Universal header
Every screen now uses the same three-item header:
- Home — left
- Cooler — center
- Full Screen / Exit Full Screen — right

The duplicate Home and Full Screen controls were removed from the puzzle toolbar. Puzzle-specific controls remain there.

### Fullscreen behavior
- The app keeps the universal Full Screen toggle available on every page.
- Navigation interactions make a best-effort fullscreen request when the browser permits it.
- Browsers such as iPad Safari still require fullscreen to be initiated from a user interaction, so a page cannot legally force fullscreen before the first tap.

### Compact universal footer
A small footer now identifies:
- ARTEZIQ
- Angler's Jigsaw
- Version number

It is intentionally short so it uses very little screen space.

### Advertising
No ad-safe layout zones were added in this release. Advertising placement is intentionally deferred. The current direction is to consider ads at natural transitions after a puzzle rather than consuming puzzle play space.

## Changed files
- `index.html`
- `css/styles.css`
- `js/app.js`
- `sw.js`
- `README.md`

## Existing logo
This release expects the updated colorful transparent-corner logo at:
`assets/images/logo.png`

That logo file is not included here because it was already replaced in the project.
