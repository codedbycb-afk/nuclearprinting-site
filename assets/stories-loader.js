/* Live story feed for nuclearprinting.com.
   Reads non-archived stories from Supabase (RLS lets anon see only active ones),
   newest + "new" first. Publishable key is browser-safe. Any failure returns []
   so the built-in stories stay — the rail can never break. */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ewsfvlbtwpxlbolfjmst.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_S381-PQ50HEzwQ-qu9FJCQ_xwZYQxY4";

export async function fetchLiveStories() {
  try {
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await sb.from("stories")
      .select("category,title,caption,image_url,is_new,created_at")
      .order("is_new", { ascending: false })
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map((s) => ({
      img: s.image_url,
      label: s.category,
      kicker: s.is_new ? "Just Posted" : s.category,
      title: s.title || s.category,
      text: s.caption || "",
      isNew: !!s.is_new,
      __live: true
    }));
  } catch { return []; }
}
