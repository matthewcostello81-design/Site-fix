# Wall art PDP: remove the frame add-on tile

## Change
pg-frame-add had three surfaces; the product-page one is gone at every width.
What went:

- the `.pgx-case.pgx-frame` tile built above ADD TO CART
- `tile()` and its `onPrintPage()` guard, and the `tile()` call in `pass()`
- the whole `.pgx-frame-add` style block, including the `max-width:600px`
  two-row override that restated pg-case-mobile's phone layout for it
- `.pgx-frame-add` from the delegated click selector
- the `pgOpenCart()` call after a successful add, which existed only to open the
  drawer when the add came from the product page

## What stays, deliberately
The cart row (`.pg-frameoffer`), its `focusOne()` one-upsell-at-a-time logic,
and the rule hiding the frame's card in "You may also like". The owner asked for
the product-page tile only.

`PRINT_MARK` stays too -- it is what `cartHas()` tests to decide whether the
print is in the cart, so it outlived the page check that shared the name.

## Deleted, not hidden
A `display:none` would leave the tile rendering into the buy column on every
pass and then covering it up, and would leave a live ADD button in the DOM. The
markup is simply never built now.

## Kept in the header for whoever restores it
That tile's button was `.pgx-frame-add` and deliberately NOT `.pgx-case-add`:
pg-mobile and pg-case-add both listen for that class in the capture phase and
post the CASE variant, so sharing the class would have added a case to the cart
when the shopper asked for a frame. Worth not rediscovering.

# Cart: remove the duplicate frame upsell

## Why there were two
Two independent implementations of the same offer were rendering:

1. `sections/pg-frame-add.liquid` -- "Add the matching frame", registered in
   footer-group. The purpose-built one.
2. The `.pg-fup` row folded into `sections/nc-linesave.liquid` -- "Add a Black
   Wood Frame". The older one.

pg-frame-add already guards against exactly this: its `focusOne()` benches every
upsell but one. It can only bench what it knows about, though -- it sweeps
`#cart .pg-unlock, #cart .pg-frameoffer`, and the nc-linesave row answered to
neither class, so it sat there next to the winner untouched.

## Which one went, and why that one
The nc-linesave copy. It only ever lived in that file because footer-group was
at Shopify's 25-section cap at the time: a section registered past the cap is
accepted, reported back correctly by the API, and silently never rendered, so
the row had to ride inside a file that already rendered.

pg-frame-add is that constraint solved properly, and is a better version of the
offer besides:
- puts the same offer on the product page, above ADD TO CART
- hides the frame's own card in "You may also like", so one product is not
  pitched twice at two different prices
- reads cart state off the rendered rows rather than polling /cart.js, on a cart
  four other sections already fetch
- rides inside `#pg-unlock-slot`, which pg-cart-mobile lifts above the pinned
  checkout pane on phones. Parked under the line list -- where the nc-linesave
  row was -- it measured y=783 on an 844px screen, underneath the pane, which
  is the "they can't add the frame" bug that file's own header records.

Teaching `focusOne()` a third class would have kept two implementations of one
offer alive. Deleting the older one is the fix.

## Left behind
nc-linesave is back to one concern: the per-line savings badge, plus the two
rules hiding pg-drawer's `.pg-save-chip` and pg-chips' paid-row deal plaque.
14,298 bytes down to 7,173.

# Cart: remove the "6 PACK" deal plaque from paid lines

## What it was
pg-chips appends a `.pg-free-note` pill to a cart line's title naming the deal
the line matched, when that rung yields no free units -- the 6 Pack, which is a
fixed bundle price rather than a free-unit offer. On the live theme it renders
with the amount still attached ("6 PACK $137.20").

By the time it draws, the row already shows the struck total, the charged total
and this file's own "Save %" badge. It was the fourth statement of one discount
and the widest element on the line.

## What was hidden, and what was not
Only the note on PAID rows:

    #cart li:not(.pg-free-line) .pg-free-note { display:none !important }

