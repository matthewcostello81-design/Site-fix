# Cart upsell rows: cut-off wording and cut-off SAVE badge on small phones

## Problem
On an iPhone 13 / 16 / 17 (390-402pt) the in-cart offer rows cut themselves off:

    "Add a 2nd PocketB..."      instead of  "Add a 2nd R36S"
    "Unlock Buy 2, Get 1 ..."   instead of  "Unlock Buy 2, Get 1 FREE"
    "SAVE 25" / "SAVE 5"        instead of  "SAVE 25%" / "SAVE 50%"

The headline ended mid-word and the discount chip ended mid-number, with its
tail painted under the ADD button. The console was also still called by its old
name, "PocketBoy R36", instead of the R36S.

## Cause
One squeeze, two symptoms. `screen.css` styles every bare `<button>` with

    button { min-width: var(--btn_miw); }        /* min(100%, 120px) here */

so the three-letter ADD button takes 120px. On a phone the drawer is the full
viewport (`pg-drawer`) less `var(--rpp)` a side, so at 390pt the row has 358px
of content; 120px button + 46px thumbnail + gaps + card padding leaves the copy
column about 154px. `pg-unlock` never waives that min-width, and no amount of
padding tuning can go under it.

`pg-cart-tune` then styles that column at four ids, with two choices that were
safe at the widths they were measured at and are not safe at 154px:

- the title was `white-space:nowrap; text-overflow:ellipsis`, which only holds
  while the column is wider than the longest title;
- the price line was `flex-wrap:nowrap` with the SAVE chip at
  `flex:0 1 auto; min-width:0`. A line that cannot fit and cannot break can only
  give where something is allowed to shrink -- and a shrunken inline-block with
  nowrap text simply clips, so the badge lost its digits.

Reproduced in headless Chromium against the real markup and the real
stylesheets: title truncated and chip clipped at 375-393px, clean at 402px+.

## Fix
A new section, `sections/pg-upsell-fit.liquid`, registered in `header-group`.
Its rules run at FIVE ids so they beat pg-cart-tune's four (and pg-cart-timer's
two, and pg-unlock's three) at any load order -- a theme-editor reorder cannot
unseat them:

- the ADD button waives `--btn_miw` and is sized by its own padding (~55px),
  handing ~65px back to the copy column;
- the title wraps, to at most two lines, and is never ellipsised;
- the price line wraps and the SAVE chip never shrinks: whole badge on the price
  line where it fits, whole badge on its own line where it does not;
- the accessory tickbox label wraps for the same reason.

Measured after the change at 375/390/393/402/414/430/485, with both the real
titles and deliberately over-long ones: no truncated title, no clipped chip, no
row overflow, and the chip ends 65-154px clear of the ADD button.

The name is corrected in two places. `sections/pg-cart-upsell.liquid` (the cart
page's free-gift line) is fixed at source. The drawer's two copies -- pg-unlock's
LADDERS entry and pg-drawer's free-case progress message -- live in 54-64KB
files that can only be written whole, so the same section renames them in the
drawer's text nodes instead, the way pg-cart-mobile already handles the
"PokeOrb" rename. It cannot flicker: pg-unlock rebuilds a row wholesale (so the
sweep re-runs after it and then finds nothing), and pg-drawer's writer is
guarded on `data-m` -- what it last wrote -- not on what the node says. When
either file is next redeployed clean, fix `name: 'R36S'` in pg-unlock's LADDERS
and the two `<b>PocketBoy R36</b>` literals in pg-drawer's pgBar, and the sweep
quietly finds nothing to do.

## Applied to
Files changed: sections/pg-upsell-fit.liquid (new),
sections/pg-cart-upsell.liquid, sections/header-group.json

Deployed to the unpublished theme "Copy of R36S + cart fixes (Claude 9-6)"
(163709550820), byte-verified by checksum. Theme writes to the live theme are
blocked by policy from this session, so the theme still has to be published.

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
