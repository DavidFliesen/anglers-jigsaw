# Angler's Jigsaw — Ladybug activation

The Ladybug UI and reporting code are already wired into v3.11.0. It intentionally stays hidden until its two PUBLIC browser keys are supplied.

1. In the centralized ARTEZIQ Feedback Dashboard, make sure an app record exists with slug `anglers-jigsaw`.
2. Copy that app's **Public ingest key**.
3. Open `ladybug/ladybug-config.js`.
4. Replace `REPLACE_WITH_SUPABASE_PUBLISHABLE_KEY` with the same public Supabase publishable key used by Angler's Navigator.
5. Replace `REPLACE_WITH_ANGLERS_JIGSAW_PUBLIC_INGEST_KEY` with the Jigsaw Public ingest key.
6. Do not change `slug: 'anglers-jigsaw'`.
7. Upload the complete site.
8. Open the app with `?ladybug=debug` once. The page should report `data-ladybug=ready`; if a Ladybug file is missing, the red debug chip identifies it.

The connector uses the same Development-mode Explorer sign-in flow as Angler's Navigator. Only public keys belong in the browser.
