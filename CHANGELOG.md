# Wall art slideshow: playback speed is per clip

## Change
The global 2.5x is now `r` on each `VIDS` entry. The original Legendary Poke
Trio clip runs at 1 (normal speed); the nine newer clips stay at 2.5.

## Where it is applied
Same three points as before, now reading `VIDS[i].r` instead of one constant:
- `defaultPlaybackRate`, set just before the source is attached, because
  `load()` restores an element to its defaults and `playbackRate` is one of the
  things it clears.
- `playbackRate` at the swap, for browsers that do not carry the default onto a
  newly attached source.
- `playbackRate` again inside `kick()`, which now takes the rate as an argument
  -- it is the only code that runs after a retried `play()`.

The blanket `defaultPlaybackRate` that was set once per element at creation is
gone: with two elements shared by ten clips of differing speeds, a rate baked
into the element is wrong as soon as it is reused. It belongs to the clip, not
the element.

# Wall art slideshow: 2.5x playback

## Change
Every clip in the gallery slideshow plays at 2.5x. One constant, `RATE`, at the
top of the script.

## Set in three places, deliberately
- `defaultPlaybackRate` when each `<video>` element is created. `load()` resets
  an element to its defaults, and `playbackRate` is one of the things it resets
  -- setting only `playbackRate` up front would be undone by the first slide
  load.
- `playbackRate` again in `swap()`, for browsers that do not apply
  `defaultPlaybackRate` to a newly attached source.
- `playbackRate` once more inside `kick()`, the play watchdog. That is the only
  code that runs after a retried `play()`, so it is the last chance to catch a
  rate a load-in-flight reset back to 1.

Nothing here changes the source files; it is a playback property on the two
video elements, so it applies to all ten clips including the original.
# Wall art slideshow: overlapping show() calls froze the early slides

## Symptom
Slides 1 and 2 (Blue Eyes / Dark Magician / Red Eyes, and Gengar Evolution)
arrived stopped on their first frame. Paging past them and back played them
normally. Slides 3-9 were never affected.

## Cause
`show()` picked its incoming element as "whichever one is not `front`". That is
only true when no other slide is mid-load. With two `show()` calls overlapping,
`front` still pointed at the visible clip, so the second call chose the element
the shopper was watching: it reset that element's `src`, then in `swap()` added
its own `on` class and immediately removed it again (`outgoing` and `incoming`
were the same element), and the outgoing timer paused it 320ms later. The
visible slide ended up invisible and stopped, and the first call's swap was
already dead on the token check, so nothing recovered it until the next
`show()` -- a page past and back.

Only the earliest slides could hit it, because overlapping requires a second
request to land while the opening clip is still loading.

## Fix
- `inflight` tracks the element a pending load owns, and `show()` reuses it
  instead of re-deriving one from `front`. The visible element can no longer be
  hijacked, and a guard bails if it somehow would be.
- `outgoing` is read inside `swap()` rather than captured when `show()` started,
  so it reflects what is actually on screen at swap time.
- The outgoing pause is guarded on `outgoing !== front` rather than a token
  match. The old check let a superseded clip keep playing forever, and could
  pause whatever had since become visible.
- Stale `loadeddata` listeners are removed before a new one is attached:
  `once:true` only detaches a listener that actually fired, and a superseded
  load never fires.
- `kick()` re-asks a slide to play up to five times over a second if it is still
  paused, so a refused or badly-timed `play()` cannot leave a frozen frame.

# Wall art slideshow: one box for all ten slides

## Change
Every slide is now 990x1080, the original clip's shape, at every width. The nine
newer clips are zoomed (`z: 1.66` per entry) so their pillarbox is pushed off
both edges and clipped by the stage's `overflow:hidden`.

## Why a zoom and not a fit
`cover` fits the file's height to the box, which leaves the footage at
(footage aspect / box aspect) of the box width -- 0.61 in theory for 9:16 in
990x1080, about 0.64 as measured on the page. Both are short of the edges, and
cover only crops what overflows, so it could never reach them. Scaling the
element past 1 is the only way to make tall footage fill a wider box.

1.66 clears both the theoretical fill (1/0.61 = 1.63) and the measured one
(1/0.64 = 1.56) with a few percent to spare. A visible bar is the failure that
matters here; a few extra cropped pixels are not.

## What it costs
About 40% of each of those nine clips is cropped vertically, a fifth off the top
and a fifth off the bottom. This is inherent: 9:16 footage cannot fill a 0.9167
box any other way. The clips are centre-framed on the poster, so the crop takes
room rather than subject.

Re-encoding the nine to 990x1080 with the footage centred would let every `z` go
back to 1 and cost no crop at all. That is the permanent fix if the crop reads
badly.

## Mobile
Same box, same zoom, at every width -- the old 1:1 override is gone, since a
square box was simply another box too wide for the footage.

# Wall art slideshow: each slide sized to its own footage

## Cause of the leftover black sides
`cover` only crops what OVERFLOWS the box. The footage inside the nine 1920x1080
files is roughly 9:16 (0.5625); the box was the original clip's 990x1080
(0.9167). Scaled to that box the footage does not overflow sideways -- it falls
short, covering 0.5625 / 0.9167 = 61% of the width, leaving the other 39% black.
Cover cannot remove a bar that the box is too wide to hide. Sizing the box down
to the footage is the only thing that does.

