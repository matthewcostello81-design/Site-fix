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

# Site fix: wood roller single price on Add-to-Cart button

## Problem
On the Birchwood Massage Roller Set page, the bundle widget
(`sections/nc-cro.liquid`) showed "Add Single — $79.99" when the **Wood Roller**
variant ($24.99) was selected. The single tier card correctly showed $24.99, so
the orange button and the card disagreed.

## Cause
The single button label (and the sticky-bar single price) used the hardcoded
bundle base `B.main.pr` instead of the selected variant's live price.

## Fix
Scoped strictly to the Wood Roller variant (id `49493167046884`) via an
`isWR()` check. When that variant is selected, the "Add Single" button and the
sticky-bar single price read the live price the single tier already shows
($24.99); in every other case (5 Piece Set, all other products) the original
code runs unchanged. Bundle (Duo/Kit) pricing and add-to-cart behavior were left
exactly as they were.

## Applied to
Shopify draft theme `161868382436` ("NC Polish round 2 + reviews (Claude)") via
the Admin API (themeFilesUpsert), byte-verified against this branch. The
live/MAIN theme does not use this section.

Files changed:
- sections/nc-cro.liquid (Wood-Roller single price on Add button + sticky bar)
