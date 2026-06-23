/* ============================================================
   NUCLEAR PRINTING — shared shell + interactive systems
   Injects nav, footer, floating button, interactive layer,
   story viewer. Drives scroll animations. One source of truth.
   ============================================================ */
import { animate } from "https://cdn.jsdelivr.net/npm/motion@11/+esm";

/* ---------- HELPERS ---------- */
const $  = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const PAGE = (location.pathname.split("/").pop()||"index.html").toLowerCase()||"index.html";
const HOME = PAGE==="index.html"||PAGE==="";

/* ---------- NAV MODEL ---------- */
const NAV=[
  ["apparel-production.html","Apparel Production"],
  ["merchandising-systems.html","Merchandising Systems"],
  ["faq.html","Resources"],
  ["blog.html","Blog"],
  ["faq.html","FAQ"],
];
const navLinks = NAV.map(([h,t])=>
  `<a href="${h}" ${h===PAGE?'class="active"':''}>${t}</a>`).join("");

/* ---------- DATA ---------- */
const STORIES = [
  {img:"assets/img/screenprint.jpg",label:"Screen Printing",kicker:"On The Floor",
   title:"Screen Printing",text:"Soft-hand prints pulled with sharp detail and accurate color."},
  {img:"assets/img/embroidery.jpg",label:"Embroidery",kicker:"Inside Embroidery",
   title:"Embroidery",text:"Precision stitching on caps, uniforms, and premium apparel."},
  {img:"assets/img/ink.jpg",label:"Ink Room",kicker:"Production Culture",
   title:"The Ink Room",text:"Mixed to spec — color matched before a single shirt runs."},
  {img:"assets/img/press-color.jpg",label:"The Press",kicker:"See Today's Production",
   title:"Press Run",text:"Garments staged and cycling through the production line."},
  {img:"assets/img/ordering.jpg",label:"Online Stores",kicker:"Merchandising Systems",
   title:"Online Ordering",text:"Custom branded stores — teams order exactly what they need."},
  {img:"assets/img/refinement.jpg",label:"File Refinement",kicker:"Behind The Build",
   title:"File Refinement",text:"Artwork rebuilt and optimized for flawless printing."},
];
const LAYERS = {
  production:{title:"Inside Apparel Production",kicker:"Operational Layer — Production",
    head:"Step Onto The Production Floor",
    lead:"A fully equipped facility where craftsmanship and technology work hand in hand. Here is how an order moves through Nuclear.",
    cards:[
      ["01","Mockups & Approvals","Concepts visualized on garment before a single print runs — sign-off baked into the workflow."],
      ["02","Screen Printing","Soft-hand prints produced with advanced equipment and skilled craftsmanship for sharp, lasting detail."],
      ["03","Embroidery","Precision stitching on caps, uniforms, and premium apparel — the detail demanded by top brands."],
      ["04","Direct to Film","Full-color, detail-heavy output with versatility across every garment type."],
      ["05","Quality Check","Every piece reviewed against a retail standard before it leaves the floor."],
      ["06","On-Time Delivery","Organized workflows keep every order moving — completed on time, every time."]]},
  merch:{title:"Explore A Real System",kicker:"Operational Layer — Merchandising",
    head:"Apparel Ordering, Built As Infrastructure",
    lead:"Managing apparel doesn't have to be a hassle. Nuclear builds the operational systems that keep ordering organized, repeatable, and on-brand.",
    cards:[
      ["A","Custom Branded Store","Built specifically for you — your branding, approved designs, a curated product lineup."],
      ["B","Simple Team Ordering","Employees order through a custom link. No spreadsheets, no back-and-forth."],
      ["C","Consistent & On-Brand","Approved designs only — every order stays consistent with your identity."],
      ["D","Setup to Fulfillment","Outfit a team, run a program, sell merch — handled end to end."],
      ["E","Scalable Infrastructure","Organized, repeatable processes that grow with your business."],
      ["F","Real Partnership","Ongoing support — not order-taking. We stay in it with you."]]},

  /* per-method layers (Apparel Production page) */
  screen:{title:"Inside Screen Printing",kicker:"Production Method — 01",
    head:"Screen Printing",
    lead:"The foundation of modern apparel production. Built for retail-quality merchandise, team apparel, uniforms, and large-scale orders.",
    cards:[
      ["01","Why It's The Standard","Industry-standard durability and visual impact for organizations that want apparel that lasts."],
      ["02","Soft-Hand Finish","Modern inks and pull technique deliver a soft, retail-grade hand — not the heavy plastisol slab."],
      ["03","Color Accuracy","Inks mixed to spec and color-matched before a single shirt runs the line."],
      ["04","Scales Cleanly","Built for runs of 50 or 5,000 without losing detail, registration, or consistency."],
      ["05","Garment Range","Tees, hoodies, sweats, performance wear — print built for the substrate, not against it."],
      ["06","Best For","Team apparel, retail merch, uniforms, fundraisers, large orders, and event drops."]]},

  embroidery:{title:"Inside Embroidery",kicker:"Production Method — 02",
    head:"Embroidery",
    lead:"The premium standard for polished, professional apparel — texture, durability, and elevated presentation in one move.",
    cards:[
      ["01","Why Embroidery","Adds dimension and longevity that printed graphics can't match — the signal of a serious brand."],
      ["02","Caps & Headwear","Sharp stitch detail on structured, unstructured, trucker, and 5-panel — produced consistently across orders."],
      ["03","Corporate Uniforms","Polished, repeatable identity for staff, hospitality teams, and front-of-house programs."],
      ["04","Premium Apparel","Outerwear, polos, woven shirts — the garment categories where embroidery elevates instantly."],
      ["05","Digitizing","Logos digitized for clean stitch translation — not the auto-convert your average shop ships."],
      ["06","Best For","Uniforms, hospitality, branded outerwear, retail merch, and anywhere print would feel under-dressed."]]},

  dtf:{title:"Inside Direct-to-Film",kicker:"Production Method — 03",
    head:"Direct-to-Film (DTF)",
    lead:"Built for versatility. Detailed artwork, full-color graphics, smaller runs, and fast-turnaround projects without compromising the finish.",
    cards:[
      ["01","Full-Color Detail","Photo-grade and gradient-heavy artwork that screens can't economically reproduce."],
      ["02","Small Runs","Built for the 12–48 piece order — no setup cost penalty, no minimums fight."],
      ["03","Fast Turnaround","Compressed timelines for events, last-minute drops, and one-off campaigns."],
      ["04","Garment Flexibility","Works clean across cotton, poly, blends, performance wear, and tricky substrates."],
      ["05","Layered + Special FX","Multi-color art and specialty effects without rebuilding screens for each variant."],
      ["06","Best For","Events, drops, prototyping, name/number programs, complex artwork, and tight timelines."]]},

  "merch-systems":{title:"Inside Apparel Systems",kicker:"Operational Infrastructure",
    head:"Apparel Systems, End To End",
    lead:"The full operational picture — how Nuclear connects design, ordering, production, fulfillment, and distribution into one centralized apparel system.",
    cards:[
      ["A","Design + Curation","Graphics built for the garment. Assortments chosen around audience, use case, and presentation."],
      ["B","Pop-Up + Campaign Stores","Limited-run stores for launches, fundraisers, seasonal drops, and event-driven merchandise."],
      ["C","Always-On Stores","Foundational ordering systems for ongoing apparel needs — public and private environments."],
      ["D","Fulfillment + Inventory","Packing, shipping, distribution, and stocked inventory support for programs that move."],
      ["E","Centralized Access","Approved products, branding, and merchandise organized for repeat ordering year-round."],
      ["F","Real Partnership","Ongoing operational support — not order-taking. We stay in it with you as the program grows."]]}
};

