# Wall art: the video slideshow is swiped, not clicked

## What changed
The two purple chevrons on the gallery video were removed and replaced with the
same "< SWIPE - n/10 >" pill the photo strip below already carries.

## Why this was not just a CSS swap
The photo strip's pill only had to LABEL a gesture the browser already handled:
`.pgx-thumbs` is a real `overflow-x` scroller. The video stage is not a scroller
-- it is two stacked, absolutely positioned `<video>` elements -- so nothing
would have answered a finger there. Dropping the arrows and adding only the pill
would have advertised a swipe that does nothing, and the arrows were the ONLY
manual control at desktop widths too (the dots alone are poor for ten slides).
So the drag handler is the substantive half of this change; the pill is the
label on it.

## How the gesture behaves
  - Pointer events, so touch, pen and a desktop mouse drag take one path.
  - The gesture stays undecided until it has moved 10px further sideways than
    down, and only claims the drag (and starts calling preventDefault) at that
    point -- a finger that lands on the video and pulls DOWN still scrolls the
    page. The axis is LATCHED once decided so a curved drag cannot flip halfway.
  - `touch-action:pan-y` on the stage says the same thing to the compositor,
    which is what actually arbitrates the gesture; vertical panning stays on the
    fast path instead of waiting on this handler.
  - 40px of travel commits to a slide change; anything shorter is ignored.
  - `setPointerCapture` keeps the moves coming when the finger leaves the short
    stage and guarantees the matching up/cancel.
  - A gesture starting on a dot is ignored, so the dots stay clickable.
  - Arrow keys page it, and the stage took tabindex/role/aria-label, so the
    slideshow keeps a keyboard route now that the buttons are gone.

The counter is painted from `paintDots()`, the one funnel every slide change
already goes through -- swipe, dot, keyboard, or a variant chosen anywhere else
on the page -- so it cannot drift out of step with what is on screen. It writes
only on a change, because the pill sits inside `#pgx`, which carries a childList
MutationObserver.

The photo strip's pill stays phones-only (desktop keeps pg-landing's real
arrows there); the video pill shows at every width, since that stage now has no
arrows at any width.

## Verified in a Chromium harness running the real section over local fixtures
At 390x844 and 1280x900, both green on every line:

    arrow buttons present ......... 0
    pill visible, counter ......... 1/10, tracks every change
    swipe left / right ............ advances / goes back
    real touch swipe (CDP) ........ advances / goes back
    vertical drag ................. slide unchanged, defaultPrevented false
    sub-threshold drag (25px) ..... ignored
    dots still clickable .......... dot #5 -> 5/10, "EX Legendary Poke Trio"
    keyboard ArrowRight ........... advances
    variant <select> integration .. "Goku" -> 10/10
    visible clip .................. advancing, playbackRate 2.5, not paused
    page errors ................... none

Uploaded checksum 730a34fbf560290c28b14f9144b3d25a matches the local file byte
for byte. Deployed to the DRAFT theme "Copy of Small-iPhone cart polish (Claude)"
(163138175204) -- the live theme rotated twice during this session and theme
file writes against the published theme are blocked. Needs publishing.

---

