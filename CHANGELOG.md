# Pocket Era: center the "Keep exploring / You may also like" rail

## Problem
On product pages the injected "Keep exploring / You may also like" rail
(.pgu-yml, built by the yml() script in pg-theme-css) rendered off-center
- the whole block (eyebrow, heading, cards) sat left of the page center.

## Fix (`sections/pg-theme-css.liquid`)
- yml() now inserts the rail at the #pgx page root, before the reviews
  section (never inside the 56%-wide gallery column), so its
  margin:auto centering is relative to the full page width.
- Added belt-and-suspenders CSS: `html body .pgu-yml` forced to
  display:block, width:100%, max-width:1100px, margin-inline auto,
  float:none, position:static; the grid forced to flex + centered; the
  heading/eyebrow text-align:center - all !important so no later layer
  can knock it off-center.

Applies to every pg-landing product page (console, PokeOrb, wall art)
since they share this injection.

## Applied to
Shopify draft theme `162727330020` via the Admin API (themeFilesUpsert).
Files changed: sections/pg-theme-css.liquid

---

# Pocket Era: console + wall art pages follow the live product titles

## Problem
Same class of bug fixed earlier for the PokeOrb: the products were renamed
("PocketBoy R36 - Handheld Game Console", "Heroic Holographic Wall Art")
but the storefront kept the old names because theme files hardcode them:
- `templates/index.json` - homepage card labels for both products
- `templates/product.pg-landing.json` - console display_title + "Bundle
  Deal: 2x R36S"
- `templates/product.pg-wallart.json` - wall art display_title + "Bundle
  Deal: 2x 3D Wall Art"

## Fix
Cleared labels/display_titles (fall back to the live product title, so all
future renames propagate automatically - all three storefront products now
behave this way) and renamed the bundle tiles to "Bundle Deal: 2x
PocketBoy R36" and "Bundle Deal: 2x Holographic Wall Art".

Note: the announcement marquee still says "Free R36S case with purchase of
device" (hardcoded in pg-theme-css, and the gift product itself is still
named "R36S Protective Case (FREE Gift)") - left as-is pending direction.

## Applied to
Shopify draft theme `162727330020` via the Admin API (themeFilesUpsert).
Files changed: templates/index.json, templates/product.pg-landing.json
(now tracked), templates/product.pg-wallart.json

---

# Pocket Era: looping demo video on the Heroic 3D Wall Art page

## What
Added the user's lenticular-flip demo video (person tilting the poster so
the print morphs between card artworks) to the wall art product page. It
autoplays muted and loops continuously in the gallery, right under the
hero image (desktop) / as the second card in the swipe strip (mobile).

