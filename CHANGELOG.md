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

# Site fix: cart drawer flashing (permanent mutation storm)

## Problem
Images and prices in the cart drawer flashed continuously and the cart looked
bugged. The drawer scripts also polled /cart.js several times per second.

## Cause
Several nc-* sections run 300ms maintenance ticks that call
`classList.add(...)` and `classList.toggle(x, force)` with values that are
already in place (for example `li2.classList.add('nc-disc')` on the discount
totals row and `classList.toggle('nc-stuck', ...)` on the cart header in
nc-cro's drawerExtras). Per the DOM spec these calls re-serialize the class
attribute even when nothing changes, and that always queues a mutation record.

Every MutationObserver watching #cart (nc-cartfix, nc-linesave, nc-cartcount,
nc-recs, nc-cro's cartObs, nc-gift, plus the theme's own cart logic) therefore
woke 3+ times per second forever, re-running image swaps and price rewrites
and fetching /cart.js in a loop. Reproduced in a local Playwright harness
built from the real theme scripts: steady ~3-4 mutations/second at idle,
dominated by no-change class writes on the savings row.

## Fix
`sections/nc-classcalm.liquid`: a tiny DOMTokenList shim, loaded first via
sections/header-group.json, that makes no-op classList writes truly no-op
(add of a present token, remove of an absent token, and toggle-with-force
that would not change state return without touching the attribute). Real
class changes behave exactly as before.

This fixes the storm regardless of which section produces redundant writes,
so ongoing edits to nc-cro.liquid by other sessions cannot reintroduce it.

Verified in the harness: after the shim, zero mutations at idle over 17s
(previously 3-4/second forever), and a quantity change produces one bounded
rebuild burst that settles immediately.

## Applied to
Shopify draft theme `161868382436` ("NC Polish round 2 + reviews (Claude)")
via themeFilesUpsert.

Files changed:
- sections/nc-classcalm.liquid (new)
- sections/header-group.json (registered nc_classcalm first in the group)

---

# Site polish: free gift banner matched to brand theme

## Problem
The homepage free gift band (Free 5-Level Resistance Band Set) rendered in an
off-palette sage green (from a `.nc-gift-home` override in nc-cro.liquid)
that did not match the brand's cream/sand + teal identity.

## Fix
`sections/nc-giftfix.liquid`, registered homepage-only in
templates/index.json: repaints the band with the brand teal promo gradient
(the same 160deg #3a8d83 -> #2C6E72 -> #173f44 family used by the trust strip
and the Our Promise band), cream heading, seafoam eyebrow, muted cream body
text, and the standing 3D drop shadow. The animated gold "Included Free" pill
is kept as the contrast accent. Selectors carry `#nc-home` specificity so they
outrank nc-cro's single-class !important rules without editing that file.
Color-only change: all existing responsive layout rules still apply on mobile
and desktop.

Files changed:
- sections/nc-giftfix.liquid (new)
- templates/index.json (added nc_giftfix to the homepage template)

---

# Site fix: cart line price flashing on discount-free lines

## Problem
On cart lines without an automatic bundle discount (for example a single-item
cart), the line's pricing area and quantity stepper flashed intermittently,
and /cart.js was fetched dozens of times per second.

## Cause
Two scripts fight over the per-line savings row (.nc-lsave):
- nc-cro's cartWasFix creates it from the compare-at price (was / now /
  Save %) on every 300ms tick, for any line whose product has a compare-at.
- nc-linesave removes any .nc-lsave on a line whose cart data shows no actual
  discount (its own rule: only show savings the checkout will honor).
With no bundle discount active, the row was created and deleted in an endless
loop. Each flip also swapped which price element was visible (a CSS rule
hides the theme price while .nc-lsave exists), so the price visibly flickered
between two renderings, and every flip woke all cart observers, which
re-fetched /cart.js. Reproduced in the local Playwright harness: ~90
mutations/second and ~60 /cart.js requests/second sustained.

## Fix
nc-linesave now only removes savings rows it owns (those carrying its data-k
state attribute). nc-cro's compare-at row is left alone on discount-free
lines. When a real line discount exists, behavior is unchanged: nc-linesave
takes the row over, stamps data-k, and keeps the values truthful.

Verified in the harness: zero idle mutations over 17s (previously ~90/s),
network quiet, quantity changes settle in one bounded rebuild.

## Applied to
Shopify draft theme `161868382436` via themeFilesUpsert.

Files changed:
- sections/nc-linesave.liquid (ownership guard on the removal branch)

---

# New product page: 5-Level Resistance Band Set ($34.99)

## What
A sellable product page for the resistance band 5-piece set, matching the
store's standard custom PDP format (nc-product alternate-template system).

The existing "Resistance Bands (5 Levels)" product stays untouched as the
hidden $0.00 free-gift product powering the auto-add gift. Selling the same
item required a NEW product: repricing the gift product would have made the
gift automation silently add a charged item to every cart, and any handle
containing "resistance-bands" would trip the cart scripts' free-gift
detection (ncIsGift matches href substring). The new handle
`5-level-resistance-band-set` avoids that substring.

## Product (created via Admin API)
- 5-Level Resistance Band Set, $34.99, compare-at $49.99, tag "summer"
  (joins the sitewide Summer Sale convention), type Fitness and Exercise,
  vendor North Cove Wellness, SKU NCW-FIT-002-5PK, ACTIVE, untracked stock.
- SEO title + description set. Added to Massage & Recovery (manual
  collection); Shop All and Summer Sale pick it up via smart rules.
- templateSuffix: nc-bands.

## Template
templates/product.nc-bands.json mirrors product.nc-foam.json section-for-
section: breadcrumbs, nc-product (buy box highlights, Single/Duo/Family Kit
tiers priced by the real quantity discounts, benefits/FAQ accordion, system
dots, comparison table, before/after, day timeline, steps, box contents,
specs, promise, disclaimer), nc-enhance, recommendations.

Deliberately omitted: the "By the numbers" meter blocks. On other pages those
carry invented user-percentage stats; the store has a prior GMC
misrepresentation flag, so no fabricated stats were added for a product with
zero reviews. The section hides cleanly when no meter blocks exist.

## Applied to
Draft theme `162251276516` ("NC Polish round 4 (Claude)"). Note: the LIVE
round 3 theme has no nc-bands template, so until round 4 publishes the
product renders there with the default product template.

Files changed:
- theme/templates/product.nc-bands.json (new)
