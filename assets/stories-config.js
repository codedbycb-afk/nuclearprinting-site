/* Live-stories config for nuclearprinting.com. Publishable key only (RLS-safe).
   When present, stories-loader.js hydrates the story rail from Supabase; if the
   project is unreachable it silently falls back to the built-in stories. */
window.NUCLEAR_STORY_CONFIG = {
  SUPABASE_URL: "https://ewsfvlbtwpxlbolfjmst.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_S381-PQ50HEzwQ-qu9FJCQ_xwZYQxY4",
  BUCKET: "stories"
};
