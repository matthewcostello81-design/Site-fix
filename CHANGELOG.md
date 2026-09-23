# R36H Pro Protection Kit photo: banner and memory card removed

## Problem
The kit's only photo had "128GB · 20K GAMES" printed across the top and a
giant 128GB microSD card in front of the case, both baked into the image.

## Fix
media/r36h-kit-clean.png is the same photo rebuilt: the banner is cropped
off and the card is painted out. The hidden strip behind the card (the tray's
foam lip, the zipper rim and the floor reflection) is rebuilt from the pixels
beside it, matched row by row so there is no seam. Portrait 1000x1180 with wide margins: the cart
drawer thumbnail is taller than wide and cover-crops the sides, so a square
image lost the protectors. The wall and floor are extended above and below. Uploaded to the product as its only
image; the old photo is deleted.

## Applied to
Product r36h-max-kit (live, not theme dependent).

---

# Site speed: stop the background work that made phones crawl

## Problem
"I can barely load the site." Every page ships about 1 MB of inline CSS and JS
and ran 45 never-ending timers (about 57 wake-ups a second), 42 page watchers
(11 on the whole document) and several /cart.js polls every 2 to 4 seconds.

## Fixes (low risk, behaviour kept)
- nc-cartcount: removed two North Cove scripts (summer-sale % patch, bands
  thumb swaps, birchwood picker) that scanned every element and measured every
  image on EVERY change anywhere in the page. Cart badge refresh after a drawer
  change is batched (once per 1.5s burst instead of 120ms after each change).
- overlay-group: disabled nc-pdp3 (North Cove product page code, also ran on
  every scroll) and nc-navsale-first (pinned a North Cove summer-sale link,
  ran on every tap and every change). footer-group: disabled nc_chatfix (700ms
  loop that put a North Cove logo from northcovewellness.com in the chat).
- pg-cart-pills: shimmer sync wakes on inserted nodes and class changes only,
  at most 4 times a second (was every inline style write, up to 16 a second).
- pg-giftguard: /cart.js safety read every 10s (was 2s), skipped while hidden;
  every cart write already triggers an immediate check.
- pg-cart-offer and pg-chips: /cart.js backstop reads every 10s (were 4s and
  2.5s), skipped while hidden; they already read on every drawer change.
  pg-chips' page-wide observer batches to one stamp per frame.
- pg-home: hero image is responsive (750 to 2200px) and fetched first
  (fetchpriority high) instead of one fixed 2200px file.
- theme.liquid: the stock sticky add-to-cart is no longer rendered on pg-
  product templates, which hide it anyway.

## Applied to
Draft theme 164321034468.

---

# Spec tiles and childhood slogan on every console page

## Change
- Under the hood cards on the R36H, R36S Pro and Flip SP pages: each card leads
  with a big stat drawn from its own original title (Quad-Core, 3.5 Inch,
  2 Slots, 3000mAh / 3200mAh / 3300mAh, Your Games, Flip Open) over its
  original description, restored or kept verbatim. Smaller rounded icons.
  Mobile stat size is clamped so two-word stats fit a half-width card.
- "The games you remember. The feeling you forgot." closes the childhood panel
  on all three console pages (the orb page is left as is).
- R36H childhood lead cut to three short memories.

## Applied to
Draft theme 164320313572. Files: sections/pg-r36h-story.liquid,
sections/pg-pro2-story.liquid, sections/pg-flipsp-story.liquid

---

# R36H Pro: "Under the hood" cards as compact spec tiles

## Problem
The four feature cards ("Quick, Smooth and Made to Be Played.") read as a wall
of text on mobile: a 72px icon, a bold title and a two to four line paragraph
per card.

## Fix
Each card is now a spec tile: a smaller rounded icon, a big gradient stat
(4-Core, 3.5 in, 2 Slots, 5 Hrs) and one short line. The claims are the same
ones the cards already made. Mobile and desktop are sized in the same push.

## Applied to
Draft theme 164320313572. Files changed: sections/pg-r36h-story.liquid

