# Black Friday: prices +5%, extra 15% off now through Nov 30, Shipping Protection $4.99

UPDATE 2026-11-04 03:57Z (owner: "we want black friday active now!"):
"Extra 5% off entire order" ended now; "Black Friday - Extra 15% off entire
order" started now (still ends 2026-12-01 00:00 CST, then "Extra 5% off your
order" resumes). Copy switch START moved to 1793764620000 (now). Verified with
draftOrderCalculate: R36S Pro Max $130.99 -> 15% off $19.64 -> $111.35.
The live theme still prints "extra 5% off" until the draft theme is published.

## Request
Owner, 2026-11-04: "raise the shipping protection to 4.99", then, after the
margin comparison, "add 5% in price but offer 15% auto applied at checkout".

## Prices (live, 2026-11-04)
- Shipping Protection: $3.99 -> $4.99. Shipping Policy page text updated
  ($2.99 -> $4.99). The Settings > Policies shipping policy still says $2.99:
  the app has no write_legal_policies scope, so the owner must edit it.
- Every ACTIVE product +5%, rounded to the nearest .99 (113 variants, 20
  products). Compare-at prices left as they were. Shipping Protection and the
  $0 protection kits unchanged. Drafts/archived untouched.
  14.99->15.99, 19.99->20.99, 24.99->25.99, 29.99->30.99, 34.99->36.99,
  69.99->72.99, 79.99->83.99, 109.99->114.99, 124.99->130.99,
  129.99->135.99, 134.99->141.99, 139.99->146.99, 169.99->177.99,
  174.99->183.99.
- DSers pricing rule mode is "none", so DSers will not overwrite them.
- Hoodie bundle discounts are fixed $ off ($9.99 / $14.98), so only their
  titles changed: "2 for $135.99", "3 for $203.99".
- Console duo discounts are fixed $ off each; unchanged (pairs move up 5%).

## Discounts (automatic, Central time)
- "Extra 5% off entire order" (1467483193572): now ends 2026-11-27 00:00.
- "Black Friday - Extra 15% off entire order" (1564344746212):
  2026-11-27 00:00 -> 2026-12-01 00:00. Combines with everything, like the 5%.
- "Extra 5% off your order" (1564344942820): from 2026-12-01 00:00, no end
  (Shopify needs a unique title, hence the new name).

## Theme copy ("extra 5% off" -> 15% during the sale)
Tiles, chips, the announcement bar ("Extra 5% off at checkout") and the cart
print the 5% as fixed text in many sections. sections/pg-bf-copy.liquid, added
to sections/header-group.json (footer group is at its 25-section limit),
rewrites "5% off" / "5% at checkout" / "Extra 5%" to 15% in page text, only
between 2026-11-27 06:00Z and 2026-12-01 06:00Z (client clock), including
text the tiles render later. Outside the window it does nothing.
Full-theme scan (586 files): every other "5%" is a comment or CSS. The cart
upsell scripts read the live rate from /cart.js, so they follow the 15%.
Product descriptions and pages: no "5%".
Checked in preview with the clock set to 2026-11-28 at 1400px and 390px: home,
2 collections, all consoles, orb, hoodie, a case: 15% shown, no 5% left.
Draft theme "Black Friday 15% copy (Claude 11-04)" (id 189924770020),
duplicated from the live "Cart photos float + bigger (Claude 11-03b)". Must be
PUBLISHED by the owner before Nov 27. Any theme published later instead needs
the same section + header-group entry.

## Margin (supplier cost + $1.99 shipping per supplier package + kits, 2.9% fees, before ads)
Blended: 51.2% now -> 53.4% until BF -> 48.2% on BF (vs 45.8% for 15% off
with no price rise). BF needs ~13% more sales to match today's profit.

# Cart: floating photos actually float, and are bigger

## Request
Owner, 2026-11-03, from a phone on the published "Cart photos on white" theme:
"Do the photos float? Can u make the cart image bigger look".

## What was wrong
- No float: the fl-*.png files are plain cut-outs with no shadow. The product
  page makes them float with CSS (pr.css: pr-lev2 bob and a radial shadow
  under the product). The cart had neither.
- Small: the product fills only part of each file (R36S Pro / Ultra / Ultra
  Max 44% wide x 70% tall, hoodie 52% x 70%, R36H Pro / Ultra 70% x 41%, X50
  80% x 54%, measured from the alpha channel), and it was shown at the file's
  full size.

## Fix (sections/pg-cart-zfix.liquid, inline CSS)
- Soft elliptical shadow under each floating shot and a gentle 4.6s bob,
  staggered per line, like the product page. Off for prefers-reduced-motion.
- Each family is enlarged to fill its box (up to 92% of the width, 80% of
  the height, shadow below), with no cropping.
