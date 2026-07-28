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

# Promo: free 5-level resistance band set with any purchase

## Goal
Give away a set of 5 resistance bands with every order:
- A premium note on every product page and one on the homepage.
- The gift product must not appear anywhere on the storefront until it lands
  in the cart.
- It must be auto added whenever any other item is added to the cart.
- It must be free (100% off).

## The product
`Resistance Bands (5 Levels)`
handle `resistance-bands-exercise-set-fitness-workout-stretch-elastic-loop-legs-therapy`
product `9156210950372` / variant `49500067102948`

Admin API changes:
- price `19.99` to `0.00`
- compareAtPrice `24.34` to `null`
- inventoryPolicy `DENY` to `CONTINUE`, so the gift can never fail to add once
  the 20 tracked units run out
- removed from the manual collection `Household Supplies`

Price 0.00 with no compare-at price also drops it out of both smart collections
for free, with no theme work needed:
- `Shop All` rule is VARIANT_PRICE > 0
- `Summer Sale` rule is VARIANT_COMPARE_AT_PRICE > 0

The product stays published to the Online Store. That is required: an
unpublished product returns 422 from `/cart/add.js` and could not be gifted.

## The theme (`sections/nc-gift.liquid`, new)
One section, registered globally through an `nc_gift` entry in
`sections/footer-group.json`, so it runs on every template.

**Notes.** A cream/teal card injected under the buy box on every product page
(`#shopify-section-main-product form[action*="/cart/add"]`, falling back to
`#ncpdp .nc-buybox`), and a deep teal band injected after the hero on the
homepage (`#nc-home .nch-hero-in`). Both ship desktop and mobile CSS.

**Hiding the product.** Two layers:
- CSS `:has()` rules scoped to the collection grid, recommendations,
  predictive search, and search results.
- A JS pass (`hide()`) that walks every `a[href*=<handle>]`, skips anything in a
  cart context, and hides the enclosing card. A MutationObserver re-runs it so
  async surfaces (predictive search) are covered too.
- Its own product page redirects to `/`, except in the theme editor.

Cart context is detected by class/id name and by the cart page form, explicitly
excluding a product card's own quick-buy `/cart/add` form. Without that
exclusion the gift's own cart line would get hidden.

**Auto add.** `sync()` reads `/cart.js` and reconciles: no other items means
remove the gift, other items with no gift means add it, gift at the wrong
quantity means force it back to 1. It is triggered on page load and by a
`window.fetch` wrapper that holds the theme's own `/cart/add` promise open
until the gift is in, so whatever the theme renders next (cart drawer, cart
page) already includes it. An XHR wrapper covers themes that do not use fetch,
and a plain form POST is caught by the page-load pass.

Because a removal is itself a `/cart/change` call, it is intercepted and the
gift is re-added, so the promo self-heals.

**Cart line.** The gift row gets a `Free gift` pill and a teal tint, and its
quantity stepper and remove control are hidden.

## Known gaps, not fixed here
1. The store runs quantity-based automatic discounts (10% off at 2+ items,
   15% at 3+, all products). The gift adds a unit, so a one-item order now
   reads as 2 items and takes 10% off the real product. Switching those
   discounts from a quantity minimum to a subtotal minimum fixes it.
2. `Buy it now` and the express checkout buttons bypass the cart entirely, so
   those orders ship without the gift. Hiding the dynamic checkout buttons on
   the PDP is the fix, at the cost of express checkout.

## Applied to
Shopify draft theme `161868382436` ("NC Polish round 2 + reviews (Claude)") on
shop `v9fqfa-bd.myshopify.com`, via themeFilesUpsert. Not published.

Files changed:
- sections/nc-gift.liquid (new)
- sections/footer-group.json (registered `nc_gift`)
