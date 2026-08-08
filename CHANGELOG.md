# Side Sleeper Leg Pillow: photo reviews promoted to the front of the carousel

`judgeme.review_widget_data` re-synced at 2026-08-08T04:07:15Z and
`photo_gallery` came back populated — this time with images uploaded directly to
Judge.me's own S3 bucket (`me.judge.review-images/north-cove-wellness-llc/...`)
rather than the AliExpress CDN, so these are newly attached photos, not the
imported ones that were deleted.

## Change
`custom.nc_loox_rvw` reordered: the photo reviews now occupy positions 1-3,
with their image URLs attached. The remaining 24 follow in date order. Card
count stays 27; counts unchanged at 115 @ 4.70.

1. Hyman Labadie (5) - `...1786161910__1786161887237-review1__huge.jpg`
2. Ozell Nikolaus (5) - `...1786162011__1786161995693-review3__huge.jpg`
3. Loan Conroy (5)    - `...1786162033__1786162027611-review4__huge.jpg`

All three already existed as text-only cards; only the image and position
changed.

## Three, not four
The cached gallery contains three. The uploaded filenames run `review1`,
`review3`, `review4` — `review2` is absent from the cache, so a fourth photo
exists but has not been written into `photo_gallery`. Its URL cannot be derived
(the filename carries an upload timestamp). It should appear on the next
Judge.me sync of this metafield.

## Applied to
Shopify product metafields (live), product 9179026129124. No theme files changed.

---

# Side Sleeper Leg Pillow: re-sync after mixed delete + import (115 reviews)

Judge.me 98 -> **115** @ 4.70 (synced 2026-08-08T02:25Z). Because this round
both removed and added reviews, the delta no longer identifies deletions, so
every existing card was re-verified against the live caches rather than
carried forward on arithmetic.

- `loox.avg_rating` 4.61 -> **4.70**
- `loox.num_reviews` 98 -> **115**
- `custom.nc_loox_rvw` 30 cards -> **27**

## Deleted, removed from the snapshot
Kayce Yost, Florentino Bergnaum, Jeramy Jacobson — all three were in the grid
cache last sync, all three sit inside its current date window (2026-06-10 ->
2026-08-03), and all three are gone. `photo_gallery` is `null` again, so every
photo review on this product has now been deleted. The snapshot has no images.

## Verified live (17)
Present in the refreshed `reviews_grid`: Leslie Haag, Tamatha Daugherty,
Heath Huel, Lester Spinka, Bud Smitham, Ervin Conn, Hyman Labadie,
Jamika Lueilwitz, Rutha Nader, Ozell Nikolaus, Sadie Schroeder, Maureen Leannon,
Jon Wyman, Palmer Von, Carmine Anderson, Loan Conroy, Aide Feeney.

## Carried forward unverified (10)
Yuette Morar, Luigi Jast, Fletcher Kertzmann, Ai Hintz, Vernice Rohan,
Francis Thiel, Kenisha Shanahan, Hershel Batz, Giuseppina O'Kon, Casey Prohaska.

All predate 2026-06-10 and so fall outside the grid's current window, which means
neither cache can confirm them either way. Kept because every deletion observed
so far has been a photo review and none of these has a photo — an inference, not
a confirmation. If any were deleted, they are still on the page.

## New reviews not retrievable
The import added at least 20 reviews, but the newest leg pillow review is still
2026-08-03, so the additions are backdated earlier than 2026-06-10 and land on
pages 2-23. Neither `review_widget_data` (page 1 only) nor `reviews_grid` (25
most recent shop-wide) reaches them.

## Applied to
Shopify product metafields (live), product 9179026129124. No theme files changed.

---

# Side Sleeper Leg Pillow: card count 13 -> 30 after the 98-review import

Judge.me 64 -> **98** @ 4.61 (badge + `reviews.rating_count`, synced
2026-08-08T02:15Z). Nothing was deleted this round, so all 13 existing cards
stayed valid.

