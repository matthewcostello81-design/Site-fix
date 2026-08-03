# PDP highlight bullets rendered blank on mobile

## Problem
On the 5-Level Resistance Band Set product page (template
`product.nc-bands.json`), the three highlight bullets under the gallery
showed their icons but no text on mobile. Desktop rendered correctly.

## Cause
Not a missing-content problem — the text is hidden by CSS.

`sections/nc-product.liquid` renders each `highlight` block as
`<div><svg/>bare text node</div>`. `sections/nc-quiz.liquid` then rewrites
every row client-side into `<svg> + <span class="nc-qb-f">full text</span>`,
plus `<span class="nc-qb-m">short text</span>` — but the short span is only
appended when the row's copy matches an entry in that file's hardcoded MAP
of pain-point strings:

    if(!q.d.querySelector('.nc-qb-f')){
      var h="<span class='nc-qb-f'>"+q.full+"</span>";
      if(q.shrt)h+="<span class='nc-qb-m'>"+q.shrt+"</span>";

Its CSS then hides the full text below 760px and shows the short one:

    @media(max-width:760px){
      #ncpdp#ncpdp .nc-qb > div .nc-qb-f{display:none}
      #ncpdp#ncpdp .nc-qb > div .nc-qb-m{display:inline}
    }

Most PDPs survive this because `qbFix()` in nc-cro overwrites their rows
with `PAINS` copy drawn from those same strings. This product's handle is
absent from `PAINS`, so it keeps its own theme-block copy, matches no MAP
entry, gets no `.nc-qb-m`, and the only element holding text is hidden with
nothing to replace it.

## Fix
Appended to `sections/nc-cartimg.liquid` (footer-group position 15):

    @media(max-width:760px){
      #ncpdp#ncpdp .nc-qb > div:not(:has(.nc-qb-m)){white-space:normal!important;overflow:visible!important;align-items:center!important}
      #ncpdp#ncpdp .nc-qb > div:not(:has(.nc-qb-m)) .nc-qb-f{display:inline!important}
    }

The `:not(:has(.nc-qb-m))` guard is the important part: it restores the full
text only on rows that never received a short variant — precisely the rows
that are blank — and leaves every working short-text row untouched. It wins
on specificity, (2,3,1) against nc-quiz's (2,2,1), so it does not depend on
source order.

`white-space:normal` is required alongside it because both nc-quiz and
nc-cro pin the row to `nowrap` + `overflow:hidden`. That suits the terse
pain-point copy, but a full-length highlight would otherwise be clipped at
the card edge rather than wrapping.

This is a latent bug for any product outside `PAINS`, not just this one; the
guard makes the rule safe to leave in place globally.

The section's schema label was renamed to "NC Late Fixes" to match what it
now holds. That label is cosmetic — `footer-group.json` references the
section by filename/type, which is unchanged.

## Applied to
Theme "Copy of NC Polish round 6 (Claude)" (draft, gid 162401812708). File:
sections/nc-cartimg.liquid. Verified byte-identical to the repo copy by MD5,
footer-group registration confirmed unchanged.

---

# Sale badge: Birchwood Roller Set card showed 33% instead of 50%

Note: this and all later work targets the current draft, "Copy of NC Polish
round 6 (Claude)" (gid 162401812708). Round 6 is now MAIN. The four earlier
fixes in this changelog were verified present in the new draft with
identical MD5s before this change was made.

## Problem
The Birchwood Massage Roller Set product card showed "33% OFF". The real
headline discount is 50% (the 4-Piece Set variant, $54.99 from $109.99).

## Cause
`fixBadge()` in `sections/nc-nohover.liquid` converts the server-rendered
dollar badge into a percentage with `saving / (price + saving)`. That is
correct only when `price` is the sale price, but it takes
`Math.max(...)` of every number inside `p.price` — and the theme nests the
struck `span.old-price` INSIDE that element. So it read the compare-at
price: 55 / (109.99 + 55) = 33%, instead of 55 / (54.99 + 55) = 50%.

This is a general bug, not specific to this product: any card with a
compare-at price is understated wherever `fixBadge` governs the badge. It
was not fixed at source here because `nc-nohover` is a shared 17.5KB file
that has been drifting between sessions.

Two further writers made a text-node fix unreliable:
- `saleBadge()` (nc-cro) runs on collection pages only and re-applies
  unconditionally from a 300ms master interval, so anything written to the
  badge there is overwritten within 300ms. It also pairs the lowest sale
  price with the lowest compare-at price, so it reports 37% for this
  two-variant product.
- `fixBadge` is self-limiting (it skips badges with no "$"), so whichever
  script writes first wins off-collection.

## Fix
Appended to `sections/nc-cartimg.liquid` (footer-group position 15, loads
last). The percentage is computed in Liquid as the highest per-variant
discount and painted over the badge with a CSS `::after` overlay:
`color:transparent` on the badge, the real value centred on top.

CSS was chosen over JS deliberately. It cannot be undone by any of the three
scripts that write that text node, so the badge is correct on collection
pages, the homepage and PDP rails alike, with no 300ms flicker war. The
overlay is absolutely positioned rather than using `font-size:0` because
nc-cro sets an inline `font-size:...!important` on collection pages, which
would beat a stylesheet rule.

Because the value is computed at render time from the variants, it tracks
price changes instead of going stale — a hardcoded percentage on a store
carrying a prior GMC misrepresentation flag would be a liability.

Scoped to this product's cards only; no other badge is affected.

## Applied to
Theme "Copy of NC Polish round 6 (Claude)" (draft, gid 162401812708). File:
sections/nc-cartimg.liquid. Verified byte-identical to the repo copy by MD5,
with the footer-group registration confirmed unchanged.

---

# Cart thumbnail: Foot & Leg Compression Massager product shot

## Problem
The cart line item for the Foot & Leg Compression Massager showed an older
photo instead of the uploaded product shot.

## Cause
`sections/nc-cro.liquid` carries a `CIMG` map (handle to image url) and its
`cartImg()` rewrites every cart thumbnail from it, overriding the product's
own media. The entry for this handle pointed at
`hf_20260724_231320_ea345a34...png`.

## Fix
`nc-cro` is 209KB, so it was not rewritten. Added a small section,
`sections/nc-cartimg.liquid`, registered last in `sections/footer-group.json`
(after `nc_cro`), which repoints only this one line item to
`nc-y-foot_a136ccd0-6e74-4a09-bec5-a9d4aa84a09d.jpg` (1100x1100, uploaded
2026-08-02).

Rather than fight `nc-cro` for the node, it cooperates with it: `cartImg()`
skips any image whose `data-nc-ci` already equals its own CIMG url, so the
override stamps that value while setting a different `src`. `nc-cro` then
leaves the node alone on every subsequent pass. The observer watches
`#cart` with childList/subtree only and is not debounced, so it claims new
nodes before `nc-cro`'s 40ms-debounced pass and its own attribute writes
cannot retrigger it. This deliberately avoids the competing-observer flicker
documented in the cart drawer entry below. The existing `ZOOMC` 1.2 scale
for this handle is left in place; it crops only the photo's empty margin.

No other product, and no other cart behavior, is affected.

## Applied to
Theme "NC Polish round 4 (Claude)" (draft, gid 162251276516). Files:
sections/nc-cartimg.liquid (new), sections/footer-group.json (section
registered). Both verified byte-identical to the repo copies by MD5. The
footer-group edit was made programmatically against a checksum-matched copy
of the live file and asserted to preserve every existing section, the footer
block, and `nc_global` (whose loss would kill the site-wide gradient).

---

# Collection toolbar: Sort By and Filter side by side on mobile

## Problem
On phone screens the collection page's Sort By and Filter controls stacked
vertically instead of sitting side by side.

## Cause
The controls are two custom selects (`.nc-fsort`, `.nc-fcat`) built by the
script in `sections/nc-foot-fix.liquid` inside a flex-wrap `.nc-fbar`. Each
select sizes itself to its widest option plus 32px side padding, so the pair
is slightly wider than a phone viewport and the second one wraps to a new
row.

## Fix
Appended a mobile media query (max-width 760px) to
`sections/nc-foot-fix.liquid`: the bar becomes nowrap full-width, each
`.nc-fsel` gets `flex:1 1 0; min-width:0`, and the selects fill their half
at 50/50 with tighter padding (12px left, 30px right for the chevron) and
ellipsis overflow, so both controls share one row on any phone width.
Desktop is untouched.

## Applied to
Theme "NC Polish round 4 (Claude)" (draft, gid 162251276516). File:
sections/nc-foot-fix.liquid. Verified byte-identical to the repo copy by
MD5.

---

# Shop All tile: Deep Tissue Massage Gun lifestyle photo

## Problem
The homepage "Shop the collection" band's Shop All tile showed a hand
massager photo instead of the massage gun.

## Cause
The tile image is swapped at runtime by the CAT map in
`sections/nc-global-css.liquid` (`'Shop All'` pointed at a cloudfront hand
massager render). The base image in `nc-home.liquid` never shows.

## Fix
Added a second guarded script block to `sections/nc-cmpfix.liquid` (already
wired right after `nc_home`, so it runs first). It sets the Shop All tile
image to the Deep Tissue Massage Gun's LIFESTYLE photo (black and gold gun
in use on the thigh, square 2048x2048 Shopify CDN image) and pre-stamps
`img.dataset.ncImg`, which makes the later CAT swap in `nc-global-css` skip
the tile. The Massage & Recovery and Best Sellers tiles are untouched.

