# Cart: no upsell rail for the Crystal Orbs

## What changed
The cart's offer rail no longer prompts for the Crystal Legends Orb. The wall
art and R36S rails are untouched, and NOTHING about the orb's product page
changed -- it still sells Buy 2 Get 1, Buy 4 Get 2 and Buy 5 Get 3 from its own
tiles.

## Where
sections/pg-unlock.liquid, which is the cart rail and only the cart rail: every
render path in it writes into `#cart` and bails when there is no drawer, so it
cannot reach a product page. One list and one guard:

    var NO_CART_RAIL = ['pokemon-crystal'];
    ...
    if (railSuppressed(it.handle)) return;   /* inside offers() */

offers() is the single choke point -- it has exactly one caller, and LADDERS is
read nowhere else in the file -- so filtering there removes the offer at source
rather than hiding a row that still exists.

Matched on a handle FRAGMENT, the way pg-cart-imglink's SKIP list works, so
renaming the product around it cannot quietly switch the rail back on.

The ladder itself stays in LADDERS. It is the record of what the product page
sells, and a shopper can still be HOLDING free orbs earned there, so it is worth
keeping accurate. Putting the rail back is deleting one line.

## Why not CSS
Hiding the row with `display:none` was rejected. pg-unlock reconciles the rail
against its own `want` map on every render and re-inserts anything missing, so
an external remover would fight it -- but a CSS hide would leave the row in the
DOM, which means `#pg-unlock-slot` is never `:empty`, pg-frame-add's focusOne()
still counts it as a candidate, and the chooser still gets built for a row
nobody sees. Suppressing the offer is the honest version of what was asked.

## The emptied rail takes no space
    #cart #pg-unlock-slot:empty{display:none !important}

An orbs-only cart now leaves that container with no children. It has no padding
or min-height of its own, but pg-cart-timer's small-phone block gives it
`margin:6px 0`, which would be 12px of gap under 414px for a rail that is not
there. `:empty` matches only a node with no children AND no text, and the slot
is built purely by appendChild, so it can never hide a populated rail.

## Measured in a Chromium harness running the real cart sections, both widths
Desktop 1280 and mobile 390, identical results:

    cart                        BEFORE                     AFTER
    orbs only (2)               1 rail  (orb)              0 rails
    orbs (2) + wall art (1)     2 rails (orb + wall art)   1 rail  (wall art)
    wall art (2) + console (1)  2 rails (art + console)    2 rails (unchanged)

And on a genuine orbs-only cart (orb lines only in the DOM as well as in
/cart.js), so the frame offer is not in the slot either:

    BEFORE  orb rails=1  slot kids=1  display=flex  height=112px (desktop) / 70px (mobile)
    AFTER   orb rails=0  slot kids=0  display=none  height=0px   (both)

Uploaded checksum 4c8d6262e5e5ec76f7630dc00f92ed90 matches the local file byte
for byte. Deployed to "No orb cart upsell (Claude 8-23)" (163147448548), a fresh
duplicate of the live theme taken for this change -- verified byte-identical to
live on pg-unlock, pg-landing, pg-wallart-gallery, pg-cart-timer, layout/theme,
the wall-art template and config/settings_data.json before patching. Every
pre-existing draft was unsuitable: one was stale enough to revert the PDP
gallery work, the others differed from live in settings_data.json. Needs
publishing.

---

