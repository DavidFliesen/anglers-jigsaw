# Angler's Jigsaw — Ladybug activation (v3.11.1)

The Ladybug feedback connector is now configured with the public browser values for Angler's Jigsaw.

Configured values:
- Supabase URL: `https://mehsjriwijsyquhmrzkh.supabase.co`
- Slug: `anglers-jigsaw`
- Report prefix/session prefix: `AJ`
- Public ingest key: configured from the Angler's Jigsaw Feedback Dashboard app record
- Supabase publishable key: configured with the same public key used by the ARTEZIQ Feedback system

The app's central Feedback Dashboard currently controls access mode, Tester Mode availability, enrollment, and active state. Those settings are intentionally not hard-coded in the PWA.

After deployment:
1. Open the app normally. The Ladybug launcher should appear at the bottom-right.
2. Tap the Ladybug. In Development mode, sign in with an approved Founder/Internal Tester account when prompted.
3. Submit a short test report and confirm a Report ID is returned.
4. For diagnostics, append `?ladybug=debug` to the app URL. `data-ladybug` should become `ready`.

Only public browser keys are stored in this file. Do not place service-role keys, GitHub PATs, passwords, or other secrets in the PWA.