- Box 120x140 (was 120x120) from 420px up, 86x120 (was 78x120) below.
- Result: R36S Pro 70x112 px (was 53x83), R36H Ultra 110 px wide (was 84),
  X50 110 px wide (was 96) on a 430px phone. Orbs and accessories still fill
  their box with their own photo, no shadow or bob.

## Where
Draft theme "Cart photos float + bigger (Claude 11-03b)" (id 189911072996),
duplicated from the live theme "Cart photos on white (Claude 11-03)", so
publishing it changes only this file. Checked in preview at 390, 430 and
1400px: text column unchanged on desktop, 8px narrower under 420px; bob and
shadow running on floating lines only.

---

# Cart: floating product photos on plain white

## Request
Owner, 2026-11-03: "make sure cart photos are the floating w in the white background".

## What was wrong
The cart lines already use the floating shots (every console, hoodie and X50
variant image is a transparent fl-*.png). They sat on a lavender tile (#F5F3F9)
from pr.css (`html body.pr-page aside#cart#cart#cart#cart ul.l4ca picture`,
`background: var(--pr-panel) !important`). On a phone the thumbnail box is
78x120 with object-fit:cover, which also cut the sides off the wide consoles
(R36H Pro / R36H Ultra).

## Fix (sections/pg-cart-zfix.liquid, inline CSS)
- Cart line picture/figure background -> #fff (five ids beat pr.css's four).
- Floating shots only (`img[src*="/files/fl-"]`) -> object-fit:contain, so the
  whole device shows. Desktop (120x120 square) looks the same apart from the
  white. Orbs and accessories keep cover.

## Not changed
Orbs, cases, screen protectors and protection kits have no floating shot, so
their cart photo is still their dark scene image. They need new transparent
product shots to match.

## Where
Theme "Cart photos on white (Claude 11-03)" (id 189909893348, published by the owner 2026-11-03), duplicated
from the live theme "Pack prices Oct 31 (Claude 10-31a)" on 2026-11-03, so
publishing it changes only this file. Publishing is the owner's step (the API
blocks theme publish). Verified in preview at 1400px and iPhone 13: line
pictures white, floating shots uncropped.

---

# Discounts: every product's deal applies, even with other deals in the cart

## Request
Owner, 2026-10-10: "if they order 2 different products with 2 different deals
they should get both." Replaces the "no stacking" entry below.

## Change (admin only)
combinesWith.productDiscounts = true on all 22 automatic product deals (every
console Duo Pack / Duo Max, DBZ lamp packs, Gastly, Clutch Buds, Clutch Pro,
orb / wall art / power ball / buds BxGy) and on code 1NWTGWAGYCJB (back to its
original setting). Order and shipping combining unchanged, so the Extra 5%
still applies on top.

Shopify still gives each line only its single best product deal, so deals on
the same product do not double up.

## Verified (draftOrderCalculate)
Mini Duo + Pro Duo: 32.49 x2 + 74.99 x2. Flip Duo + Mini Duo Max: 119.99 x2 +
57.49 x2. R36S Ultra Duo + R36H Ultra Duo Max: 102.99 x2 + 144.99 x2. Pro
singles + Pro Max: 74.99 x2 + 94.99 x2. 3 DBZ lamps 34.99 each. Clutch Buds
2 = 89.98, 3 = 99.98. Gastly 2 = 89.98 with Clutch Pro 2 = 149.99.

---

# Discounts: no product deal stacks with another product deal

## Request
Owner, 2026-10-10: "none of the products should combine deals w other products."
This reverses the earlier change that let the Mini duo discounts combine.

## Change (admin only, no theme files)
combinesWith.productDiscounts set to false on every product deal that had it on:
- Mini - Duo Pack Savings, Mini - Duo Max Savings (reverted)
- R36S Pro - Duo Pack Savings, R36S Pro - Duo Max Savings
- DBZ Lamp - 2 Pack $77.98, DBZ Lamp - 3 Pack $104.97
- PokeOrb - Buy 2 Get 1 Free, PokeOrb - Buy 5 Get 4 Free
- Wall Art - Buy 2 Get 1 Free, Power Ball - Buy 2 Get 1 Free
- code 1NWTGWAGYCJB (single-use 10%, unused)
The other duo deals (Flip SP, R36H Pro, R36S Ultra, R36H Ultra, Gastly, Clutch
Buds, Clutch Pro) were already off. Order and shipping combining left on, so
the site-wide "Extra 5% off entire order" still applies on top of any one deal,
as every product page advertises.

Not changed: the "Upsell.com" app discount (managed by the Upsell.com app,
never used).