---

# R36H Pro: cart colour picker flicker, and cart add-on links to the old theme

## Problems
1. After adding the R36H Pro to the cart, its colour dropdown in the drawer
   flickered and would not stay open.
2. Tapping the R36H Protection Kit or an R36H add-on (silicone case, hard shell
   case, screen protector) in the cart opened that item's own page, which uses
   the stock product template and looks like the old theme.

## Causes
1. `pg-r36h-cart` was cloned from `pg-pro2-cart`. The lookup for its own picker
   was renamed to `select[data-pg-rh]`, but the build still stamped
   `data-pg-p2`, so every pass (400ms tick plus every `#cart` mutation,
   including the ones the rebuild caused) tore the picker down and built a new
   one.
2. `layout/theme.liquid` already redirects the Flip SP and R36S Pro 2 kits to
   their consoles, but had no redirect for the R36H kit or add-ons. Those
   products have no template suffix, so they render `templates/product.json`.

## Fix
1. The picker is stamped with `data-pg-rh` when it is built, so it is built
   once per line.
2. Product pages for `r36h-max-kit`, `r36h-silicone-case`,
   `r36h-hard-shell-travel-case` and `r36h-screen-protector` now redirect to
   `/products/pocket-era-r36h`. Cart hrefs are unchanged, because the drawer
   scripts identify lines by them.

## Applied to
Draft theme 164320313572. Files changed: sections/pg-r36h-cart.liquid,
layout/theme.liquid

---

# Cart drawer: stop discount/progress flicker (safe override)

## Problem
In the cart drawer, the free-shipping / discount progress bar and status
messages visibly flickered and briefly showed the wrong discount before
settling, especially as line items or quantities changed.

## Cause
Two things compound in `nc-cro` (the large, checkout-adjacent CRO file):
- A redundant, **un-debounced** `MutationObserver(drawerExtras)` runs on every
  cart mutation, on top of the well-behaved debounced `cartObs` observer that
  already calls `drawerExtras` (disconnect/reconnect guarded). The two race and
  re-render the drawer extras repeatedly.
- The progress-bar fill and status text swap their values instantly, so each
  recompute reads as a hard "snap"/flash rather than a smooth change.

## Fix
Added a self-contained override block to `sections/nc-nohover.liquid`, which
loads after `nc-cro` so it wins cleanly. **No checkout or add-to-cart logic is
touched** — the fix is a guard flag plus CSS:

- **Pre-stamps `#cart[data-nc-extras]`** at parse time (with a short-lived
  `documentElement` observer fallback) so `nc-cro` skips creating its redundant
  observer. `drawerExtras` still runs via the debounced `cartObs`, so nothing is
  lost; if the stamp loses the race it is a harmless no-op.
- **Adds width/color/opacity transitions** to `.nc-track-fill` and the
  ship/discount/tier/gift status elements so value changes ease instead of
  snapping.

Because `nc-cro` is a live-theme file (177KB, not tracked in this repo) and the
storefront isn't previewable from here, the fix was scoped to the override layer
to eliminate any risk to the cart/checkout path. A deeper consolidation of the
competing observers should be done with live preview (Shopify CLI).

## Applied to
Files changed: sections/nc-nohover.liquid

---

# Site fix: product gallery arrow centering

## Problem
On the product page, the image carousel prev/next arrows (the round white
`‹` / `›` buttons) were not vertically centered on the product image. They sat
above the middle of the image.

## Cause
The Xtra theme's `screen.css` hardcodes the gallery arrow container height:

    .l4pr .swiper-button-nav { bottom: auto; width: 67px; height: 540px; }

The visible round button (`:after`) centers itself at `top: 50%` of that
container. Because the height is pinned to 540px rather than the real image
height, on tall/square product images (aspect-ratio 1/1) the arrows center on
540px and end up above the true middle.

## Fix
A small dedicated section (`sections/nc-gallery-fix.liquid`) lets the arrow
container span the actual gallery height, so `top: 50%` resolves to the real
center:

    @media only screen and (min-width:761px){
      #content .l4pr.aside-pager .swiper-button-nav{
        top:0!important; bottom:0!important; height:auto!important
      }
    }

