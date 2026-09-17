# Draft theme "Lamp off + promo emails (Claude 9-17)": lamp removed, promo emails rebuilt

## What changed
- New draft theme `164109877476` ("Lamp off + promo emails (Claude 9-17)"),
  duplicated from the live theme `164085727460` ("Copy of Power Ball 12k").
  Nothing on the live theme was touched.
- Dragon Ball Z Legends Lamp (`dragon-ball-z-legends-lamp`, the Goku lamp) set
  to DRAFT, which removes it from the online store, search, collections and
  the Snapchat Ads channel. The product, its photos and its template
  (`templates/product.pg-dbz.json`, `sections/pg-dbz-*`) are kept so it can
  be relisted.
- `templates/index.json`: the homepage "Best Sellers" block that pointed at
  the lamp (`prod4`) is removed. `pg-home` already skips blank products, so
  the live homepage simply drops the card until the draft is published.
- Cart upsell (`sections/pg-cart-offer.liquid`) keeps its lamp ladder code:
  it only runs when a lamp is in the cart, and its product fetch returns null
  for an unpublished product, so it goes quiet on its own. The two lamp
  automatic discounts ("DBZ Lamp - 2 Pack" and "3 Pack") are inert with no
  purchasable lamp and were left in place.

## Promo emails (`emails/`)
- `abandoned-checkout.liquid`: Shopify notification template for the
  abandoned checkout email, on-brand (Poppins, purple #7A2FA2 / #4A1C66, dark
  footer) and fluid so phones stop rendering it in half the screen.
- `win-back-promo.html`: responsive marketing "come back" email for any ESP,
  plus a Shopify Email build sheet in `emails/README.md`.
- Both quote only live automatic discounts (extra 5% off, buy 2 get 1 free on
  orbs and wall art).

## Applied to
Shopify draft theme `164109877476` via Admin API (themeDuplicate,
themeFilesUpsert). Files changed: templates/index.json. Product status change
via productUpdate.

---

