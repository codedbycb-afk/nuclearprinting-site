/* ============================================================
   NUCLEAR STORIES — Studio (Joe's admin PWA)
   Phase 1: upload per category · newest-first · "new" glow ·
            edit caption · archive/unarchive (never hard-delete).
   Phase 2: in-app photo editing before a story posts (see editor.js).
   Backend: Supabase (auth + storage + row level security).
   ============================================================ */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { editPhoto } from "./editor.js";

const CFG = window.NUCLEAR_STORY_CONFIG;
if (!CFG || CFG.SUPABASE_URL.includes("YOUR-PROJECT")) {
  document.getElementById("loginMsg").textContent =
    "config.js not set — paste your Supabase URL + anon key (see config.example.js).";
}
const sb = createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
const BUCKET = CFG.BUCKET || "stories";

const $ = (s) => document.querySelector(s);
const state = { view: "active", category: null, categories: [] };

/* ---------- toast ---------- */
let toastT;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg; t.classList.remove("hidden");
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.add("hidden"), 2600);
}

/* ---------- AUTH ---------- */
$("#loginBtn").onclick = async () => {
  const email = $("#email").value.trim();
  const password = $("#password").value;
  const m = $("#loginMsg");
  m.className = "msg"; m.textContent = "Signing in…";
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) { m.className = "msg err"; m.textContent = error.message; return; }
  boot();
};
$("#logoutBtn").onclick = async () => { await sb.auth.signOut(); location.reload(); };

async function boot() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { $("#login").classList.remove("hidden"); $("#app").classList.add("hidden"); return; }
  $("#login").classList.add("hidden"); $("#app").classList.remove("hidden");
  await loadCategories();
  await render();
}

/* ---------- CATEGORIES ---------- */
async function loadCategories() {
  const { data } = await sb.from("story_categories").select("name").order("sort_order");
  state.categories = (data || []).map((r) => r.name);
  const sel = $("#catSelect");
  sel.innerHTML = state.categories.map((c) => `<option>${c}</option>`).join("");
  state.category = state.category || state.categories[0] || "General";
  sel.value = state.category;
}
$("#catSelect").onchange = (e) => { state.category = e.target.value; render(); };
$("#addCatBtn").onclick = async () => {
  const name = prompt("New category name:");
  if (!name) return;
  const { error } = await sb.from("story_categories")
    .insert({ name: name.trim(), sort_order: state.categories.length + 1 });
  if (error) return toast(error.message);
  state.category = name.trim();
  await loadCategories(); render();
};

/* ---------- VIEW TABS ---------- */
$("#tabActive").onclick = () => setView("active");
$("#tabArchived").onclick = () => setView("archived");
function setView(v) {
  state.view = v;
  $("#tabActive").classList.toggle("on", v === "active");
  $("#tabArchived").classList.toggle("on", v === "archived");
  render();
}

/* ---------- UPLOAD ---------- */
const drop = $("#drop"), fileInput = $("#file");
drop.onclick = () => fileInput.click();
fileInput.onchange = () => handleFiles([...fileInput.files]);
["dragover", "dragenter"].forEach((ev) =>
  drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("hot"); }));
["dragleave", "drop"].forEach((ev) =>
  drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("hot"); }));
drop.addEventListener("drop", (e) => handleFiles([...e.dataTransfer.files].filter(f => f.type.startsWith("image/"))));

async function handleFiles(files) {
  if (!files.length) return;
  let posted = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // Phase 2: crop/straighten/adjust before it posts.
    // Blob = edited · File = "skip edit" · null = discarded.
    const out = await editPhoto(file, { index: i + 1, total: files.length });
    if (!out) continue;

    toast(`Uploading ${i + 1} of ${files.length}…`);
    const ext = out instanceof File ? (file.name.split(".").pop() || "jpg").toLowerCase() : "jpg";
    const path = `${slug(state.category)}/${Date.now()}-${Math.round(performance.now())}.${ext}`;
    const up = await sb.storage.from(BUCKET).upload(path, out, {
      cacheControl: "3600", upsert: false, contentType: out.type || "image/jpeg"
    });
    if (up.error) { toast(up.error.message); continue; }
    const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(path);
    const { error } = await sb.from("stories").insert({
      category: state.category, image_path: path, image_url: pub.publicUrl,
      glow_until: glowFrom(Date.now()),     // pulses on the site for 24h, then stops on its own
      is_new: true, is_archived: false, sort_order: 0
    });
    if (error) { toast(error.message); continue; }
    posted++;
  }
  fileInput.value = "";                       // let Joe re-pick the same photo
  toast(posted
    ? "Posted. It's now the first story on the site."
    : "Nothing posted.");
  render();
}