## Verified (draftOrderCalculate, automatic discounts on)
Each product's own deal is unchanged: Mini Duo Pack 32.49 x2, Mini Duo Max
57.49 x2, R36S Pro Duo Pack 74.99 x2, R36S Pro Duo Max 94.99 x2, DBZ 2 lamps
38.99 x2, 3 lamps 34.99 x3, Power Ball 3 for 79.98, Wall Art 3 for 69.98.
Cross-product carts now get one deal only: Mini duo + Pro duo -> Pro keeps
74.99, Mini back to 34.99. Pro singles + Pro Max in one cart -> Duo Max only.
The orb checks after the change were not run.

---

# Mini: steeper Save % on the Max and Duo Max (crossed-out price from the parts)

## Request
Owner, 2026-10-10: "the mini save% should increase ... in the max and duo max so
it incentivizes. Just make the cross out price higher or whatever based on those
individual components."

## Before
The Max Bundle's compare-at was $84.97 = console $44.99 + hard shell case
$19.99 + extra controller $19.99, so the ladder barely moved as you went up:
Single 22% / Duo Pack 27% / Max 29% / Duo Max 32%.

## Change
1. Admin (productVariantsBulkUpdate): the three Max Bundle variants' compare-at
   price is now $104.97 = console $44.99 + hard shell travel case $29.99 +
   extra wired controller & AV cable $29.99. $29.99 is the list price the
   store's own hard shell cases and the RetroBox Extra Controller already
   carry, so each component is valued the way it is sold on its own. Live now.
   Ladder: Single 22% / Duo Pack 27% / Max 42% / Duo Max 45%.
2. Theme (sections/pe-mini-bundles.liquid): the "what each piece sells for"
   cards under the Max section printed "$19.99 value" as fixed text. They are
   now rewritten from the variants, each extra = (Max compare-at minus Single
   compare-at) / 2, so they read $29.99 today and follow the admin if the
   compare-at changes again. Everything else that prints the crossed-out price
   (row pills, strikethroughs, the sticky bar, the cart's Sale Savings and You
   saved rows, the cart upsell cards) already reads the variant compare-at and
   needs nothing.

## Where
Draft theme "Mini value ladder 42/45% (Claude 10-10)" (id 188680110308). It was
checksum-compared against the live theme: identical on all 764 files except
templates/index.json, which was behind the live homepage (the Mini card's gloves
image); that file was synced from live before the edit, so publishing the draft
changes only the Mini value cards. Publishing is the owner's step (the API
blocks theme publish). Until it is published the live page still says "$19.99
value" on those two cards beside the new $104.97 strikethrough.

---

# Mini: Duo Pack / Duo Max saving dropped out of the cart next to another deal

## Problem
The Pocket Era Mini page prices the Duo Pack at $64.98 (two Singles, $2.50 off
each) and the Duo Max at $114.98 (two Max Bundles, $2.50 off each), and says the
saving is applied automatically in the cart. In the cart the two Mini lines came
back at full price ($34.99 / $59.99 each) whenever the cart also held any other
product-level automatic discount: an R36S Pro Duo Pack or Duo Max, or even the
Mini's own other duo (Duo Pack + Duo Max in one cart only discounted one of them).
Alone in the cart the Mini duo priced correctly, which is why it looked random.

## Cause
Not a theme bug. The two Shopify automatic discounts behind the Mini page,
"Mini - Duo Pack Savings" and "Mini - Duo Max Savings", were created with
"Combines with: Product discounts" switched OFF. Shopify only stacks two
product discounts when BOTH allow it; otherwise it keeps the single largest one.
The R36S Pro duo discounts have the switch ON, so the Pro always won and the
Mini pair lost its $5.00. Verified with the Admin API's draftOrderCalculate
(acceptAutomaticDiscounts: true) before and after.

## Fix
Admin change only (discountAutomaticBasicUpdate), no theme file touched:
- Mini - Duo Pack Savings (gid://shopify/DiscountAutomaticNode/1535579357412):
  combinesWith.productDiscounts false -> true
- Mini - Duo Max Savings  (gid://shopify/DiscountAutomaticNode/1535579390180):
  combinesWith.productDiscounts false -> true

After the change: Mini Duo + R36S Pro Duo in one cart = $32.49 x2 + $74.99 x2;
Mini Duo Pack + Duo Max = $32.49 x2 + $57.49 x2; Mini Duo Max + Pro Duo Max =
$57.49 x2 + $94.99 x2. All match the product pages.

## Still open (same switch, not changed)
The duo discounts for the Flip SP, R36H Pro, R36S Ultra, R36H Ultra, Gastly
Vapor Lamp, Clutch Buds and Clutch Pro Controller also have "Combines with:
Product discounts" OFF, so any two of those families in one cart (or one of them
with the Mini) still drops one family's duo saving. Flipping the same switch on
each of them fixes it; left for the owner to confirm.

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
