/* ============================================================
   NUCLEAR STORIES — Photo editor (Phase 2)
   Crop (pinch/drag) · straighten · presets · brightness/contrast/
   saturation/warmth. Runs before a story uploads.

   No dependencies, no build step — plain canvas so it works
   offline inside the installed PWA.

   editPhoto(file, {index, total}) -> Promise<Blob|File|null>
     Blob  = edited JPEG, upload this
     File  = original, user tapped "Skip edit"
     null  = user discarded this photo
   ============================================================ */

const MAX_OUT = 1600;   // longest side of the exported JPEG
const QUALITY = 0.9;

const ASPECTS = [
  { id: "4:5",  label: "4:5",  ratio: 4 / 5 },   // matches the site's story rail
  { id: "1:1",  label: "1:1",  ratio: 1 },
  { id: "9:16", label: "9:16", ratio: 9 / 16 },
  { id: "orig", label: "Original", ratio: null },
];

/* brightness/contrast/saturate are %, warmth is -100..100, grayscale is % */
const PRESETS = [
  { id: "none",  label: "None",  adj: { brightness: 100, contrast: 100, saturate: 100, warmth: 0,   grayscale: 0 } },
  { id: "punch", label: "Punch", adj: { brightness: 104, contrast: 118, saturate: 125, warmth: 5,   grayscale: 0 } },
  { id: "warm",  label: "Warm",  adj: { brightness: 104, contrast: 105, saturate: 112, warmth: 55,  grayscale: 0 } },
  { id: "cool",  label: "Cool",  adj: { brightness: 102, contrast: 108, saturate: 92,  warmth: -55, grayscale: 0 } },
  { id: "fade",  label: "Fade",  adj: { brightness: 110, contrast: 86,  saturate: 80,  warmth: 10,  grayscale: 0 } },
  { id: "bw",    label: "B&W",   adj: { brightness: 106, contrast: 120, saturate: 0,   warmth: 0,   grayscale: 100 } },
];

const DEFAULT_ADJ = { brightness: 100, contrast: 100, saturate: 100, warmth: 0, grayscale: 0 };

const $ = (s) => document.querySelector(s);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const rad = (deg) => (deg * Math.PI) / 180;

/* Warmth is a friendlier single knob than raw sepia/hue:
   positive warms (sepia), negative cools (slight blue hue shift). */
function filterCSS(a) {
  const sepia = a.warmth > 0 ? a.warmth * 0.3 : 0;
  const hue   = a.warmth < 0 ? a.warmth * 0.1 : 0;
  return `brightness(${a.brightness}%) contrast(${a.contrast}%) saturate(${a.saturate}%) ` +
         `sepia(${sepia}%) grayscale(${a.grayscale}%) hue-rotate(${hue}deg)`;
}

/* ---------- geometry ----------
   screen = frameCentre + t + R(rot) · (scale · imagePoint)
   Scale is anchored to "cover" so the crop frame can never show empty space. */

// Smallest scale at which the rotated image still covers the W×H frame.
function coverScale(iw, ih, W, H, rot) {
  const c = Math.abs(Math.cos(rot)), s = Math.abs(Math.sin(rot));
  return Math.max((W * c + H * s) / iw, (W * s + H * c) / ih);
}

// Keep the frame inside the image: clamp the pan in image space, map back.
function clampPan(st) {
  const { iw, ih, FW, FH, rot, scale } = st;
  const cos = Math.cos(rot), sin = Math.sin(rot);
  const ax = ((FW / scale) * Math.abs(cos) + (FH / scale) * Math.abs(sin)) / 2;
  const ay = ((FW / scale) * Math.abs(sin) + (FH / scale) * Math.abs(cos)) / 2;
  const maxCx = Math.max(0, iw / 2 - ax);
  const maxCy = Math.max(0, ih / 2 - ay);

  let cx = ( cos * -st.tx + sin * -st.ty) / scale;   // R(-rot) · (-t)/scale
  let cy = (-sin * -st.tx + cos * -st.ty) / scale;
  cx = clamp(cx, -maxCx, maxCx);
  cy = clamp(cy, -maxCy, maxCy);

  st.tx = -(cos * cx - sin * cy) * scale;            // t = -R(rot) · c · scale
  st.ty = -(sin * cx + cos * cy) * scale;
}