`shop.metafields.judgeme.reviews_grid` re-synced at 02:14:24 and the new import
pushed leg pillow reviews to the top of its 25-review shop-wide window — it now
carries **18** for this product (previously 12). Seventeen were new.

- `loox.avg_rating` 4.84 -> **4.61**
- `loox.num_reviews` 64 -> **98**
- `custom.nc_loox_rvw` 13 cards -> **30**, three with photos
  (Kayce Yost, Florentino Bergnaum, Jeramy Jacobson)

Footer reads "Showing 30 of 98 reviews."

## Note on the grid window
`reviews_grid` holds only the 25 most recent reviews shop-wide, so its reach for
any one product moves over time. It currently reaches back to 2026-06-15; the
older cards (Loan Conroy and earlier) are no longer in it and are carried
forward from prior captures. They remain valid — the count rose, so nothing was
removed.

## Ratings now include low scores
The import brought the first sub-4 reviews: Jon Wyman (1, non-delivery,
refunded), Jeramy Jacobson (1, has a photo), Lester Spinka (2, "Bespontova"),
Hershel Batz (3). All included verbatim, which is why the aggregate moved to
4.61. Two cards have the product name as their entire body (Kayce Yost,
Florentino Bergnaum) — both are photo reviews, so the image carries the card.

## Applied to
Shopify product metafields (live), product 9179026129124. No theme files changed.

---

# Side Sleeper Leg Pillow: card count 7 -> 13 from the shop reviews_grid cache

## New source
`shop.metafields.judgeme.reviews_grid` (json) is a shop-wide Judge.me cache that
re-syncs on every review change — it updated at 2026-08-08T00:41:32Z. Its
`product_reviews.reviews` array held 25 reviews across products, **12 of them
for the leg pillow**, complete with names, ratings and bodies.

This is a second retrievable source alongside the per-product
`judgeme.review_widget_data` (page 1 only) and its `photo_gallery` (now empty).

## Result
`custom.nc_loox_rvw` 7 cards -> **13**. Seven new, all verbatim from the grid
cache: Fletcher Kertzmann, Ai Hintz, Vernice Rohan, Francis Thiel, Hershel Batz
(3-star), Giuseppina O'Kon, plus Kenisha Shanahan already held. Casey Prohaska
kept from the earlier capture; he is not in the grid's 12 but the deletion
deltas are fully accounted for. Ordered newest-first by `created_at`.

`loox.num_reviews` (64) and `loox.avg_rating` (4.84) unchanged — still correct.
Footer reads "Showing 13 of 64 reviews."

## Why 13 and not 15
Thirteen is every distinct leg pillow review body reachable from Shopify. Checked
and exhausted: `review_widget_data.reviews` (5, page 1 of 13),
`review_widget_data.photo_gallery` (null since the photo reviews were deleted),
`reviews_grid` (12), `trust_badge.modal_data` (no review bodies), and the
`all_reviews_0` / `featured_carousel` / `popup_widget` / `html_miracle_0` shop
caches (all last synced before the import, so no leg pillow entries). The other
51 sit on pages 2-13, which Judge.me never writes to a metafield.

Raising Judge.me's reviews-per-page above 5 would cache them and lift the ceiling.

## Applied to
Shopify product metafields (live), product 9179026129124. No theme files changed.

---

# Side Sleeper Leg Pillow: re-sync after Peggie Marks deletion

Judge.me 65 -> **64** @ 4.84. `photo_gallery` is now `null` — Peggie Marks was
the last surviving photo review and has been deleted.

- `loox.avg_rating` 4.85 -> **4.84**
- `loox.num_reviews` 65 -> **64**
- `custom.nc_loox_rvw` 8 cards -> **7**, no photos remaining

Remaining cards: Carmine Anderson, Loan Conroy, Aide Feeney, Yuette Morar,
Luigi Jast (all confirmed on page 1), plus Kenisha Shanahan and Casey Prohaska
(page 2+; the 65 -> 64 delta is exactly Peggie Marks, so neither was touched).

