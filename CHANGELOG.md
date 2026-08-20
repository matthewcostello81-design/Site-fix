# Orb volume tiers + the blank slab under the cart's subtotal pane

Shop `www.thepocketera.com` (Pocket Era). Both changes are in a NEW DRAFT theme
duplicated from the live one, `163067101412` — "PE orb volume tiers + cart pane
(Claude)". Nothing was written to the live theme.

## 1. Two more volume tiers on the Crystal Legends Orb

The upsell ladder on the orb PDP is built at runtime by `window.pgLadder`
(`sections/pg-theme-css.liquid`), then rewritten by `sections/pg-tile-copy.liquid`,
which deletes pgLadder's dead Trio/Quad tiers and turns the Duo tile into
Buy 2 Get 1 Free. So `pg-tile-copy` is where the ladder actually is, and where
the new tiers were added — as additions:

| tier | tile               | orbs | shown   | struck  | badge    |
|------|--------------------|------|---------|---------|----------|
| 0    | Single Item        | 1    | $34.99  | —       | —        |
| 1    | Buy 2, Get 1 FREE  | 3    | $69.98  | $210.00 | Best Deal! |
| 4    | Buy 4, Get 2 FREE  | 6    | $134.20 | $420.00 | SAVE 68% |
| 5    | Buy 5, Get 3 FREE  | 8    | $169.95 | $560.00 | SAVE 70% |

Tiers 0 and 1 are untouched — copy, prices and the "Best Deal!" badge all as
they were. The new tiles are built with pgLadder's own classes and its own
picker factory (`window.pgDrop`), one picker per orb, so its existing
add-to-cart posts 6 and 8 units with no interception.

Two things the shape of the existing code forced:

- **Tier numbers 4 and 5, not 2 and 3.** `ladder()` deletes any tile numbered
  2 or 3 (pgLadder's dead offers), so 2/3 would be built and destroyed on
  alternating passes.
- **Selection is normalised on the document.** pgLadder's per-tile click
  handler is closed over the array of tiles *it* built, so it cannot clear
  `pgx-sel` from a new tile — and add-to-cart reads the FIRST selected tile in
  the document. One delegated listener now owns selection for every `.pgx-lad`.

The shown prices are literal (in `EXTRA`, in cents): they are chosen price
points, not arithmetic on $34.99. The struck-through figure is derived the same
way tier 1 derives its own — compare-at × orbs in the pack.

### The checkout side

Both matching automatic discounts were created on the store (LIVE, on the
owner's say-so — discounts are not theme-scoped):

- `PokeOrb - Buy 4 Get 2 Free` — buy 4 of the orb, get 2 at 100% off
- `PokeOrb - Buy 5 Get 3 Free` — buy 5 of the orb, get 3 at 100% off

One use per order each, combining with product / order / shipping discounts —
the same settings `PokeOrb - Buy 2 Get 1 Free` already carries. Shopify applies
whichever automatic discount is worth most, so the repeating Buy 2 Get 1 Free
still wins where it beats them (12 orbs: four free, not two).

So the shopper pays under the tile, the same way tier 1 already behaves: 6 orbs
bill $139.96 and 8 orbs $174.95, with the standing "Extra 10% off entire order"
combining on top (verified: `combinesWith.productDiscounts` is true on both
sides). **Worth watching** — those pre-10% figures sit *above* the tiles'
$134.20 and $169.95. While the 10% promotion runs the tiles under-quote in the
shopper's favour; if it ends, the 6-orb tile under-quotes by $5.76 and the
8-orb tile by $5.00, and `EXTRA` in `pg-tile-copy.liquid` needs revisiting.

Verified in headless Chromium against a harness reproducing pgLadder's tiles,
`pgDrop` and its add-to-cart: 37 checks — order, copy, prices, badges, picker
counts, tiers 0/1 unchanged, one-tile-selected on every click, 6 / 8 / 3 / 1
units posted per tier, sold-out variants never offered, no duplicate tiles under
the 1.2s poll, and the new tiles removed if the ladder is torn down (leaving
them would stop pgLadder rebuilding — its guard is `if
(document.querySelector('.pgx-lad')) return`).

## 2. The blank white slab under CHECKOUT in the cart drawer

Three causes, all in `sections/pg-cart-mobile.liquid`, measured before and after
in headless Chromium at 1280×900, 1024×1250 and 390×844, with 1, 2 and 12 items:

| | before | after |
|---|---|---|
| scrollable white void below the pane | 346px | 0px |
| blank strip inside the pane under CHECKOUT | 34px | 6px |
| bare drawer ground below the last row | 14px | 0px |

- **The skirt was laid out, not just painted.** `#cart .sticky-in-panel::after`
  was a 400px-tall absolutely positioned box, and an abspos descendant extends
  its scroll container's scrollable overflow — so every cart carried ~360px of
  scrollable white below CHECKOUT. Measured: content 900px, `scrollHeight`
  1260px; with the skirt suppressed, 900px and not scrollable at all. It is now
  a 400px box-shadow **spread** from a zero-height box (shadows never contribute
  to overflow), clipped downward. Not the offset shadow the file's own note
  rejected — that one was `0 400px 0 0`, which slid the cover past the strip it
  was meant to hide.
- **The flex spacer was phones-only.** `#cart` is a flex column, so a short cart
  drops its leftover height below the last child. `pg-cart-spacer` fixed that
  under 760px and was removed on desktop. It is unconditional now, and is zero
  pixels tall when there is nothing to absorb.
- **`:last-child` was landing on a hidden node.** `pg-drawer`'s `pgPane()` moves
  the payment strip into the pane as its last child and rule 4 hides it, so
  pg-cart-fast's `> *:last-child{margin-bottom:0}` never reached the real last
  visible row. The trailing margins are named explicitly now, and the pane's
  bottom padding is trimmed at every width rather than under 600px only.

Checkout button visibility is asserted in every case; the pane stays pinned
(`position:sticky` untouched — the iOS Safari failure mode the file warns about
is not gone near).

## Applied to
Shopify draft theme `163067101412` on `www.thepocketera.com`, via Admin API
(`themeDuplicate` from live `163046228196`, then `themeFilesUpsert`).

Files changed:
- sections/pg-tile-copy.liquid
- sections/pg-cart-mobile.liquid

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