The same element on a FREE row reads "FREE" or "3 FREE", which names units the
shopper is getting and is stated nowhere else on the row, so `.pg-free-line`
(set by pg-chips on those rows) is what separates the two.

## Why plain display:none is enough here
Unlike `.pg-save-chip` above it, `.pg-free-note` is NOT in pg-chips' stamp list
-- `SEL` is `.pg-free-tag, .pg-save-chip, .nc-lsave-off` -- so nothing writes
inline `display` to it on the 300ms interval, and its own rule sets
`display:flex` without `!important`. The four-property dance the chip needs is
not required.

## Why here rather than in pg-chips
This file already owns "suppress the duplicate discount labels on a cart line",
and hiding costs one rule against a 34KB rewrite of pg-chips for a three-line
change. The plaque is still generated; it simply is not painted on paid rows.

## Verified
Chromium, pg-chips' real CSS plus this rule over a paid row and a free row: the
paid row's "6 PACK" computes to display:none at 0x0, the free row's "3 FREE"
stays display:flex at 55x22.

## Scope note
Hidden at every width, not only on phones.

# Wall art: swipe hint on the photo strip

Mirrors the orb page's pill (`pg-gallery-tweaks`): "< SWIPE - 4/28 >" pinned to
the top edge of the photo the strip is showing, with the name pill at the bottom
of the same photo so the two can never collide.

## Why the strip needs it
pg-gallery-mobile hides the strip's arrows under 900px, because they sat on top
of the artwork. That fixed the covering but left no sign the strip scrolls at
all, so 28 photos read as a dead row. Phones only -- desktop keeps pg-landing's
real arrows, so the pill would be noise there.

## Placement and behaviour, inherited from the orb page's two failed passes
- ON the strip, not above or below it. Under the strip it fell below the fold on
  a 390x844 phone; between the video and the strip it read as a caption for the
  VIDEO, since nothing tied it to the photos underneath.
- Never dismissed. Removing it on first scroll, then on first touchmove, were
  both too eager: a finger that starts on the gallery and drags DOWN scrolls the
  page and fires touchmove on the strip, so scrolling past the photos killed the
  hint. It is a standing label.
- The counter repaints per animation frame, sharing the existing `stripLabel()`
  pass, so it counts up under the finger rather than jumping once when the strip
  settles. Tabular figures and a 4.8ch min-width stop the centred pill shimmying
  as the digits change.

## Verified
Playwright harness, phone and desktop: pill visible at 390px reading "1/10",
counter tracking the strip through 1/10 -> 4/10 -> 10/10 with the name pill
following, 8px below the strip's top edge, 313px clear of the name pill; hidden
at 1280px while the name pill stays.

# Wall art: removed a duplicate photo from the gallery

## What it was
Two of the product's media entries were the SAME image uploaded twice:

  hf_20260812_013125_456526a8...png   4,671,308 bytes
  hf_20260812_013125_dff28aff...png   4,671,308 bytes

Byte-for-byte identical file sizes, same generation timestamp. Both sat in the
photo strip (which renders the media list at offset 1), so the Legendary Poke
Trio shot appeared twice.

## How it was found
The CDN is blocked from this environment, so the images could not be compared by
eye. `MediaImage.originalSource.fileSize` settles it without looking: identical
byte counts across a 2048x2048 PNG is not a coincidence. Every other image on
the product has a distinct size, so this was the only duplicate -- checked
across all 29.

## What was deleted
`MediaImage/71928007950564`, the 456526a8 copy. It was chosen over its twin
because it carried no alt text of its own until this session, when one was
invented for it without seeing the picture; the surviving copy
(`71926378365156`) keeps its original author-written alt, "Heroic 3D Wall Art -
holo, dark bedroom above bed", which still maps to Legendary Poke Trio through
the DESIGNS table.

Checked before deleting: it was not the featured image (that is 71952743366884)
and not any variant's image, so nothing on the collection card, the bundle tile
or the cart line pointed at it. The picture itself is still on the product via
the surviving entry -- nothing visual was lost, only the repeat.

# Wall art: design name on every video and every photo