/* ---------- SHELL MARKUP ---------- */
const yr=new Date().getFullYear();
document.body.insertAdjacentHTML("afterbegin",`
<div class="scroll-prog" id="scrollProg"></div>
<nav class="nav" id="nav">
  <a class="brand" href="index.html" aria-label="Nuclear Printing home">
    <img src="assets/logo-mark-green.png" alt="Nuclear Printing" />
    <span><span class="bt">Nuclear Printing</span>
    <span class="bs">Apparel Production · Merchandising Systems</span></span>
  </a>
  <div class="nav-links">${navLinks}</div>
  <button class="btn btn-green nav-cta" data-quote>Get a Quote</button>
  <button class="burger" id="burger" aria-label="Menu"><span></span><span></span><span></span></button>
</nav>
<div class="mnav" id="mnav">
  <button class="mclose" id="mclose" aria-label="Close">&times;</button>
  ${navLinks}
  <a href="#" data-quote style="color:var(--green)">Get a Quote</a>
</div>`);

document.body.insertAdjacentHTML("beforeend",`
<section class="lets-start" id="quote">
  <div class="ls-bg"><img src="assets/img/squeegee-bw.jpg" alt="Nuclear Printing production floor"/></div>
  <div class="wrap ls-inner reveal">
    <div class="ls-mark"><img src="assets/logo-symbol.png" alt="Nuclear Printing"/></div>
    <h2>Let's Get Started</h2>
    <p class="ls-tag">When it matters how your team shows up, <b>we make sure they stand out.</b></p>
    <p class="ls-p">We deliver apparel that helps your team appear as professional as they perform. From fresh artwork and updated uniforms to full-scale merch programs, we bring clarity, speed, and quality to every order.</p>
    <p class="ls-q">Ready to elevate your team's look?</p>
    <button class="btn-start" data-quote>Start Your Order</button>
    <div class="ls-icons">
      <a href="https://instagram.com/nuclearprinting" target="_blank" rel="noopener" aria-label="Instagram">
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="5" width="22" height="22" rx="6"/><circle cx="16" cy="16" r="5"/><circle cx="22.5" cy="9.5" r="1.2" fill="currentColor"/></svg>
      </a>
      <a href="https://nuclearprinting.com" target="_blank" rel="noopener" aria-label="Website">
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2"><circle cx="16" cy="16" r="11"/><path d="M5 16h22M16 5c4 4 4 18 0 22M16 5c-4 4-4 18 0 22"/></svg>
      </a>
      <a href="mailto:Joe@nuclearprinting.com" aria-label="Email">
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="8" width="24" height="16" rx="2"/><path d="M4 10l12 9 12-9"/></svg>
      </a>
    </div>
    <div class="ls-meta">
      <span>Nuclear Printing</span>
      <span>2333 St. Clair Ave NE, Cleveland, Ohio 44114</span>
      <span><a href="tel:+12162238050">(216) 223-8050</a></span>
    </div>
    <div class="ls-bot">
      <a href="apparel-production.html">Apparel Production</a>
      <a href="merchandising-systems.html">Merchandising Systems</a>
      <a href="faq.html">Resources</a>
      <a href="blog.html">Blog</a>
      <span class="ls-copy">© ${yr} Nuclear Printing</span>
    </div>
  </div>
</section>
<div class="float-btn idle" id="floatBtn" role="button" tabindex="0" aria-label="Contextual action">
  <div class="fb-orb"></div><div class="fb-text" id="fbText">Get a Quote</div>
</div>
<div class="layer-scrim" id="layerScrim"></div>
<div class="layer" id="layer" role="dialog" aria-modal="true" aria-label="Interactive layer">
  <div class="layer-bar">
    <div class="lb-t"><span class="lb-dot"></span><span class="lb-title" id="layerTitle">Interactive Layer</span></div>
    <button class="layer-close" id="layerClose" aria-label="Close layer">&times;</button>
  </div>
  <div class="layer-body" id="layerBody"></div>
</div>
<div class="quote-scrim" id="quoteScrim"></div>
<div class="quote-modal" id="quoteModal" role="dialog" aria-modal="true" aria-label="Get a quote">
  <div class="qm-bar">
    <div class="qm-t"><span class="qm-dot"></span><span class="qm-title">Start Your Order — Nuclear Printing</span></div>
    <button class="qm-close" id="qmClose" aria-label="Close">&times;</button>
  </div>
  <div class="qm-body">
    <iframe
      src="https://api.leadconnectorhq.com/widget/form/16ntRlFvNC5ZfJGQzJtN"
      id="inline-16ntRlFvNC5ZfJGQzJtN"
      title="Quote Form 1"
      data-layout='{"id":"INLINE"}'
      data-trigger-type="alwaysShow"
      data-trigger-value=""
      data-activation-type="alwaysActivated"
      data-activation-value=""
      data-deactivation-type="neverDeactivate"
      data-deactivation-value=""
      data-form-name="Quote Form 1"
      data-height="2048"
      data-layout-iframe-id="inline-16ntRlFvNC5ZfJGQzJtN"
      data-form-id="16ntRlFvNC5ZfJGQzJtN"
      loading="lazy"
      style="width:100%;border:0;display:block;background:#ffffff"></iframe>
  </div>
</div>
<div class="story-viewer" id="storyViewer">
  <button class="sv-close" id="svClose" aria-label="Close">&times;</button>
  <div class="sv-frame">
    <div class="sv-bars" id="svBars"></div>
    <img id="svImg" alt="" />
    <div class="sv-cap"><div class="eyebrow" id="svKicker"></div>
      <h3 id="svTitle"></h3><p id="svText"></p></div>
    <div class="sv-nav prev" id="svPrev"></div>
    <div class="sv-nav next" id="svNext"></div>
  </div>
</div>`);

