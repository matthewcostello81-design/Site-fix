# Mobile cart: upsell rail moves to the top

## Change
On phones (<=760px) the upsell rail is now seated at the top of the cart,
immediately above the "Your Cart" bar, instead of being moved down into the
pinned totals pane. Desktop is unchanged. This is `placeUnlock()` in
`sections/pg-cart-mobile.liquid`, which moves `#pg-unlock-slot` as one unit --
so it applies to every cart and every product's offer at once, not just the
wall art.

## Why it was at the bottom
Rule 5 of that file deliberately put it there ("directly above Shipping
Protection"). That is now reversed per the owner's request.

## The hazard that rule was avoiding, and why the top is safe
The rail cannot simply be parked just ABOVE the pane. `.sticky-in-panel` is
`position:sticky; bottom:0`, and a bottom-anchored sticky box is lifted up out
of its flow position; anything unpositioned it is lifted across is painted over,
and the pane is opaque white at z-index:5. The pane's previous sibling is
exactly what gets covered -- a measured 291px pane at y=553..844 over an offer
row at y=535..799. Moving it INTO the pane was the original workaround. Moving
it to the top of the drawer avoids the pane entirely, which is why that is the
destination rather than "just above the pane".

## No new writer conflicts -- two old ones removed
`.pg-cart-top` is created by pg-drawer's `pgPane()` as `#cart`'s first child and
is only ever re-created when missing, never repositioned, so nothing contends
for the place in front of it; rule 1 already forces it to `position:static`.

Leaving the pane also ends two fights the old placement had to manage: the
first-child contest with `#pg-rush` (pg-cart-timer's countdown, which
re-inserted itself at `pane.firstChild` -- the two traded places roughly 8-9
times a second while an offer window was open), and the contest with
`placeSpacer()` over the pane's previous sibling.

## Notes
- `window.pgPaneAnchor` is kept. pg-unlock still births the slot inside the pane
  on a narrow viewport, then calls `pgPlaceUnlock()` synchronously in the same
  task, so the slot is relocated before paint and there is no visible teleport.
  Dropping the export would leave pg-unlock inserting at `pane.firstChild` and
  fighting `#pg-rush` for a tick on every rebuild.
- `topAnchor()` skips the card itself when picking a fallback anchor. Without
  that, a slot already sitting first would be compared against itself, never
  read as seated, and re-inserted on every 60ms observer tick forever.
- `pgCartFlush` raised 2 -> 3, per the file's own rule: an older copy still live
  in a theme would otherwise claim the flag and silence this one.
- The frame upsell is deliberately not moved. It sits below the cart lines at
  every width, which is where it was asked for and is already consistent between
  desktop and mobile.

# Cart: frame upsell was clipped by the pinned pane

## Cause
`.sticky-in-panel` -- the pane holding the EXTRA 10% OFF bar, totals and
checkout button -- is `z-index:5` and paints over the scrolling item region
rather than being laid out after it. The upsell card is the last element in
that region, so its bottom edge sat underneath the pane.

The card's `margin-bottom:4px` was meant to be its clearance and could never
provide it: a last child's bottom margin is not included in a scroll
container's scrollable overflow, so the browser reports no further scroll and
the space simply does not exist. Padding is included; margin is not.

## Fix
The card is now wrapped in `.pg-fup-wrap`, which carries `padding-bottom:18px`.
The card keeps its own top margin and gains a little internal bottom padding
(`11px 13px 13px`), and the price pill got `line-height:1.5` so the glyphs are
not tight against the pill edge.

`render()`'s presence check and removal now target `.pg-fup-wrap` rather than
`.pg-fup` -- targeting the inner card would have removed it and left the empty
wrapper behind on every cart change, stacking one 18px gap per change.

# Cart: frame upsell was invisible because the frame was unpublished

## Cause
`Black Wood Frame (30x40cm)` (9198161232100) was ACTIVE but had `publishedAt:
null` and zero resource publications -- it was not on the Online Store sales
channel, or any other. The upsell reads the live price from
`/products/{handle}.js`, which 404s for an unpublished product, so `loadFrame()`
never resolved, `render()` took its "price not known yet: show nothing" exit on
every pass, and the row never drew. `/cart/add.js` would have rejected the
variant as well, so even a hardcoded price would only have moved the failure
from the render to the ADD button.

This was not the section-group cap. That was a real second fault -- the row was
registered as the 25th entry of footer-group, which silently drops its tail --
and folding the code into `nc-linesave.liquid` fixed it, but it was masking
this one, not causing it.

## Fix
Published the product to Online Store only (publication 187297399012).
Deliberately not to Shop, Google & YouTube, Facebook & Instagram, Pinterest or
the other channels: it is a cart accessory, not something to advertise
standalone. It is now reachable at its product URL, which is the cost of having
the storefront JSON and cart endpoints serve it.

## Note for next time
The row failing closed -- showing nothing rather than a made-up price -- is the
right behaviour and stays. But it means a broken product feed looks exactly
like a broken theme file. Check `onlineStoreUrl` on any product a cart script
fetches before touching the theme.

# Cart: wall-art frame upsell

## Change
A frame upsell row now renders in the cart between the line items and the
EXTRA 10% OFF bar: 52px thumb, "Add a Black Wood Frame", the 30x40cm size line,
a price pill, and an outlined ADD button. Styling is borrowed wholesale from
pg-unlock's rail so the two read as one system.

## Only on wall-art carts
It renders only when the wall-art handle is in the cart, and removes itself
once the frame is in there too, so it never asks twice. The frame is 30x40cm
and so is the print; on an orb or console cart it would be an accessory for
something the shopper is not buying.

## Price is fetched, not typed
`/products/{frame-handle}.js` supplies the live variant id, price and image. If
the frame is ever repriced the row follows instead of advertising a stale
$14.99, and if the fetch fails the row does not render rather than showing a
made-up figure. The ADD button always adds the variant the row priced.

## Why it lives in nc-linesave.liquid
It shipped first as its own `sections/pg-frame-upsell.liquid` and never
appeared. A section needs a section group to run; footer-group is at Shopify's
25-section cap, and a group at the cap accepts a new section over the API,
reports it back correctly, and then silently drops the tail at render time.
pg-unlock carries the same warning in its header for the same reason.
`nc-linesave.liquid` already renders via overlay-group (position 11), so the
row is folded in there under its own `.pg-fup` namespace. The standalone file
is emptied to a note; theme file deletion is blocked by the API, so it needs
removing from admin if it should be gone entirely.

## Not classed .pg-unlock
pg-unlock's `render()` sweeps `#cart .pg-unlock` and removes every row whose
`data-pg-unlock` handle is not one of its own offers. A frame row is a stray by
that test, so only the styling is borrowed, not the class.

## Scope
Applied to theme 163087941860 ("NEW COPY. ADDING FRAME UPSELL FOR WALL ART",
unpublished). `sections/footer-group.json` was restored to its original
24-section content after the failed registration.

---

# Wall art: new gallery video

## Change
`gallery_video_url` in `templates/product.pg-wallart.json` now points at the
video uploaded to Files on 20 Aug (`hf_20260820_024658_...mp4`, 1440x1570,
4.3s), replacing `heroic-wall-art-loop.mp4`. Same HD-1080p rendition tier as
before.

## Looping
No change needed. `sections/pg-landing.liquid` renders the tag as
`<video ... autoplay muted loop playsinline preload="metadata">`, so `loop` is
already on it and applies to whatever URL the setting holds.

## Note
The old clip was 1440x1920 (3:4); the new one is 1440x1570 (~11:12), so the
video block is shorter on desktop, where it renders at its natural aspect.
Under 900px it is unaffected, being forced to 1:1 with object-fit:cover.

---

