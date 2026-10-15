/*
 * ARTEZIQ Feedback — Angler's Jigsaw PUBLIC browser configuration.
 * Only public values belong here. Never paste a service-role key, PAT, password, or other secret.
 *
 * The Ladybug stays hidden until publishableKey and appKey are filled in.
 * publishableKey: use the same Supabase public publishable key as Angler's Navigator.
 * appKey: use the Angler's Jigsaw Public ingest key from the Feedback Dashboard app record.
 */
export const LADYBUG_CONFIG = {
  supabaseUrl: 'https://mehsjriwijsyquhmrzkh.supabase.co',
  publishableKey: 'REPLACE_WITH_SUPABASE_PUBLISHABLE_KEY',
  appKey: 'REPLACE_WITH_ANGLERS_JIGSAW_PUBLIC_INGEST_KEY',
  slug: 'anglers-jigsaw',
  iconUrl: 'ladybug/assets/ladybug-feedback-icon-256.png',
  bottomOffsetPx: 16,
  bottomOffsetPhonePx: 12,
};
export function ladybugConfigured(cfg = LADYBUG_CONFIG) {
  const real = (v, min) => typeof v === 'string' && v.length >= min && !/^REPLACE/i.test(v) && !/\s/.test(v);
  return real(cfg.publishableKey, 20) && real(cfg.appKey, 8) && real(cfg.slug, 3);
}