/* ---------- CLICK SOUND (custom upload) ---------- */
let clickAudio;
function pshh(){
  try{
    if(!clickAudio){clickAudio=new Audio("assets/click-sound.mp3?v=2");clickAudio.volume=0.7;}
    clickAudio.currentTime=0;
    clickAudio.play().catch(()=>{});
  }catch(e){}
}

/* ---------- NAV BEHAVIOR ---------- */
const nav=$("#nav");
const onScroll=[];
addEventListener("scroll",()=>onScroll.forEach(f=>f()),{passive:true});
onScroll.push(()=>nav.classList.toggle("scrolled",scrollY>40));
$("#burger").onclick=()=>$("#mnav").classList.add("on");
$("#mclose").onclick=()=>$("#mnav").classList.remove("on");
$$("#mnav a").forEach(a=>a.addEventListener("click",()=>$("#mnav").classList.remove("on")));

/* ---------- SCROLL PROGRESS ---------- */
const prog=$("#scrollProg");
onScroll.push(()=>{
  const h=document.documentElement;
  const p=h.scrollTop/((h.scrollHeight-h.clientHeight)||1);
  prog.style.width=(p*100).toFixed(2)+"%";
  // pulse-intensity on float button — scales with scroll depth on pages with a layer context
  const fb=document.getElementById("floatBtn");
  if(fb&&fb.classList.contains("charged")){
    fb.style.setProperty("--pulse",(0.25+p*1.6).toFixed(2));
  }
});

