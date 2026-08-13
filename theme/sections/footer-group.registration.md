# Section registration on the theme

The two group files are theme-editor managed, so only the delta is recorded
here. Both live in full on draft theme 162746106084.

## sections/footer-group.json — appended after `pg_mobile`, in this order

| key | type | what it does |
|---|---|---|
| `pg_acc_place` | pg-acc-place | keeps Description/Features/Shipping in the buy column |
| `pg_gallery_mobile` | pg-gallery-mobile | thumbnail carousel on phones |
| `pg_tile_copy` | pg-tile-copy | first bundle tile reads "Single Item" |
| `pg_case_mobile` | pg-case-mobile | spare-case upsell tile wraps to two rows |
| `pg_page_logo` | pg-page-logo | wordmark + black bar on page templates |
| `pg_nav` | pg-nav | bigger header links |
| `pg_reviews_text` | pg-reviews-text | white review copy on the dark canvas |

## sections/overlay-group.json — appended after `pg-footer`, in this order

| key | type | what it does |
|---|---|---|
| `pg-giftguard` | pg-giftguard | FREE GIFT badge only when a console earns it |
| `pg-chips` | pg-chips | centred, slightly larger cart pills |
| `pg-cart-mobile` | pg-cart-mobile | unpinned Your Cart bar, compact totals pane |
| `pg-no-promo` | pg-no-promo | removes expired % discount claims |

Order matters: each of these is written to win on source order or specificity
against the large pg-* layers it overrides.

## Variant IDs (case product 9185470611684)

The old single "Default Title" variant `49623692247268` no longer exists —
adding a named variant replaced it. Current, and referenced by the sections:

| variant | price | title | used by |
|---|---|---|---|
| `49640846426340` | $0.00 | Free with console | pg-giftguard (the gift) |
| `49640879063268` | $13.99 | Spare case | pg-case-add (the upsell) |

`pg-drawer` (GIFT_ID) and `pg-mobile` (CASE_VARIANT) still hardcode the dead
ID. pg-giftguard takes over placing the gift, and pg-case-add renames the
button out from under pg-mobile's handler. Both large files are untouched.

## sections/footer-group.json — `pg-hero-crop`

Registered between `pg-gallery-mobile` and `pg-tile-copy`.

| key | type | what it does |
|---|---|---|
| `pg_hero_crop` | pg-hero-crop | crops the reflection off the Crystal PokeOrb hero |

Scoped to `template.suffix == 'pg-crystal'` and to widths above 900px only.
Below that, pg-gallery-mobile deliberately sets these images to
`aspect-ratio:auto` / `object-fit:contain` — that is the fix for the mobile
hero being cropped square, so this must not reach it.

## sections/footer-group.json — `pg-page-style`

Registered last, after `pg-form`.

| key | type | what it does |
|---|---|---|
| `pg_page_style` | pg-page-style | card layout + accents for Contact and Track Your Order |

Gated in Liquid on `page.handle` (`contact`, `track-order`, `track-your-order`)
rather than by CSS, so it cannot reach product pages or the cart. It styles
layout only — field glow, focus states and the Send gradient stay owned by
`pg-form`, which stamps them per element.

## sections/footer-group.json — `pg-wordmark`

Registered last, after `pg-page-style`.

| key | type | what it does |
|---|---|---|
| `pg_wordmark` | pg-wordmark | kerns the T in POCKET ERA, header and footer |

Owns ONLY the kerning. `pe-logo` still owns the header mark's face/size/stretch/
glow and `pg-footer` the footer mark's. It splits the mark into
`POCKE` + `.pg-wm-t` + `.pg-wm-2` so the T can be moved without dragging every
other glyph, and neutralises the `letter-spacing` those two files used to set
by out-specifying them.

## sections/footer-group.json — `pg-card-crop`

Registered after `pg-hero-crop`.

| key | type | what it does |
|---|---|---|
| `pg_card_crop` | pg-card-crop | sits the orbs lower in their Best Sellers card |

Scoped by href to the orb card alone (`.pgh-card` is an `<a>`). Uses a scale +
translateY rather than `object-position`: pg-home sizes these images 1:1 and the
orb source is 1792x1800, so `object-fit:cover` trims ~4px and object-position has
no overflow to work with. The hover transform is restated in full because
pg-home's `transform:scale(1.04)` replaces rather than adds.

## sections/footer-group.json — `pg-no-cart-page`

Registered last, after `pg-wordmark`.

| key | type | what it does |
|---|---|---|
| `pg_no_cart_page` | pg-no-cart-page | the drawer is the only cart; /cart is unreachable |

Matches ONLY the cart page path (with optional locale prefix), never
`/cart/add`, `/cart/change` or `/cart/update` — those are the AJAX endpoints
every cart override posts to. Opens the drawer by dispatching a click on the
header cart icon rather than calling `window.pgOpenCart`, which appears once in
the whole theme and may not exist.
