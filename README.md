# Angler's Jigsaw v3.11.0

## ARTEZIQ Ladybug feedback integration

This release adds the same shared ARTEZIQ Ladybug v0.2 feedback connector used by Angler's Navigator. The shared `ladybug-auth.js` and `ladybug-feedback.js` files are copied unchanged from `ARTEZIQ-Ladybug-shared-v0.2.zip`.

The Ladybug supports approved Explorer sign-in, Bug / Feature request / Suggestion / Question / Other report types, severity selection, optional screenshot capture with preview, optional Tester Mode diagnostics, report confirmation IDs, and friendly submission errors.

### One-time public configuration
`ladybug/ladybug-config.js` is included and already has:
- Supabase project URL
- slug: `anglers-jigsaw`
- launcher icon path
- standard bottom-right offsets

Two PUBLIC browser values still have to be pasted before the launcher appears:
1. `publishableKey` — use the same Supabase publishable key already used by Angler's Navigator.
2. `appKey` — use the Angler's Jigsaw Public ingest key from the centralized Feedback Dashboard app record.

Do not put a service-role key, GitHub token, PAT, password, or other secret in this file.

### Jigsaw feedback context
Reports include privacy-safe context only: app version, current app screen, level/piece count when on a puzzle, device/browser metadata supplied by the shared connector, and optional Tester Mode workflow events. Jigsaw does not send fish-progress data, typed report text as telemetry, tokens, or any location data.

### Files added
- `ladybug/ladybug-config.js`
- `ladybug/ladybug-auth.js`
- `ladybug/ladybug-feedback.js`
- `ladybug/assets/ladybug-feedback-icon.png`
- `ladybug/assets/ladybug-feedback-icon-256.png`
- `ladybug/vendor/html2canvas.min.js`
- `ladybug/vendor/html2canvas.LICENSE.txt`

---

Narrow install-name update.

Changes:
- PWA manifest `short_name` is now `Angler's Jigsaw`.
- Added `application-name` and `apple-mobile-web-app-title` metadata so browser/PWA installs, including iOS Add to Home Screen, use `Angler's Jigsaw`.
- Bumped application/service-worker version to v3.10.9 so the updated manifest/meta refreshes cleanly.

No gameplay, audio, UI, fish, puzzle, tray, or theme logic changed.