## Why the card count cannot go back to 15
The retrievable pool has shrunk, not the display logic. `review_widget_data`
exposes only page 1 (`per_page: 5`, `total_pages: 13`) plus `photo_gallery`,
and the photo gallery is now empty because all 8 photo reviews have been
deleted. That gallery was the source of the extra cards. Seven of the fifteen
were deleted deliberately; re-adding them would put deleted reviews back on the
storefront.

The supported way to raise the count: increase Judge.me's reviews-per-page above
5 (Judge.me -> Widgets -> Review Widget). `review_widget_data.reviews` then
caches that many and the snapshot can be rebuilt from real, live reviews in one
pass. At `per_page: 50` roughly 50 of the 64 become available.

## Separate issue found, not fixed
The storefront renders a green "check Verified" badge on every review card, but
every one of these reviews carries `verified_buyer: false` and
`transparency_badges: ["review_collected_from_another_provider"]` — they are
imported, not verified purchases. The badge is not produced by `nc-enhance`
(its card markup has no such element), so something else in the live theme adds
it. This is a false trust signal on a live storefront and should be traced and
removed.

## Applied to
Shopify product metafields (live), product 9179026129124. No theme files changed.

---

# Side Sleeper Leg Pillow: purge deleted reviews from the widget snapshot

## Problem
Seven reviews were deleted in Judge.me, but they kept rendering on the product
page — including their customer photos.

## Cause
`custom.nc_loox_rvw` is a **static snapshot**, not a live feed. `nc-enhance`
renders its cards straight from that metafield, so a deletion in Judge.me
updates Judge.me's own metafields (`badge`, `review_widget_data`,
`reviews.rating_count`) but leaves the snapshot untouched. The deleted reviews
stay on the storefront until the snapshot is rewritten by hand.

This is inherent to the snapshot design and applies to **every** product using
`custom.nc_loox_rvw`, not just this one.

## Reconciliation
Judge.me went 72 -> 65 @ 4.85. Cross-checked all 15 snapshot cards against the
current `reviews` (page 1) and `photo_gallery` arrays. All 7 deletions were
photo reviews, and they account for the full 72 -> 65 delta:

Deleted (removed from the snapshot): Jessica Wunsch, Delmar Lebsack,
Deloras Schaden, Bonnie Balistreri, Terrence Swift, Adelaida Stamm, Tamara Moore

Confirmed still live in Judge.me: Carmine Anderson, Loan Conroy, Aide Feeney,
Yuette Morar, Luigi Jast (page 1), Peggie Marks (photo gallery)

Kenisha Shanahan and Casey Prohaska sit on page 2+ so are not directly visible,
but the 7-review delta is fully explained by the photo deletions, so both were
kept.

## Result
- `loox.avg_rating` 4.83 -> **4.85**
- `loox.num_reviews` 72 -> **65**
- `custom.nc_loox_rvw` 15 cards -> **8** (one with a photo, Peggie Marks)

Page reads "Based on 65 reviews", "Showing 8 of 65 reviews."

## Standing risk
Every future Judge.me edit (import, delete, reply) desyncs this snapshot again
and it must be re-reconciled by hand. The durable fix is to have `nc-enhance`
render from `judgeme.review_widget_data` directly — page 1 plus `photo_gallery`
are already in that metafield and Judge.me keeps them current — instead of from
`custom.nc_loox_rvw`. Not done here; it is a theme change beyond this task, and
Admin API theme writes are blocked against the live theme.

## Applied to
Shopify product metafields (live), product 9179026129124. No theme files changed.

---

# Side Sleeper Leg Pillow: review widget refreshed to the 72-review import

## What changed
A second Judge.me import took the product from 13 reviews @ 5.00 to **72 reviews
@ 4.83** (`judgeme.badge` / `reviews.rating_count`, synced 2026-08-08T00:27Z).
Updated the three metafields the PDP widget reads:

- `loox.avg_rating` 5.0 -> **4.83**
- `loox.num_reviews` 13 -> **72**
- `custom.nc_loox_rvw` 5 review cards -> **15**, eight of them with customer photos