function paint(ctx, st, outW, outH) {
  const k = outW / st.FW;                            // frame px -> output px
  ctx.save();
  ctx.clearRect(0, 0, outW, outH);
  ctx.translate(outW / 2, outH / 2);
  ctx.translate(st.tx * k, st.ty * k);
  ctx.rotate(st.rot);
  const s = st.scale * k;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(st.img, (-st.iw * s) / 2, (-st.ih * s) / 2, st.iw * s, st.ih * s);
  ctx.restore();
}

/* ---------- export ----------
   ctx.filter is exact where supported. Where it isn't (older Safari), fall
   back to the equivalent colour matrix so the export still matches what Joe
   saw in the preview. */
function exportBlob(st) {
  const r = st.FW / st.FH;
  const outW = r >= 1 ? MAX_OUT : Math.round(MAX_OUT * r);
  const outH = r >= 1 ? Math.round(MAX_OUT / r) : MAX_OUT;

  const cv = document.createElement("canvas");
  cv.width = outW; cv.height = outH;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, outW, outH);

  const css = filterCSS(st.adj);
  const native = "filter" in ctx;
  if (native) ctx.filter = css;
  paint(ctx, st, outW, outH);
  if (!native) applyColorMatrix(ctx, outW, outH, st.adj);

  return new Promise((res) => cv.toBlob((b) => res(b), "image/jpeg", QUALITY));
}

// Same operations as filterCSS, in the same order, as one 3x3 matrix + offset.
function applyColorMatrix(ctx, w, h, a) {
  let m = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  let off = [0, 0, 0];
  const mul = (n) => {                                  // n · m
    const o = new Array(9);
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        o[i * 3 + j] = n[i * 3] * m[j] + n[i * 3 + 1] * m[3 + j] + n[i * 3 + 2] * m[6 + j];
    const oo = [
      n[0] * off[0] + n[1] * off[1] + n[2] * off[2],
      n[3] * off[0] + n[4] * off[1] + n[5] * off[2],
      n[6] * off[0] + n[7] * off[1] + n[8] * off[2],
    ];
    m = o; off = oo;
  };
  const scalar = (k, add) => { mul([k, 0, 0, 0, k, 0, 0, 0, k]); off = off.map((v) => v + add); };

  scalar(a.brightness / 100, 0);
  const c = a.contrast / 100;
  scalar(c, 0.5 * (1 - c) * 255);

  const sat = a.saturate / 100;                          // filter-effects saturate matrix
  const L = [0.213, 0.715, 0.072];
  mul([
    L[0] + (1 - L[0]) * sat, L[1] * (1 - sat),           L[2] * (1 - sat),
    L[0] * (1 - sat),        L[1] + (1 - L[1]) * sat,    L[2] * (1 - sat),
    L[0] * (1 - sat),        L[1] * (1 - sat),           L[2] + (1 - L[2]) * sat,
  ]);

  const sp = (a.warmth > 0 ? a.warmth * 0.3 : 0) / 100;  // sepia matrix
  if (sp > 0) mul([
    0.393 + 0.607 * (1 - sp), 0.769 - 0.769 * (1 - sp), 0.189 - 0.189 * (1 - sp),
    0.349 - 0.349 * (1 - sp), 0.686 + 0.314 * (1 - sp), 0.168 - 0.168 * (1 - sp),
    0.272 - 0.272 * (1 - sp), 0.534 - 0.534 * (1 - sp), 0.131 + 0.869 * (1 - sp),
  ]);

  const g = a.grayscale / 100;                           // grayscale matrix
  if (g > 0) mul([
    L[0] + (1 - L[0]) * (1 - g), L[1] * g,                    L[2] * g,
    L[0] * g,                    L[1] + (1 - L[1]) * (1 - g), L[2] * g,
    L[0] * g,                    L[1] * g,                    L[2] + (1 - L[2]) * (1 - g),
  ]);

  const hueDeg = a.warmth < 0 ? a.warmth * 0.1 : 0;      // hue-rotate matrix
  if (hueDeg !== 0) {
    const co = Math.cos(rad(hueDeg)), si = Math.sin(rad(hueDeg));
    mul([
      0.213 + co * 0.787 - si * 0.213, 0.715 - co * 0.715 - si * 0.715, 0.072 - co * 0.072 + si * 0.928,
      0.213 - co * 0.213 + si * 0.143, 0.715 + co * 0.285 + si * 0.140, 0.072 - co * 0.072 - si * 0.283,
      0.213 - co * 0.213 - si * 0.787, 0.715 - co * 0.715 + si * 0.715, 0.072 + co * 0.928 + si * 0.072,
    ]);
  }

  const img = ctx.getImageData(0, 0, w, h), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], gg = d[i + 1], b = d[i + 2];
    d[i]     = clamp(m[0] * r + m[1] * gg + m[2] * b + off[0], 0, 255);
    d[i + 1] = clamp(m[3] * r + m[4] * gg + m[5] * b + off[1], 0, 255);
    d[i + 2] = clamp(m[6] * r + m[7] * gg + m[8] * b + off[2], 0, 255);
  }
  ctx.putImageData(img, 0, 0);
}

