# R36H Ultra: bundle discount ladder ran backwards (Max < Single)

## Problem
The R36H Ultra bundle tiles read Single SAVE 31%, Max SAVE 25%, Duo Max SAVE
34%. The Max Bundle looked like a worse deal than the Single, unlike the R36S
Ultra, whose savings rise with each tier (27% / 36% / 45%).

## Cause
Not a theme bug. `pg-r36h-ultra-tiles` badges each tile live from the variant
price and compare-at price. Both R36H Ultra tiers carried the same flat $55 off
($179.99 -> $124.99, $219.99 -> $164.99), so the larger Max base gave a
smaller percent.

## Fix
Admin change only (productVariantsBulkUpdate), no theme file touched. Sale
prices unchanged at owner's request; compare-at only:
- Max Bundle (128GB), all 7 colours: compareAtPrice $219.99 -> $269.99

Result on the tiles: Single 31% (unchanged), Max 39%, Duo Max 46%
($539.98 struck, $289.98 after the $20-each Duo Max automatic discount).

## Follow-up: Max tile note wording
The Max tile's note read "Saves $105.00 vs buying separately". The console
plus its two accessories at their own list prices total about $230, so that
wording overstated the saving. Changed to "off the list price", the R36S
Ultra's wording, in `sections/pg-r36h-ultra-tiles.liquid` (live theme file,
not tracked in this repo). Live-theme writes are blocked from the Admin API
connector, so the edit is on an unpublished theme for the owner to publish:
"R36H Ultra list-price FIX (Claude 10-10b)"
(gid://shopify/OnlineStoreTheme/188689219812). That is the previous live
theme, which was swapped out when a fresh duplicate of it was published
mid-task; its files matched the new live theme's checksums before the edit.
The live theme was renamed "Live 10-10 (before list-price fix)" so the two
are not confused. Uploaded file checksum verified against the local edit
(md5 827d61713a9126e27193233ee4b10457).

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
