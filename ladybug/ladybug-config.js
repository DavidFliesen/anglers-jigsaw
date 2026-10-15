/*
 * ARTEZIQ Feedback — Angler's Jigsaw PUBLIC browser configuration.
 * Only public values belong here. Never paste a service-role key, PAT, password, or other secret.
 *
 * The Ladybug launcher is enabled when these public browser values pass validation.
 * publishableKey: use the same Supabase public publishable key as Angler's Navigator.
 * appKey: use the Angler's Jigsaw Public ingest key from the Feedback Dashboard app record.
 */
export const LADYBUG_CONFIG = {
  supabaseUrl: 'https://mehsjriwijsyquhmrzkh.supabase.co',
  publishableKey: 'sb_publishable_GJzFbU63AAgok24gxPrnSA_FL0H3kfu',
  appKey: 'b3678140-3b41-44bb-b8e8-6915e97957e3',
  slug: 'anglers-jigsaw',
  iconUrl: 'ladybug/assets/ladybug-feedback-icon-256.png',
  bottomOffsetPx: 16,
  bottomOffsetPhonePx: 12,
};
export function ladybugConfigured(cfg = LADYBUG_CONFIG) {
  const real = (v, min) => typeof v === 'string' && v.length >= min && !/^REPLACE/i.test(v) && !/\s/.test(v);
  return real(cfg.publishableKey, 20) && real(cfg.appKey, 8) && real(cfg.slug, 3);
}
