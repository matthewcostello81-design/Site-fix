# Wall art gallery: drop the top room shot, lead with the video

## Change
On the Holo Legends Wall Art product page the gallery led with a large room
shot (the product's featured image) and sat the lenticular flip video
underneath it. The owner wanted that top photo gone and the video moved up
into its slot. The gallery now reads: video, then the photo thumbnails.

## Files
- `sections/pg-wallart-gallery.liquid` (new): hides `.pgx-hero`, zeroes the
  video's top margin so it lands flush in the vacated slot, and strips the
  hidden hero's `src` so the page stops downloading a 1400px image nobody
  sees. Thumbnails still open an enlarged view; on desktop it is ordered to
  appear below the video rather than above it.
- `templates/product.pg-wallart.json`: renders the new section after
  `pg_landing`.

## Why an override and not an edit to pg-landing
`sections/pg-landing.liquid` is shared by the homepage and five other product
templates (pg-bag, pg-console, pg-crystal, pg-landing, pg-wallart), all of
which keep their photo-first hero. Scoping the change to a section that only
the wall art template renders keeps the shared file untouched, and reverting
is a one-line edit to that template's `order`.

## Mobile note
The gallery is only made a flex column above 901px. Below that, `.pgx-vid`
carries a `flex:0 0 88%` that a column flex parent would read as a height, so
mobile keeps plain block flow and the enlarged view opens above the video.

## Not changed
The photo is still the product's featured image, so it continues to appear in
the bundle tile, the review quote card, cart lines and collection listings. No
product media was deleted.

---

# PixelGlow Site Build: one-page R36S landing (Sleek Mood style)

## Scope
Theme "PixelGlow Site Build" (unpublished draft, id 162692006116) on North Cove
Wellness. The homepage is now a single product landing page for the R36S
handheld console (handle `handheld-game-console`), rebuilt from the owner's
Sleek Mood store screenshots. Policies and contact links remain in the footer.

## Files
- `sections/pg-landing.liquid` (new): self-contained landing section. Black
  announcement bar, centered-logo header (editable logo image or text) with
  search/account/cart, anchor nav (Home, Description, Reviews, Track your
  order, Contact), product gallery with thumbnail swap, title + 5.0 rating
  row, rotating review quote card, Bundle & Save tiles (single unit and
  2-pack), black add-to-cart posting to /cart/add.js then redirecting to the
  cart page, Ships By / Easy Returns / Free Shipping info tiles, real
  payment icons via shop.enabled_payment_types, 30-day guarantee bar, and
  Description / Features / Shipping accordions. Reviews section with 5.0
  histogram and masonry cards driven by section blocks. Mobile and desktop
  CSS ship together. Native theme header, announcement marquee, newsletter
  popup and sticky ATC are hidden on the homepage only.
- `templates/index.json` (replaced): renders only pg-landing, configured for
  the R36S with 8 review blocks transcribed from the owner's screenshots.
- `sections/footer-group.json` (trimmed, theme copy only): keeps footer
  (policy/contact links, newsletter, support card), nc-contactcard and
  nc-chatfix; drops the NC homepage CRO/gift/quiz/gradient sections from
  this theme so they cannot inject NC widgets onto the new landing page.

## Pricing honesty
- Single tile shows the variant price with compare-at strike (64G $59.99,
  128G $69.99, compare $119.99).
- The 2-pack tile advertises 10% off because the store's existing automatic
  discount "10% Off (2+ Items)" applies to the R36S (it qualifies for the
  Bundle Discount Eligible automated collection), so the shown price is
  honored at checkout.

## Deliberately not copied (GMC safety)
- "SELLOUT RISK: High" fabricated urgency box.
- "Black Friday" deal labels (out of season, price claims not backed by a
  discount).
- 14-day returns copy replaced with the store's real 30-day guarantee.

## Store-state changes outside the theme
- Product `handheld-game-console` set from DRAFT to ACTIVE (required for the
  storefront to render it and for add-to-cart). Reversible via product
  status.

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