Desktop/tablet only (min-width:761px). Mobile (<=760px) uses a separate
below-image arrow layout and is untouched.

The section is registered in `templates/product.json`, so it applies to every
product that uses the default product template.

## Applied to
Shopify draft theme `161868382436` ("NC Polish round 2 + reviews (Claude)")
on shop `v9fqfa-bd.myshopify.com` via the Admin API (themeFilesUpsert).

Files changed:
- sections/nc-gallery-fix.liquid (new)
- templates/product.json (registered the new section)

---

# Site fix: collection hero carousel — sync banner image, dots, and text

## Problem
On the collection hero (`nc-collection-hero`, e.g. Best Sellers), the rotating
banner image, the caption text, and the dots advanced on different clocks, so
they were visibly out of sync.

## Cause
Two independent timers:
- Banner image rotated every 4500ms (own `setInterval` in `nc-foot-fix.liquid`).
- Caption text rotated every 3500ms (`setInterval` in `nc-collection-hero.liquid`);
  the dots followed the caption via a MutationObserver.

4500ms vs 3500ms meant the image drifted against the text and dots.

## Fix (`sections/nc-foot-fix.liquid`)
Removed the banner image's independent 4500ms interval and instead advanced the
image layer inside the same observer that already syncs the dots to the caption.
Now the caption's single 3500ms timer is the one master clock: on each tick the
caption, the dots, and the banner image all change together.

Summer Sale is untouched: its banner uses `.nc-ed__img--full` and has no rotating
image layers (`:not(.nc-ed__img--full)`), so the sync code no-ops there.

## Applied to
Shopify draft theme 161830-... `161868382436` via Admin API (themeFilesUpsert).
Files changed: sections/nc-foot-fix.liquid

---

# Site fix: free-gift bar restyle to match the brand

## Problem
The "Free 5-Level Resistance Band Set / GIFT WITH ANY PURCHASE / INCLUDED FREE"
bar (`.nc-gift-home`, injected by `nc-cro.liquid`) used a mint-green gradient
(#F6FAF6 -> #B7D6C4) with a tan pill, clashing with the site's cream/sand + teal
brand palette.

## Fix (`sections/nc-nohover.liquid`, loads last globally)
Appended a scoped override:
- Bar background -> brand cream/sand gradient (#F7F1E3 -> #E6D6B4) with a subtle
  teal border and soft shadow, so it reads as an on-brand raised card.
- Eyebrow -> brand teal (#2C6E72); heading charcoal (#0F2A33); sub muted (#3C5860).
- "INCLUDED FREE" pill -> brand teal gradient (#2C6E72 -> #15414A) with white text
  (keeps the existing subtle shimmer animation).

Scoped with `#content .nc-gift-home` for specificity; nc-nohover loads after
nc-cro so it wins cleanly. No change to layout or responsive sizing.

## Applied to
Shopify draft theme 161868382436 via Admin API (themeFilesUpsert).
Files changed: sections/nc-nohover.liquid

---

# Homepage: free-gift promo in the hero + header

The gift promo is injected at runtime (not in theme files) and only appeared on
collection pages, so instead of moving that element, added two self-contained,
on-brand free-gift elements (in `sections/nc-nohover.liquid`, global, homepage-scoped
by selector):

- **Hero card** (`.nc-herogift`): a compact cream/teal card injected into the hero
  left column (`.nch-hero-text`), filling the empty space under the trust row.
  "Free 5-pack resistance bands / Added free to every order. No code needed." + FREE pill,
  links to /collections/best-sellers.
- **Header pill** (`.nc-hdr-gift`): a small teal pill in the empty space left of the
  logo (desktop only, min-width 1001px), "🎁 Free 5-pack resistance bands",
  links to /collections/best-sellers. Hidden on mobile.

Both are created via JS with retries + a MutationObserver so they appear reliably.
