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
