/* ============================================================
   NUCLEAR STORIES — Studio (Joe's admin PWA)
   Phase 1: upload per category · newest-first · "new" glow ·
            edit caption · archive/unarchive (never hard-delete).
   Backend: Supabase (auth + storage + row level security).
   ============================================================ */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  for (const file of files) {
    toast(`Uploading ${file.name}…`);
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${slug(state.category)}/${Date.now()}-${Math.round(performance.now())}.${ext}`;
    const up = await sb.storage.from(BUCKET).upload(path, file, { cacheControl: "3600", upsert: false });
    if (up.error) { toast(up.error.message); continue; }
    const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(path);
    const { error } = await sb.from("stories").insert({
      category: state.category, image_path: path, image_url: pub.publicUrl,
      is_new: true, is_archived: false, sort_order: 0
    });
    if (error) { toast(error.message); continue; }
  }
  toast("Posted. It's now the first story on the site.");
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
  const grid = $("#grid"), empty = $("#empty");
  empty.classList.toggle("hidden", (data || []).length > 0);
  grid.innerHTML = (data || []).map(cardHTML).join("");
  (data || []).forEach(wireCard);
}

function cardHTML(s) {
  return `<div class="card ${s.is_new ? "newflag" : ""} ${s.is_archived ? "archived" : ""}" data-id="${s.id}">
    <div class="thumb"><img src="${s.image_url}" alt="" loading="lazy"/></div>
    <div class="body">
      <div class="cat">${escapeHTML(s.category)}</div>
      <textarea data-field="caption" placeholder="Caption (optional)">${escapeHTML(s.caption || "")}</textarea>
      <div class="row">
        <button class="btn sm" data-act="save">Save</button>
        <button class="btn sm" data-act="glow">${s.is_new ? "Clear glow" : "Mark new"}</button>
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
    const { error } = await sb.from("stories").update({ is_new: !s.is_new }).eq("id", s.id);
    if (error) return toast(error.message);
    render();
  };
  el.querySelector('[data-act="archive"]').onclick = async () => {
    const { error } = await sb.from("stories").update({ is_archived: !s.is_archived }).eq("id", s.id);
    if (error) return toast(error.message);
    toast(s.is_archived ? "Restored." : "Archived (not deleted).");
    render();
  };
}

/* ---------- helpers ---------- */
const slug = (s) => (s || "general").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
function escapeHTML(s) { const d = document.createElement("div"); d.textContent = s ?? ""; return d.innerHTML; }

/* ---------- service worker (home-screen install) ---------- */
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});

boot();