Mirrors the pill the orb page already carries (`pg-gallery-tweaks`), for the
same reason: ten designs share one product page and nothing on screen said
which one you were looking at.

## The video
Free -- the slideshow already knows which variant it is showing, so the pill is
written from `VIDS[i].v` at the swap. The dots moved from `bottom:9px` to
`bottom:46px` so the two do not sit on top of each other (measured 8px clear in
the harness).

## The photos
The strip's own markup carries no design: pg-landing renders every thumbnail as
"Holo Legends Wall Art view N". The names come from the product's MEDIA alt text
instead, shipped inline as JSON so the first paint has them rather than waiting
on a round trip.

Matched on FILENAME, then keyword. Each button's `<img>` src is matched against
the media list -- never button i to media[i+1], which works until the next
upload and then labels every photo with its neighbour's. Shopify's `_700x` size
suffix is stripped before the stem comparison. The matched alt is then read for
a character and mapped to the variant that sells it.

## Two ordering traps in the keyword table
- The EX rule must sit above the plain Blastoise rule, or "Blastoise EX" lands
  on Blastoise Evolution.
- A rule matching the variant name outright must sit ABOVE everything, because
  the trio's alt reads "Charizard Squirtle and Bulbasaur" -- the Squirtle rule
  claimed it and labelled the hero shots Blastoise Evolution. Caught by a table
  test over all 25 real alts before deploy, not on the page.

A photo matching nothing gets NO label rather than a wrong one.

## Data fix
Two media items had empty alt text (the two hero shots) and so could never be
labelled. Rather than hardcode their filenames, their alts were filled in on the
product: "Legendary Poke Trio holographic wall art, ...". Better for
accessibility and SEO too.

## Verified
Playwright harness with a ten-photo strip and the real section JS: all ten
photos label correctly as the strip scrolls, the video pill follows the variant
dropdown, and the dots clear the pill.

# Wall art slideshow: frozen slides now recover on their own

Third report of the same bug, so this one was reproduced in a browser rather
than reasoned about: a local harness (Chromium via Playwright) running this
file's real JS against ten throttled test clips.

## What the harness showed
The A/B swap logic is sound -- every timing case tried (slow first byte, the
1800ms fallback firing before any data, rapid variant changes) landed on the
right clip, playing. What it did NOT do was recover. Forcing a stall on the
front video, the deployed code left it frozen indefinitely; there was nothing
watching playback after the swap.

The old `kick()` retry looked like that watchdog and was not one: `play()` flips
`paused` to false the moment it is called, well before a frame renders, so the
loop saw "playing" on its first look and exited. Anything that stopped playback
after that -- a rejected play promise, a stall while the opening clip still had
the connection, a decode hiccup, a backgrounded tab -- was unprotected. That
fits the report: frozen clip, fixed by paging away and back (a fresh load, by
then cached).

Why the two slides nearest the start: they are the ones requested while the
opening clip is still downloading, so they are the ones that stall.

## Fix
A permanent supervisor on a 700ms tick judges playback by whether `currentTime`
actually MOVES, not by the `paused` flag, and keeps judging for the life of the
page rather than for one second after a swap. Every clip loops, so a running
slide always advances; one that has not advanced between two ticks gets another
`play()`. `play()` on an already-playing video is a no-op, so the common path
costs nothing. It also re-asserts the clip's playback rate each tick.

Backstop: a capture-phase `pointerdown`/`touchstart`/`keydown` listener nudges
the front video if it is paused, so an outright autoplay refusal is cleared by
the first interaction anywhere on the page.

Measured in the harness: forced stall recovers in under 1.6s, where the previous
build stayed frozen for as long as it was watched.

## Also fixed, found while reproducing
Arrows stepped from `cur`, which only moves once a clip has loaded. On a
throttled connection six clicks advanced the slideshow by ONE slide, each click
recomputing the same neighbour and cancelling the download that would have ended
the wait. They now step from `want` -- the slide last requested -- so every
click counts, and the dots light up on request rather than on arrival.

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

