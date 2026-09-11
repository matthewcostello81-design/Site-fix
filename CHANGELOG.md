# R36S page: tile labels ride inside the SAVE pill, side by side, orb-style

## Problem
On the R36S product page (`/products/handheld-game-console`) each bundle tile
wore two stacked pills: the SAVE % on the tile's top edge and, under it, a
label ribbon ("Best Deal", "Great Value", "Most Popular"). The owner wants it
the way the Crystal Legends Orb page shows it: one pill, side by side,
"BEST DEAL · SAVE 43%". A first pass folded only the Best Deal label into its
pill and left the other two stacked; the owner called that out, so every label
now rides inside its pill.

## Cause
Two tile builders, two treatments. The orb's tiles come from pgLadder plus
`sections/pg-tile-copy.liquid`, which writes the label INTO the SAVE pill of the
biggest pack. The R36S tiles come from the pgDuo script in
`sections/pg-theme-css.liquid`, whose `labelPacks()` ranks the tiles from their
live SAVE % and wrote every rank name into a separate `.pgx-duo-ribbon` pill.

## Fix (`sections/pg-theme-css.liquid`)
- `labelPacks()`: every ranked label is written into the tile's SAVE pill as
  "LABEL · SAVE N%". The pill is split into a label span and a percent span;
  the percent span carries the `data-pg-duosave` / `data-pg-singlesave`
  attribute the percent writers look up (`calc()`, the storage picker,
  pg-case-mobile's 250ms `strikeSync`), so those keep writing a plain "SAVE N%"
  into their own span and never clobber the label. The ribbon element is left
  empty, which the existing `:empty` rule hides, and `put()` lifts the price
  block back up. A tile with no pill (nothing to save) keeps the ribbon
  fallback.
- `build()`: once the tiles exist, the 2.5s beat re-runs `labelPacks()`
  (idempotent, zero DOM mutations when nothing changed), and it runs once more
  right after the single's SAVE pill is created so the single is labelled on
  the first paint.
- `labelPacks` is exported as `window.pgLabelPacks`, and the pgPayRow `tick()`
  now calls that. Its bare `labelPacks()` call referenced a function in another
  closure and threw a ReferenceError every 1.6s.

Verified offline by running the real pgDuo script in jsdom against a mock R36S
page with the live prices: single "MOST POPULAR · SAVE 25%", duo
"GREAT VALUE · SAVE 32-37%", trio "BEST DEAL · SAVE 38%" at 64x3 and
"BEST DEAL · SAVE 43%" at 128x3; no ribbons; re-ranking on a repricing swaps
the labels; a simulated 250ms strikeSync writer never touches the label; zero
mutations across an idle 2.5s beat. The pill measures about 165px at 12px
Poppins, the same width as the orb's, so it cannot wrap. The storefront is not
reachable from this environment, so no screenshot.

## Applied to
Shopify draft theme 163875881188 ("128G Best Value (Claude 9-11)") on shop
`v9fqfa-bd.myshopify.com` via the Admin API (staged upload + themeFilesUpsert).
Files changed: sections/pg-theme-css.liquid

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
