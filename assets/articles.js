/* ------------------------------------------------------------------
   NUCLEAR PRINTING — ARTICLE STORE (single source of truth for the blog)
   The blog page reads from this file. The blog SEO engine (nuclear-blog-engine)
   OVERWRITES this file on each publish run — keep the shape stable:

     { slug, tag, title, dek, read, date, hero, body:[ ...HTML strings ] }

   body is an array of HTML block strings (already humanized + brand-audited
   by the pipeline). Order = render order. No <script>, no inline styles.
   ------------------------------------------------------------------ */
export const ARTICLES = [
  {
    slug: "soft-hand-vs-standard",
    tag: "Featured · Production",
    title: "Soft-Hand vs. Standard Prints — What Your Brand Actually Needs",
    dek: "Not every print should feel the same. Where soft-hand wins, when a standard print is the smarter call, and how the finish shapes how your brand is read.",
    read: "2 min",
    date: "2026-07-09",
    hero: "assets/img/screenprint.jpg",
    body: [
      "<p>Two shirts can carry the same logo and still feel like they came from different companies. The difference usually isn't the art. It's the hand — how the print sits on the fabric when someone actually wears it.</p>",
      "<h3>What soft-hand really means</h3>",
      "<p>Soft-hand printing lays ink so it moves with the garment instead of sitting on top of it. You feel the cotton first and the graphic second. For retail pieces, fashion drops, and anything a team wants to wear off the clock, that finish is what makes apparel feel bought, not branded.</p>",
      "<h3>When standard is the right call</h3>",
      "<p>A standard print puts down a heavier, more opaque ink film. On workwear, safety apparel, and high-contrast designs on dark garments, that opacity is the point — the graphic has to read across a parking lot, not a runway. Choosing standard there isn't a downgrade. It's matching the method to the job.</p>",
      "<h3>How the finish shapes perception</h3>",
      "<p>People decide how they feel about apparel in the first second they touch it. A soft, broken-in hand signals quality without a word. A stiff plasticky patch signals the opposite, no matter how clean the art is. The finish is doing brand work whether you chose it on purpose or not.</p>",
      "<p>The right move is deciding that on purpose — garment, ink, and method picked around how the piece will be worn and who's judging it.</p>"
    ]
  },
  {
    slug: "online-ordering-system",
    tag: "Merch Systems",
    title: "Why Company Apparel Belongs On An Online Ordering System",
    dek: "Spreadsheets and group texts don't scale. How a branded ordering link removes the back-and-forth.",
    read: "2 min",
    date: "2026-07-08",
    hero: "assets/img/ink.jpg",
    body: [
      "<p>Most apparel headaches aren't printing problems. They're coordination problems. Sizes in a group text, a spreadsheet three versions deep, someone who never sent their order — that's where programs stall.</p>",
      "<h3>The system does the chasing</h3>",
      "<p>An online ordering store turns all of that into one link. Everyone picks from approved products, in their own size, on their own time. No collecting, no re-counting, no version control.</p>",
      "<h3>On-brand by default</h3>",
      "<p>Because the store only carries approved designs and products, every order stays consistent with the brand. There's no off-menu request quietly breaking the look. Consistency stops being something you police and starts being how the system works.</p>",
      "<p>For any team ordering apparel more than once, the store isn't a convenience. It's the difference between a program and a scramble.</p>"
    ]
  },
  {
    slug: "production-ready-artwork",
    tag: "File Setup",
    title: "Production-Ready Artwork: The Gap Between Canva And The Press",
    dek: "Why a file that looks perfect on screen can still fall apart on a garment — and how to close the gap.",
    read: "2 min",
    date: "2026-07-07",
    hero: "assets/img/squeegee-bw.jpg",
    body: [
      "<p>A design can look flawless on a laptop and still cause problems on the floor. Screens are backlit and forgiving. A garment is neither.</p>",
      "<h3>Where files break down</h3>",
      "<p>Low resolution, RGB color that shifts in print, thin lines that vanish at size, and no separations are the usual suspects. None of them show up on screen. All of them show up on a shirt.</p>",
      "<h3>What production-ready looks like</h3>",
      "<p>Vector where possible, high-resolution raster where not, real print dimensions, and color chosen for ink rather than light. Getting the file right before the press is running is the cheapest quality control there is.</p>",
      "<p>You don't have to hand over a perfect file. Part of production is refining artwork so it holds up — but knowing the gap exists is what keeps a good design from becoming a reprint.</p>"
    ]
  },
  {
    slug: "embroidery-primer",
    tag: "Embroidery",
    title: "Caps, Uniforms & Stitch Count: A Quick Embroidery Primer",
    dek: "What actually drives embroidery quality and cost — and where the detail really matters.",
    read: "2 min",
    date: "2026-07-06",
    hero: "assets/img/embroidery.jpg",
    body: [
      "<p>Embroidery gets judged up close. That's the whole appeal, and it's also why the details behind it matter more than people expect.</p>",
      "<h3>Digitizing comes first</h3>",
      "<p>Before anything sews, a logo is translated into a stitch file. Good digitizing decides how clean the letters read, how flat the fill lies, and how consistently the same logo reproduces across a hat, a polo, and a jacket.</p>",
      "<h3>Stitch count and cost</h3>",
      "<p>More detail means more stitches, and stitch count drives both time and price. The skill is keeping the detail that carries the brand and cutting the detail no one will ever see at arm's length.</p>",
      "<p>On caps, uniforms, and outerwear, embroidery is often what makes apparel look considered rather than decorated. It earns that when the setup underneath it is right.</p>"
    ]
  },
  {
    slug: "completed-on-time",
    tag: "Production Culture",
    title: "What “Completed On Time” Really Takes Behind The Scenes",
    dek: "On-time isn't luck. A look at the organized, standardized workflows that keep orders moving.",
    read: "2 min",
    date: "2026-07-05",
    hero: "assets/img/ink.jpg",
    body: [
      "<p>On-time delivery looks simple from the outside. It's actually the visible result of a lot of unglamorous structure.</p>",
      "<h3>A process, not a sprint</h3>",
      "<p>Every order follows the same path — mockups, approvals, production, quality control, fulfillment. When the path is standardized, nothing has to be reinvented per job, and nothing quietly falls through.</p>",
      "<h3>Communication is part of production</h3>",
      "<p>Deadlines hold when status is clear and approvals don't sit waiting. A human telling you where your order is, on time, is a production feature — not a courtesy.</p>",
      "<p>“On time” isn't a promise. It's what a disciplined workflow produces on repeat.</p>"
    ]
  },
  {
    slug: "identity-not-logo",
    tag: "Brand",
    title: "A True Identity, Not Just A Logo",
    dek: "What full brand development covers — and why strong brands start with a discovery call.",
    read: "2 min",
    date: "2026-07-04",
    hero: "assets/img/screenprint.jpg",
    body: [
      "<p>A logo is one asset. An identity is the whole system that decides how a brand shows up everywhere it appears — including on apparel.</p>",
      "<h3>Beyond the mark</h3>",
      "<p>Color, type, voice, and how those hold together across a shirt, a hat, a store, and a storefront. When the system is real, every piece reinforces the same impression instead of competing with it.</p>",
      "<h3>Why it starts with a conversation</h3>",
      "<p>Strong identity work starts with discovery, not design — understanding the audience, the use, and what the brand is actually trying to signal before anything gets drawn.</p>",
      "<p>Apparel is where a lot of brands get seen most. It's worth having an identity behind it, not just a file.</p>"
    ]
  },
  {
    slug: "partner-not-vendor",
    tag: "Industry",
    title: "Choosing A Cleveland Apparel Partner — Not Just A Vendor",
    dek: "The difference between order-taking and a real production partnership, and why it shows.",
    read: "2 min",
    date: "2026-07-03",
    hero: "assets/img/squeegee-bw.jpg",
    body: [
      "<p>A vendor takes the order you give them. A partner helps you place a better one.</p>",
      "<h3>What order-taking misses</h3>",
      "<p>The wrong garment for the use, a print method that won't hold up, a file that needed one fix before the run — a vendor prints it anyway. A partner catches it before it costs you.</p>",
      "<h3>What partnership looks like</h3>",
      "<p>Ongoing support, honest input, and systems that stay in place between orders. It shows up as fewer reprints, more consistency, and apparel that keeps representing you the way you meant it to.</p>",
      "<p>For anything you'll order more than once, the relationship matters as much as the print.</p>"
    ]
  }
];