## Applied to
Theme "NC Polish round 4 (Claude)" (draft, gid 162251276516). File:
sections/nc-cmpfix.liquid. Verified byte-identical to the repo copy by MD5.

---

# Homepage compare chart: swap Knee & Joint Wrap for the 5 Piece Roller Set

## Problem
The homepage "Compare our most popular tools" chart still showed the Knee &
Joint Wrap in its fifth column. That product is now ARCHIVED in Shopify, and
`nc-cro`'s `wrapFix()` was silently retargeting its links to the Electric
Heating Pad, so the column's name, image, and link no longer agreed.

## Cause
The chart's data is hardcoded in `sections/nc-home.liquid` (47KB), with four
later-loading layers (`nc-cro`, `nc-homefix2`, `nc-bannerfix`,
`nc-global-css`) mutating it at runtime. The base file was never updated when
the wrap was retired.

## Fix
A new small override section, `sections/nc-cmpfix.liquid`, wired into
`templates/index.json` directly after `nc_home`, rewrites only the fifth
column at parse time (before `nc-mfix`'s mobile card builder runs, so the
swipeable mobile cards inherit the change automatically):

- Product: Birchwood 5 Piece Roller Set (handle
  `natural-wood-body-massage-roller-set`, ACTIVE), labeled "5 Piece Roller
  Set", linked to its product page, priced from the set variant via Liquid.
- Image: the product's LIFESTYLE photo (roller set in use on the thigh,
  square 2048x2048 Shopify CDN image), not the white product hero. The
  `img.dataset.ncImg` guard stops `nc-global-css`'s name-keyed image swap
  from overriding it.
- Rows updated for the new column: Best for "Full-body rolling", Massage
  type "Manual rolling", Soothing heat: no, Cordless: yes (unchanged),
  Hands-free: no, Travel-friendly: yes (unchanged).
- All other columns and rows untouched.

Rewriting the fifth column in `nc-home.liquid` itself was considered but
rejected: pushing the full 47KB file through the API risks corrupting the
homepage, and this theme's established pattern is small override layers.

## Applied to
Theme "NC Polish round 4 (Claude)" (draft, gid 162251276516). Files:
sections/nc-cmpfix.liquid (new), templates/index.json (section wired in).
Both verified byte-identical to the repo copies by MD5 checksum.

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
