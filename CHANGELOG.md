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