## Where the 15 bodies came from
`judgeme.review_widget_data` still caches only page 1 of the widget
(`per_page: 5`, now `total_pages: 15`), but this sync also populated a
`photo_gallery` array carrying 8 further complete reviews — name, rating, body
and picture URLs. Union of:

- `reviews` (page 1): 5 — Carmine Anderson, Jessica Wunsch, Loan Conroy,
  Aide Feeney, Yuette Morar
- `photo_gallery`: 8 — Delmar Lebsack, Deloras Schaden, Bonnie Balistreri,
  Peggie Marks, Terrence Swift, Adelaida Stamm, Tamara Moore (+ Jessica Wunsch,
  deduped by uuid against page 1)
- 3 captured from the earlier 13-review sync and still present in the 72:
  Luigi Jast, Kenisha Shanahan, Casey Prohaska

All verbatim, real names, real star ratings (4s and 5s preserved, not flattened
to 5). Ordered newest-first by `created_at`. Photo URLs are the AliExpress CDN
originals Judge.me itself serves.

## What the page shows now
"Based on 72 reviews" at 4.8 stars, 15 cards in the carousel, footer note
"Showing 15 of 72 reviews." The `nc-enhance` histogram is computed from the 15
card ratings, so the star bars reflect the cards rather than the full 72.

## Still capped
The remaining 57 bodies are not reachable from Shopify — only page 1 plus the
photo gallery are cached, and judge.me / the storefront are blocked by the
egress policy. Raising Judge.me's reviews-per-page above 72 would cache them all
and let the full set be pulled in one pass.

## Applied to
Shopify product metafields (live), product 9179026129124. No theme files changed.

---

# Side Sleeper Leg Pillow: reviews now render in the standard PDP review widget

## Problem
Reviews for the Side Sleeper Leg Pillow were imported into Judge.me, but the
product page showed no reviews at all — no star row, no "What customers say"
block — while every other PDP shows them.

## Cause
The PDP review UI is `sections/nc-enhance.liquid`, and it is **not** driven by
Judge.me. It gates on `product.metafields.loox.num_reviews > 0`, and renders its
cards from `product.metafields.custom.nc_loox_rvw` (JSON:
`{"reviews":[{"n":name,"t":text,"img":url,"r":rating}]}`). When
`loox.num_reviews` is missing it hides the `.nc-stars2` row entirely and renders
nothing.

`templates/product.nc-legpillow.json` already includes the `nc-enhance` section
in the same position as every other `product.nc-*.json`, so no template or
theme-file change was needed. The product was simply missing the three
metafields the widget reads.

## Fix
Set on product 9179026129124 (`side-sleeper-leg-pillow`) via Admin API
`metafieldsSet`, matching the shape used by the other PDPs:

- `loox.avg_rating` (number_decimal) = `5.0`
- `loox.num_reviews` (number_integer) = `13`
- `custom.nc_loox_rvw` (json) = the 5 reviews readable from
  `judgeme.review_widget_data`, verbatim, with real reviewer names and 5-star
  ratings. No photos (the Judge.me import carried none).

`reviews.rating` (5.0) and `reviews.rating_count` (13) were already correct and
were left alone.

## Known gap
`judgeme.review_widget_data` only caches **page 1** of the Judge.me widget
(`per_page: 5`, `total_pages: 3`), so only 5 of the 13 review bodies are
reachable from Shopify, and judge.me / the storefront are both unreachable from
this environment. The widget handles this honestly: the summary reads "Based on
13 reviews" and the footer reads "Showing 5 of 13 reviews." Dropping the
remaining 8 bodies into `custom.nc_loox_rvw` will make it read "Showing all 13
reviews." like the other products.

## Note on the Loox side
This does not put the reviews into the Loox app itself — that needs the Loox
dashboard. The PDP widget does not read from Loox at runtime for these products;
it reads the metafields above, which is why the page now matches the others.

## Applied to
Shopify product metafields (live). No theme files changed.

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