/* ---------- REVEAL ON SCROLL ---------- */
const revObs=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add("in");revObs.unobserve(e.target);}
}),{threshold:.12,rootMargin:"0px 0px -8% 0px"});
function bindReveals(root=document){
  $$(".reveal,.reveal-l,.reveal-r",root).forEach((el,i)=>{
    // stagger siblings sharing a parent
    if(el.dataset.stagger==null){
      const sibs=[...el.parentElement.children].filter(c=>c.classList.contains("reveal")||c.classList.contains("reveal-l")||c.classList.contains("reveal-r"));
      const idx=sibs.indexOf(el);
      if(sibs.length>1&&idx>0) el.style.transitionDelay=Math.min(idx,6)*80+"ms";
      el.dataset.stagger="1";
    }
    revObs.observe(el);
  });
}
bindReveals();

/* ---------- HERO STITCH (radiation mark draws itself on scroll) ---------- */
const stitch=$(".hero-stitch");
if(stitch){
  const paths=$$("path,circle",stitch);
  paths.forEach(p=>{
    if(p.getAttribute("stroke-dasharray"))return; // outer dashed ring keeps its pattern
    const len=p.getTotalLength?p.getTotalLength():120;
    p.style.strokeDasharray=len;
    p.style.strokeDashoffset=len;
    p.dataset.len=len;
  });
  const hero=stitch.closest(".hero,.page-hero");
  function tickStitch(){
    if(!hero)return;
    const r=hero.getBoundingClientRect();
    const total=r.height+innerHeight*.4;
    const passed=Math.max(0,Math.min(1,(innerHeight-r.top)/total));
    paths.forEach(p=>{
      if(!p.dataset.len)return;
      const len=parseFloat(p.dataset.len);
      p.style.strokeDashoffset=(len*(1-passed)).toFixed(1);
    });
    stitch.style.opacity=(.18+passed*.62).toFixed(2);
    stitch.style.transform=`rotate(${(passed*38).toFixed(1)}deg) scale(${(1+passed*.08).toFixed(3)})`;
  }
  onScroll.push(tickStitch);tickStitch();
}

