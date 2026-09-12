# Dragon Ball Z Legends Lamp: new product page (pg-dbz template)

## What
A product page for the Dragon Ball Z Legends Lamp built on the same
`pg-landing` section as the R36S and Crystal Legends Orb pages, with the
R36S page's mobile treatment (`pg-r36s-mobile`: one swipeable gallery,
in-tile ADD TO CART, centred title) and the orb page's picker sizing
(`pg-pick-size`). Desktop keeps pg-landing's two-column layout.

## Bundle tiles
`pg-theme-css` (window.pgLadder) already builds a four-rung ladder on every
product page; its first three rungs are exactly the offers wanted here:
Single, Duo Pack (2nd 25% off) and Trio Pack (3rd 50% off). The new
`sections/pg-dbz-tiles.liquid` edits that ladder after it is built, the way
`pg-tile-copy` does on the orb: removes the Quad rung, rewords the tiles for
a lamp (chips, "2nd Lamp = 25% OFF!", "Choose your characters"), restates
the pack prices in whole cents, adds SAVE badges (floored) and the R36S-style
one-line tier note under each tile's pickers.

## Checkout
Two automatic BXGY discounts back the tiles, both ACTIVE and repeating:
`DBZ Lamp - 2nd Lamp 25% Off` (buy 1, get 1 at 25%) and
`DBZ Lamp - 3rd Lamp 50% Off` (buy 2, get 1 at 50%). Tile prices at the
$59.99 unit: Duo $104.98, Trio $149.98 (rounded up, so the cart can only
ever land a cent under the tile).

## Product
Handle changed to `dragon-ball-z-legends-lamp` (old handle redirected),
template suffix `pg-dbz`, SEO title and description set. Left in DRAFT.

## Applied to
Theme "Extra 5% off (Claude 9-11e)" (also present on "Duo case wording
(Claude 9-10c)", where they were first written by mistake). Files added:
sections/pg-dbz-tiles.liquid, templates/product.pg-dbz.json

---