## Fix
Each entry in `VIDS` now carries an `ar`, and the stage takes that ratio as the
slide appears. The nine new clips use 11/20 (0.55) and the original keeps
990/1080, so every clip is shown whole with no bars and no meaningful crop.

11/20 rather than 9/16 on purpose: a shade narrower than the footage, so cover
trims roughly 1% off each side. That is invisible, and it means a clip whose
pillarbox is not perfectly symmetric still cannot show a sliver of one.

## Mobile
The 1:1 override is gone. A square box is just another box too wide for 9:16
footage -- it would have shown the same bars (the footage covers 56% of the
width there). The per-slide ratio now applies at every width, so phones play
these vertical clips vertically, which is how they were shot.

## Known trade-off
The slot changes height between the original clip and the other nine, because
they genuinely are different shapes. Re-encoding the original to match the rest
is what would settle it.

# Wall art slideshow: original video's shape, cropped to fill

## Change
The slideshow stage is now 990x1080 -- the natural size of the original gallery
video, which is what set the height of that slot before there was a slideshow
(pg-landing gives the video no aspect at all). Slides use `object-fit:cover`
instead of `contain`.

## Why contain was wrong
The nine new clips are 1920x1080 files with portrait footage pillarboxed inside
them: the black bars are baked into the frames, not letterboxing added by the
layout. Reading them as genuine 16:9 content, the first version sized the stage
to 16:9 and fitted each file inside it, which kept every one of those baked-in
bars on screen and shrank the footage to boot.

`cover` scales the file until it fills the box and crops whatever overflows --
and against a portrait box, what overflows a pillarboxed file is exactly those
bars. Do not switch this back to `contain` without re-encoding the clips to
portrait first.

## Mobile
Unchanged in effect: still the 1:1 square. The per-breakpoint `object-fit`
override is gone because `cover` is now the rule at every width.

# Wall art: per-variant video slideshow

## Change
The single gallery video at the top of the wall art PDP is now a ten-slide
video slideshow, one clip per variant, with arrows and dots. Selecting a design
anywhere on the page moves the slideshow to that design's clip.

## Video mapping
Nine clips were uploaded to Files, named after their variants. The tenth slide
is the clip already on the page: it is the Legendary Poke Trio design, which is
the one variant with no new upload, so the ten slides cover the ten variants
exactly.

| Variant | Clip |
|---|---|
| Legendary Poke Trio | the existing gallery video |
| Blue Eyes, Dark Magician, Red Eyes | Blue EYES FINISHED |
| Gengar Evolution | Gengar FINISHED |
| Blastoise Evolution | Blastoise FINISHED |
| EX Legendary Poke Trio | EX Legendary Poke Trio FINISHED |
| Eeveelutions | Eeveelutions FINISHED |
| Mewtwo EX, V, V Star | Mewtwo EX, V, V Star FINISHED |
| One Piece | One Piece FINISHED |
| Dragon Ball | Dragon Ball FINISHED |
| Goku | Goku FINISHED |

The 720p renditions are used, not the 1080p ones: the slot is at most half a
desktop column wide and a square crop on a phone, so 1080p is bytes nobody sees.

## Which selects drive it
A delegated `change` listener on the document, matching any `<select>` whose
value is one of the ten variant names. That covers the buy-box dropdowns and
the variant picker inside the cart drawer in one rule. Delegation is required
for the cart: that picker is rebuilt from scratch on every cart change, so a
listener bound to the element would be discarded with it.

## Why it lives in pg-wallart-gallery.liquid
`pg-landing.liquid` renders the gallery, but it is shared by the homepage and
five product templates and knows about exactly one video, from its
`gallery_video_url` setting. Adding a per-variant video list there would push
wall-art-only markup into every page using it. This file is scoped to the wall
art template, so the feature is contained and pg-landing is untouched. The JS
takes the `.pgx-vid` slot over at runtime; if it never runs, pg-landing's
original single video is still what renders.

## Two video elements, not ten
Ten `<video>` tags would open ten connections for clips nobody asked for.
Swapping `src` on one element blanks it to black the instant the source is set,
which is a visible flash on every variant change. So there are two stacked
elements: the incoming clip loads at opacity 0 and is faded in only once it has
frames, and the outgoing one is paused after the fade. `preload="none"` means
nothing past the first clip is fetched until it is asked for. A `token` counter
makes a later request win, so fast clicking through the dots cannot land on a
stale clip, and an 1800ms fallback swaps anyway if `loadeddata` never fires.

## Aspect
The nine new clips are 16:9; the original Legendary Poke Trio clip is portrait
(990x1080). The desktop stage is locked to 16:9 with `object-fit:contain`, so
changing variant never changes the height of the gallery column -- the odd
portrait clip letterboxes against the dark ground instead of resizing the page.
Mobile keeps pg-landing's existing 1:1 cover behaviour.

## Scope
Applied to theme 163115139300 ("Simpler cart + frame add-on (Claude)",
unpublished). `gallery_video_url` was deliberately left set, as the no-JS
fallback.

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