## How
- Uploaded the video to Shopify Files via stagedUploadsCreate + fileCreate
  (Video gid://shopify/Video/71926820143332); Shopify transcoded it to
  480p/720p/1080p renditions on cdn.shopify.com.
- **`sections/pg-landing.liquid`**: new optional `gallery_video_url`
  section setting. When set, the gallery renders
  `<video autoplay muted loop playsinline>` in a `.pgx-vid` tile between
  the hero and the thumbnails. Empty for the console/crystal templates,
  so nothing changes there. Mobile CSS sizes the tile to match the
  swipe-strip cards from pg-theme-css.
- **`templates/product.pg-wallart.json`**: set `gallery_video_url` to the
  1080p mp4 rendition URL.

## Applied to
Shopify draft theme `162727330020` ("Pocket Era round 1 (Claude)") via the
Admin API (stagedUploadsCreate + fileCreate + themeFilesUpsert).
Files changed: sections/pg-landing.liquid (now tracked in full),
templates/product.pg-wallart.json

---

# Pocket Era: stop hardcoding the PokeOrb name (was showing "Pokemon Crystal Ball")

## Problem
The product was renamed to "Crystal PokeOrb" in Shopify, but the storefront
kept showing the old name because two theme files hardcode display names
that override the live product title:
- `templates/index.json` - homepage Best Sellers card label
- `templates/product.pg-crystal.json` - `display_title` (page H1 + purchase
  tile) and `bundle_title` ("Bundle Deal: 2x Crystal Balls")

## Fix
Cleared the hardcoded label/display_title (both fall back to the live
product title via `| default: prod.title`, so future renames show up
automatically) and updated the bundle tile to "Bundle Deal: 2x Crystal
PokeOrbs". The R36S and wall art labels were left as deliberate custom
display names.

## Applied to
Shopify draft theme `162727330020` ("Pocket Era round 1 (Claude)") via the
Admin API (themeFilesUpsert).
Files changed: templates/index.json, templates/product.pg-crystal.json

---

# Pocket Era: re-apply wall art Best Sellers block + strikethrough price

## What
The wall art card wasn't showing on the homepage: a theme-editor save of
`templates/index.json` (it also reworded the Reviews accordion) landed after
our update and was based on the older version, dropping the `prod3` block.
Re-applied the block on top of the current file, preserving the newer
accordion copy. Also, the product had been edited down to a single variant
("Legendary Poke Trio", $39.99) still carrying the supplier's inverted
$13.74 compare-at, so no strikethrough could render.

## How
- **`templates/index.json`**: re-added the `prod3` product block and
  `block_order` entry on top of the live file content.
- **Product record**: set `compareAtPrice` to $79.99 on the variant via
  `productVariantsBulkUpdate`, which renders as a $79.99 strikethrough and
  a "Sale 50% Off" badge on the homepage card and the % OFF note on the
  product page, matching the other two products.

## Applied to
Shopify draft theme `162727330020` ("Pocket Era round 1 (Claude)") via the
Admin API (themeFilesUpsert + productVariantsBulkUpdate).
Files changed: templates/index.json

---

# Pocket Era: Heroic 3D Wall Art added to homepage Best Sellers

## What
The homepage Best Sellers grid showed two cards (R36S console, Pokemon
Crystal Ball) side by side. Added the new Heroic 3D Wall Art as a third
card and put all three on one row on desktop.

## How
- **`templates/index.json`**: new `prod3` product block (wall art handle,
  label "Heroic 3D Wall Art") ordered after the crystal ball.
- **`sections/pg-dark.liquid`**: on desktop (min-width 901px) the card
  width becomes a third of the row (`calc((100% - 44px)/3)` with the grid's
  22px gaps) so the three cards sit next to each other. The 50% width it
  overrides lives in pg-theme-css without !important; the new rule is
  stamped with !important so it wins regardless of load order. Tablet keeps
  2-up, mobile keeps stacked.

Note: the wall art card shows no "Sale % Off" badge because the product's
compare-at price is below its selling price (supplier import artifact); the
grid only badges real markdowns.

## Applied to
Shopify draft theme `162727330020` ("Pocket Era round 1 (Claude)") via the
Admin API (themeFilesUpsert).
Files changed: templates/index.json, sections/pg-dark.liquid

---

# Pocket Era: product page for Heroic 3D Wall Art

## What
New product page for "Heroic 3D Wall Art" (anime/Pokemon lenticular 3D
posters, $36.99), copying the format of the store's other product pages
(R36S console and 3D Crystal Poke Ball): a dedicated `product.pg-*.json`
template running the `pg-landing` one-page landing section.

## How
- **`templates/product.pg-wallart.json`** (new): `pg-landing` section
  configured with the product handle, display title "Heroic 3D Wall Art",
  the PocketEra logo/announcement header, a Bundle Deal 2x tile (10%, same
  automatic discount the other pages use), six product-specific review
  blocks, a Features accordion (lenticular 3D effect, 12 x 16 in size,
  easy hang, no batteries), and the standard shipping/returns copy.
- **`sections/pg-theme-css.liquid`**: added the wall art handle to the
  header search widget's ALLOW list so the product appears in search
  results (the widget filters suggestions to hand-picked purchasable
  products).
- **Product record**: set `templateSuffix` to `pg-wallart` and published
  the product to the Online Store channel (it was unpublished, so its URL
  404'd).

The product's supplier import left `compareAtPrice` ($13.74) below the
selling price ($36.99); the landing section ignores inverted compare-at
values, so no strikethrough shows. Left as-is.

## Applied to
Shopify draft theme `162727330020` ("Pocket Era round 1 (Claude)") on shop
thepocketera.com via the Admin API (themeFilesUpsert + productUpdate +
publishablePublish).
Files changed: templates/product.pg-wallart.json (new),
sections/pg-theme-css.liquid

---

# Pocket Era: dark footer payment bar + on-theme contact card

## Problem
On the Pocket Era dark (purple/black) skin, the footer bottom bar — copyright
line plus payment icons — still rendered on the base theme's light scheme: a
white full-width strip with near-white text (unreadable) and the payment icons
pushed to the right in stark white boxes. The "Have any questions?" contact
card above the footer on product pages also kept the old North Cove styling
(cream card, teal text, orange gradient button), clashing with the dark theme.

## Cause
The dark skin (`sections/pg-dark.liquid`) restyled the footer band but never
touched the bottom bar (`div.base-font`) or the contact card
(`sections/nc-contactcard.liquid`, rendered from footer-group). The base
theme's color-scheme rules kept the bar light and floated the `ul.l4pm`
payment list to the right; the overlay layers (nc-footer/pg-footer) only
recolored its text, leaving white-on-white.

## Fix (`sections/pg-dark.liquid`)
Two new blocks in the dark-skin file (so removing `pg_dark` from footer-group
still reverts everything in one edit):

- **Bottom bar**: near-black background (#0E0914) with a subtle purple top
  border, matching the footer band above it; the bar becomes a centered
  column, so the copyright line and the payment icons are centered. The
  payment list is a centered flex row; each icon sits in a soft lavender chip
  (#EDE2F8 with a purple border) instead of stark white, keeping the brand
  marks legible while fitting the dark skin. Muted lavender text/link colors.
- **Contact card**: dark purple surface (gradient #1C1428→#140C1E) with a
  purple border and glow; heading near-white, body text muted lavender; the
  Contact us button becomes the site's purple gradient pill (reusing the
  card's existing ncCcGlow sweep animation).

Selectors are written twice (`#shopify-section-footer ~ .base-font` and
`.shopify-section-footer .base-font`) with boosted specificity so they win
against both the base theme scheme rules and the nc-footer/pg-footer overlay
layers regardless of load order.

## Applied to
Shopify draft theme `162727330020` ("Pocket Era round 1 (Claude)") on shop
thepocketera.com via the Admin API (themeFilesUpsert).
Files changed: sections/pg-dark.liquid

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