/* ---------- PARALLAX ---------- */
const plx=$$("[data-parallax]");
function runParallax(){
  const vh=innerHeight;
  plx.forEach(el=>{
    const r=el.getBoundingClientRect();
    if(r.bottom<-200||r.top>vh+200)return;
    const speed=parseFloat(el.dataset.parallax)||0.12;
    const mid=r.top+r.height/2-vh/2;
    el.style.transform=`translate3d(0,${(-mid*speed).toFixed(1)}px,0)`;
  });
}
if(plx.length){onScroll.push(runParallax);addEventListener("resize",runParallax);runParallax();}

/* ---------- COUNT-UP ---------- */
const cuObs=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;
  const el=e.target,to=parseFloat(el.dataset.count),suf=el.dataset.suffix||"";
  const dur=1100,t0=performance.now();
  (function tick(now){
    const p=Math.min((now-t0)/dur,1),ev=1-Math.pow(1-p,3);
    el.textContent=Math.round(to*ev)+suf;
    if(p<1)requestAnimationFrame(tick);
  })(t0);
  cuObs.unobserve(el);
}),{threshold:.6});
$$("[data-count]").forEach(el=>cuObs.observe(el));

/* ---------- STORIES (home only) ---------- */
const railEl=$("#stories");
if(railEl){
  STORIES.forEach((s,i)=>{
    const el=document.createElement("div");
    el.className="story"+(i<3?" live":"");
    el.innerHTML=`<div class="story-ring"><img src="${s.img}" alt="${s.label}"/></div>
      <div class="story-label">${s.label}</div>`;
    el.onclick=()=>openStory(i);
    railEl.appendChild(el);
  });
}
let svIdx=0,svTimer=null;
const sv=$("#storyViewer");
function openStory(i){svIdx=i;document.body.classList.add("layer-open");
  sv.classList.add("on");renderStory();}
function renderStory(){
  const s=STORIES[svIdx];
  $("#svImg").src=s.img;$("#svKicker").textContent=s.kicker;
  $("#svTitle").textContent=s.title;$("#svText").textContent=s.text;
  $("#svBars").innerHTML=STORIES.map((_,j)=>`<i class="${j<=svIdx?'done':''}"></i>`).join("");
  clearTimeout(svTimer);
  svTimer=setTimeout(()=>{svIdx<STORIES.length-1?(svIdx++,renderStory()):closeStory();},4200);
}
function closeStory(){sv.classList.remove("on");clearTimeout(svTimer);
  if(!layer.classList.contains("on"))document.body.classList.remove("layer-open");}
$("#svClose").onclick=closeStory;
$("#svNext").onclick=()=>{svIdx<STORIES.length-1?(svIdx++,renderStory()):closeStory();};
$("#svPrev").onclick=()=>{if(svIdx>0){svIdx--;renderStory();}};
sv.addEventListener("click",e=>{if(e.target===sv)closeStory();});

/* ---------- FLOATING BUTTON — contextual state machine ---------- */
const fb=$("#floatBtn"),fbText=$("#fbText");
let currentLayer=null,currentHref=null;
const secObs=new IntersectionObserver(es=>{
  es.forEach(e=>{
    if(e.isIntersecting&&e.intersectionRatio>.4){
      const t=e.target;
      currentLayer=t.dataset.layer||null;
      currentHref=t.dataset.href||null;
      const cta=t.dataset.cta||"Get a Quote";
      if(fbText.textContent!==cta){
        animate(fb,{opacity:[1,.35,1]},{duration:.45});
        setTimeout(()=>{fbText.textContent=cta;},150);
      }
      fb.classList.toggle("deep",!!t.dataset.deep||!!currentLayer);
      fb.classList.toggle("charged",!!currentLayer);
    }
  });
},{threshold:[.4]});
$$("[data-section]").forEach(s=>secObs.observe(s));

