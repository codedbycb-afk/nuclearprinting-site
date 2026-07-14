/* Live story feed for nuclearprinting.com.
   Reads non-archived stories from Supabase (RLS lets anon see only active ones),
   newest + "new" first. Publishable key is browser-safe. Any failure returns []
   so the built-in stories stay — the rail can never break. */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ewsfvlbtwpxlbolfjmst.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_S381-PQ50HEzwQ-qu9FJCQ_xwZYQxY4";

/* A story pulses while glow_until is in the future — 24h from upload, then it
   stops on its own. Derived at render time, so no cron has to switch it off. */
export const isGlowing = (s) => !!s.glowUntil && new Date(s.glowUntil).getTime() > Date.now();

export async function fetchLiveStories() {
  try {
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await sb.from("stories")
      .select("category,title,caption,image_url,glow_until,created_at")
      .order("glow_until", { ascending: false })   // still-glowing stories lead the rail
      .order("created_at", { ascending: false });  // then newest first
    if (error || !data) return [];
    return data.map((s) => {
      const st = {
        img: s.image_url,
        label: s.category,
        title: s.title || s.category,
        text: s.caption || "",
        glowUntil: s.glow_until,
        __live: true
      };
      st.isNew = isGlowing(st);
      st.kicker = st.isNew ? "Just Posted" : s.category;
      return st;
    });
  } catch { return []; }
}