/* ---------- RENDER GRID ---------- */
async function render() {
  const { data, error } = await sb.from("stories")
    .select("*")
    .eq("category", state.category)
    .eq("is_archived", state.view === "archived")
    .order("created_at", { ascending: false });
  if (error) return toast(error.message);
  const rows = data || [];
  rows.forEach((s) => { s.__wasGlowing = isGlowing(s); });   // so the ticker knows what lapsed
  state.rows = rows;
  const grid = $("#grid"), empty = $("#empty");
  empty.classList.toggle("hidden", rows.length > 0);
  grid.innerHTML = rows.map(cardHTML).join("");
  rows.forEach(wireCard);
}

function cardHTML(s) {
  const on = isGlowing(s);
  return `<div class="card ${on ? "newflag" : ""} ${s.is_archived ? "archived" : ""}" data-id="${s.id}">
    <div class="thumb"><img src="${s.image_url}" alt="" loading="lazy"/></div>
    <div class="body">
      <div class="cat">${escapeHTML(s.category)}</div>
      <div class="glowstate ${on ? "on" : ""}">${glowLabel(s)}</div>
      <textarea data-field="caption" placeholder="Caption (optional)">${escapeHTML(s.caption || "")}</textarea>
      <div class="row">
        <button class="btn sm" data-act="save">Save</button>
        <button class="btn sm" data-act="glow">${on ? "Clear glow" : "Glow 24h"}</button>
      </div>
      <div class="row">
        <button class="btn sm ${s.is_archived ? "green" : "danger"}" data-act="archive">
          ${s.is_archived ? "Restore" : "Archive"}</button>
      </div>
    </div>
  </div>`;
}

function wireCard(s) {
  const el = document.querySelector(`.card[data-id="${s.id}"]`);
  if (!el) return;
  el.querySelector('[data-act="save"]').onclick = async () => {
    const caption = el.querySelector('[data-field="caption"]').value;
    const { error } = await sb.from("stories").update({ caption }).eq("id", s.id);
    toast(error ? error.message : "Saved.");
  };
  el.querySelector('[data-act="glow"]').onclick = async () => {
    // Glowing -> expire it now. Not glowing -> restart a fresh 24h window.
    const on = isGlowing(s);
    const { error } = await sb.from("stories")
      .update({ glow_until: on ? new Date().toISOString() : glowFrom(Date.now()), is_new: !on })
      .eq("id", s.id);
    if (error) return toast(error.message);
    toast(on ? "Glow cleared." : "Glowing for 24 hours.");
    render();
  };
  el.querySelector('[data-act="archive"]').onclick = async () => {
    const { error } = await sb.from("stories").update({ is_archived: !s.is_archived }).eq("id", s.id);
    if (error) return toast(error.message);
    toast(s.is_archived ? "Restored." : "Archived (not deleted).");
    render();
  };
}

/* ---------- glow ----------
   A story pulses on the website while glow_until is in the future. It's a
   timestamp, not a flag, so the glow expires on its own 24h after upload —
   no cron job, nothing running in the background. */
const GLOW_HOURS = 24;
const glowFrom = (ms) => new Date(ms + GLOW_HOURS * 3600 * 1000).toISOString();
const isGlowing = (s) => !!s.glow_until && new Date(s.glow_until).getTime() > Date.now();

function glowLabel(s) {
  if (!isGlowing(s)) return "Not glowing";
  const left = new Date(s.glow_until).getTime() - Date.now();
  const h = Math.floor(left / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  return h >= 1 ? `Glowing · ${h}h left` : `Glowing · ${m}m left`;
}

// Drop the glow in the UI the moment it lapses, even if Joe leaves the app open.
setInterval(() => {
  if ((state.rows || []).some((s) => s.glow_until && !isGlowing(s) && s.__wasGlowing)) render();
}, 60000);

/* ---------- helpers ---------- */
const slug = (s) => (s || "general").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
function escapeHTML(s) { const d = document.createElement("div"); d.textContent = s ?? ""; return d.innerHTML; }

/* ---------- service worker (home-screen install) ---------- */
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});

boot();