/* magnetic hover — soft inertia */
let fbx=0,fby=0,tx=0,ty=0,hovering=false;
fb.addEventListener("mousemove",e=>{
  const r=fb.getBoundingClientRect();
  tx=(e.clientX-(r.left+r.width/2))*.3;
  ty=(e.clientY-(r.top+r.height/2))*.3;
});
fb.addEventListener("mouseenter",()=>hovering=true);
fb.addEventListener("mouseleave",()=>{hovering=false;tx=0;ty=0;});
(function inertia(){
  fbx+=(tx-fbx)*.13;fby+=((ty-(hovering?3:0))-fby)*.13;
  fb.style.setProperty("--fbx",fbx.toFixed(2)+"px");
  fb.style.setProperty("--fby",fby.toFixed(2)+"px");
  if(!fb.classList.contains("shake"))
    fb.style.transform=`translate(${fbx.toFixed(2)}px,${fby.toFixed(2)}px)`;
  requestAnimationFrame(inertia);
})();
function fbAction(){
  if(currentHref){pshh();location.href=currentHref;return;}
  pshh();fb.classList.remove("idle");fb.classList.add("shake");
  setTimeout(()=>fb.classList.remove("shake"),400);
  currentLayer?openLayer(currentLayer):goQuote();
}
fb.addEventListener("click",fbAction);
fb.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();fbAction();}});

/* ---------- INTERACTIVE LAYER ---------- */
const layer=$("#layer"),scrim=$("#layerScrim");
function openLayer(key){
  const L=LAYERS[key];if(!L)return goQuote();
  pshh();
  $("#layerTitle").textContent=L.title;
  $("#layerBody").innerHTML=`
    <div class="eyebrow">${L.kicker}</div>
    <h2>${L.head}</h2>
    <p class="lead">${L.lead}</p>
    <div class="layer-cards">${L.cards.map(c=>`
      <div class="layer-card"><div class="lc-ix">${c[0]}</div>
        <h3>${c[1]}</h3><p>${c[2]}</p></div>`).join("")}</div>
    <div class="layer-foot">
      <button class="btn btn-green" data-quote>Get a Quote</button>
      <span class="layer-note">You haven't left the page — the environment is still behind you.</span>
    </div>`;
  document.body.classList.add("layer-open");
  scrim.classList.add("on");layer.classList.add("on");
}
function closeLayer(){
  scrim.classList.remove("on");layer.classList.remove("on");
  if(!sv.classList.contains("on"))document.body.classList.remove("layer-open");
}
$("#layerClose").onclick=closeLayer;
scrim.onclick=closeLayer;
addEventListener("keydown",e=>{if(e.key==="Escape"){closeLayer();closeStory();closeQuote();$("#mnav").classList.remove("on");}});

/* ---------- QUOTE MODAL (GHL form lightbox) ---------- */
function goQuote(){
  const qm=$("#quoteModal"),qms=$("#quoteScrim");
  if(!qm||!qms){console.warn("Quote modal not in DOM");return;}
  closeLayer();
  pshh();
  document.body.classList.add("layer-open");
  qms.classList.add("on");qm.classList.add("on");
  if(!window.__ghlFormLoaded){
    const s=document.createElement("script");
    s.src="https://link.msgsndr.com/js/form_embed.js";
    s.async=true;document.body.appendChild(s);
    window.__ghlFormLoaded=true;
  }
}
function closeQuote(){
  const qm=$("#quoteModal"),qms=$("#quoteScrim");
  if(!qm||!qms)return;
  qms.classList.remove("on");qm.classList.remove("on");
  if(!sv.classList.contains("on")&&!layer.classList.contains("on"))
    document.body.classList.remove("layer-open");
}
const _qmClose=$("#qmClose"),_qms=$("#quoteScrim");
if(_qmClose) _qmClose.onclick=closeQuote;
if(_qms) _qms.onclick=closeQuote;

/* ---------- FAQ ACCORDION ---------- */
$$(".faq-q").forEach(q=>q.addEventListener("click",()=>{
  const f=q.closest(".faq"),a=$(".faq-a",f),open=f.classList.contains("open");
  $$(".faq.open").forEach(o=>{o.classList.remove("open");$(".faq-a",o).style.maxHeight="0";});
  if(!open){f.classList.add("open");a.style.maxHeight=a.scrollHeight+"px";}
}));

/* ---------- DELEGATED CLICKS ---------- */
document.addEventListener("click",e=>{
  const q=e.target.closest("[data-quote]");
  if(q){e.preventDefault();goQuote();return;}
  const l=e.target.closest("[data-open-layer]");
  if(l){e.preventDefault();openLayer(l.dataset.openLayer);return;}
  // every other button / interactive control gets the same click sound — except close (×) buttons
  if(e.target.closest("button,.btn,.story,.story-ring") && !e.target.closest(".mclose,.layer-close,.qm-close,.sv-close")) pshh();
});

/* expose for inline use if needed */
window.NUCLEAR={openLayer,openStory,goQuote};
