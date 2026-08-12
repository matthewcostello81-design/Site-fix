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