/* ---------- main ---------- */
export function editPhoto(file, meta = {}) {
  return new Promise((resolve) => {
    const modal  = $("#editor");
    const stage  = $("#edStage");
    const canvas = $("#edCanvas");
    const ctx    = canvas.getContext("2d");

    const img = new Image();                 // <img> auto-applies EXIF orientation
    const url = URL.createObjectURL(file);

    const st = {
      img, iw: 0, ih: 0, FW: 0, FH: 0,
      aspect: "4:5", rot: 0, zoom: 1, scale: 1, tx: 0, ty: 0,
      adj: { ...DEFAULT_ADJ }, preset: "none",
    };

    const finish = (value) => {
      modal.classList.add("hidden");
      document.body.classList.remove("noscroll");
      URL.revokeObjectURL(url);
      teardown();
      resolve(value);
    };

    /* ----- layout ----- */
    function fitFrame() {
      const ratio = st.aspect === "orig"
        ? st.iw / st.ih
        : ASPECTS.find((a) => a.id === st.aspect).ratio;
      const maxW = stage.clientWidth;
      const maxH = stage.clientHeight;
      let FH = Math.min(maxH, maxW / ratio);
      let FW = FH * ratio;
      if (FW > maxW) { FW = maxW; FH = FW / ratio; }
      st.FW = FW; st.FH = FH;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(FW * dpr);
      canvas.height = Math.round(FH * dpr);
      canvas.style.width = FW + "px";
      canvas.style.height = FH + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      reflow();
    }

    // Recompute cover scale (it changes with rotation) and re-clamp the pan.
    function reflow() {
      if (!st.FW || !st.iw) return;              // frame not measured yet
      const cover = coverScale(st.iw, st.ih, st.FW, st.FH, st.rot);
      st.scale = cover * st.zoom;
      clampPan(st);
      draw();
    }

    function draw() {
      canvas.style.filter = filterCSS(st.adj);   // live preview: GPU, stays smooth
      paint(ctx, st, st.FW, st.FH);
    }

    /* ----- gestures ----- */
    const pointers = new Map();
    let pinchStart = 0, zoomStart = 1;

    const onDown = (e) => {
      canvas.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        pinchStart = pinchDist();
        zoomStart = st.zoom;
      }
    };
    const onMove = (e) => {
      if (!pointers.has(e.pointerId)) return;
      const prev = pointers.get(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.size === 2) {
        const d = pinchDist();
        if (pinchStart > 0) {
          st.zoom = clamp((zoomStart * d) / pinchStart, 1, 4);
          $("#edZoom").value = st.zoom;
          reflow();
        }
        return;
      }
      st.tx += e.clientX - prev.x;
      st.ty += e.clientY - prev.y;
      clampPan(st);
      draw();
    };
    const onUp = (e) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchStart = 0;
    };
    function pinchDist() {
      const [a, b] = [...pointers.values()];
      return Math.hypot(a.x - b.x, a.y - b.y);
    }

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    /* ----- chips + sliders ----- */
    const aspectRow = $("#edAspects");
    const presetRow = $("#edPresets");
    aspectRow.innerHTML = ASPECTS
      .map((a) => `<button class="chip ${a.id === st.aspect ? "on" : ""}" data-aspect="${a.id}">${a.label}</button>`)
      .join("");
    presetRow.innerHTML = PRESETS
      .map((p) => `<button class="chip ${p.id === st.preset ? "on" : ""}" data-preset="${p.id}">${p.label}</button>`)
      .join("");

    const onAspect = (e) => {
      const b = e.target.closest("[data-aspect]");
      if (!b) return;
      st.aspect = b.dataset.aspect;
      st.tx = st.ty = 0; st.zoom = 1; $("#edZoom").value = 1;
      aspectRow.querySelectorAll(".chip").forEach((c) => c.classList.toggle("on", c === b));
      fitFrame();
    };
    const onPreset = (e) => {
      const b = e.target.closest("[data-preset]");
      if (!b) return;
      st.preset = b.dataset.preset;
      st.adj = { ...PRESETS.find((p) => p.id === st.preset).adj };
      presetRow.querySelectorAll(".chip").forEach((c) => c.classList.toggle("on", c === b));
      syncSliders();
      draw();
    };
    aspectRow.addEventListener("click", onAspect);
    presetRow.addEventListener("click", onPreset);

    const SLIDERS = {
      "#edZoom":       (v) => { st.zoom = +v; reflow(); },
      "#edRot":        (v) => { st.rot = rad(+v); reflow(); },
      "#edBrightness": (v) => { st.adj.brightness = +v; onManualAdjust(); },
      "#edContrast":   (v) => { st.adj.contrast = +v; onManualAdjust(); },
      "#edSaturate":   (v) => { st.adj.saturate = +v; onManualAdjust(); },
      "#edWarmth":     (v) => { st.adj.warmth = +v; onManualAdjust(); },
    };
    // Touching a slider means the look is no longer a named preset.
    function onManualAdjust() {
      st.preset = "custom";
      presetRow.querySelectorAll(".chip").forEach((c) => c.classList.remove("on"));
      draw();
    }
    const sliderHandlers = [];
    for (const [sel, fn] of Object.entries(SLIDERS)) {
      const el = $(sel);
      const h = (e) => fn(e.target.value);
      el.addEventListener("input", h);
      sliderHandlers.push([el, h]);
    }
    function syncSliders() {
      $("#edBrightness").value = st.adj.brightness;
      $("#edContrast").value = st.adj.contrast;
      $("#edSaturate").value = st.adj.saturate;
      $("#edWarmth").value = st.adj.warmth;
    }

    /* ----- buttons ----- */
    const onReset = () => {
      st.rot = 0; st.zoom = 1; st.tx = st.ty = 0;
      st.adj = { ...DEFAULT_ADJ };
      st.preset = "none";
      $("#edZoom").value = 1; $("#edRot").value = 0;
      syncSliders();
      presetRow.querySelectorAll(".chip").forEach((c) => c.classList.toggle("on", c.dataset.preset === "none"));
      reflow();
    };
    const onDiscard = () => finish(null);
    const onSkip = () => finish(file);
    const onDone = async () => {
      $("#edDone").disabled = true;
      $("#edDone").textContent = "Working…";
      const blob = await exportBlob(st);
      $("#edDone").disabled = false;
      $("#edDone").textContent = "Use Photo";
      finish(blob || file);
    };

    $("#edReset").addEventListener("click", onReset);
    $("#edDiscard").addEventListener("click", onDiscard);
    $("#edSkip").addEventListener("click", onSkip);
    $("#edDone").addEventListener("click", onDone);
    window.addEventListener("resize", fitFrame);

    function teardown() {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      aspectRow.removeEventListener("click", onAspect);
      presetRow.removeEventListener("click", onPreset);
      sliderHandlers.forEach(([el, h]) => el.removeEventListener("input", h));
      $("#edReset").removeEventListener("click", onReset);
      $("#edDiscard").removeEventListener("click", onDiscard);
      $("#edSkip").removeEventListener("click", onSkip);
      $("#edDone").removeEventListener("click", onDone);
      window.removeEventListener("resize", fitFrame);
    }

    /* ----- go ----- */
    img.onload = () => {
      st.iw = img.naturalWidth;
      st.ih = img.naturalHeight;
      $("#edCount").textContent =
        meta.total > 1 ? `Photo ${meta.index} of ${meta.total}` : "Edit photo";
      onReset();
      modal.classList.remove("hidden");
      document.body.classList.add("noscroll");
      fitFrame();
    };
    img.onerror = () => { URL.revokeObjectURL(url); teardown(); resolve(file); };  // unreadable → post as-is
    img.src = url;
  });
}
