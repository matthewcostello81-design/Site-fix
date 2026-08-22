# Cart: the drawer hijacks its own scroll after an upsell selection

## Symptom
Reported as: the cart "is flashing and tweaking" on desktop, pointing at the
pinned totals pane (You saved / Shipping Protection / Total / CHECKOUT), and
"it won't let me scroll within the cart".

## Cause
`reveal()` in pg-cart-imglink runs 260ms and 900ms after every `.pg-unlock-add`
click, to lift the free-orb picker out from behind the pinned pane. It issued
TWO scroll commands in the same task:

    pick.scrollIntoView({block: 'center', behavior: 'smooth'});
    var sc = scroller();
    if (sc) sc.scrollTop += over + 14;

Two defects, both measured in a Chromium harness running the real cart sections
over the theme's own async-panels.css:

1. BOTH COMMANDS ANIMATE, AND THEY FIGHT. The theme gives the drawer
   `scroll-behavior: smooth` (async-panels.css, `.m6pn`), so the bare
   `scrollTop +=` is animated too -- and it retargets the animation
   `scrollIntoView` had just started, from wherever it had reached rather than
   from where it began. reveal() fires twice per selection, so up to four
   overlapping animations are in flight. A wheel or trackpad gesture arriving
   during any of them is overwritten by the next frame of the one still running:
   the cart slides on its own and refuses to be scrolled by hand.

   `scrollIntoView` was also the wrong one to keep: `block:'center'` targets a
   position the pinned pane can make unsatisfiable (centre a picker taller than
   half the scrollport and its bottom is still under the pane), and it scrolls
   EVERY scrollable ancestor, so on desktop it moved the page behind the drawer
   as well.

2. THE FALLBACK SCROLLED THE WRONG PANEL ENTIRELY. `scroller()` walked up from
   the item list looking for a scrollable ancestor and, failing that, fell back
   to `document.querySelector('#cart .m6pn') || document.querySelector('.m6pn')`.
   The first can never match -- `.m6pn` IS `#cart`, not a descendant of it -- so
   the fallback was always the second: the FIRST PANEL IN THE DOCUMENT, which on
   most pages is the nav drawer. Measured with a short cart (drawer not itself
   scrollable, which pg-cart-mobile's rule 2b deliberately makes the common
   case): `scroller()` returned `#nav-panel.m6pn`, not the cart.

## Fix
One scroll command, bounded to the cart:

  - `scroller()` stops at `#cart` and returns null rather than reaching for an
    unrelated panel.
  - `reveal()` drops `scrollIntoView` and performs a single nudge by exactly the
    measured overlap, clamped to the scroller's own maximum, with
    `behavior:'auto'` so it lands in one frame and leaves nothing animating for
    a gesture to fight. Still best-effort -- the `.is-open` z-index rule is what
    makes the picker usable; this only tidies its position.

## What this does NOT cover
The pinned pane's own position is written by `seatPane()` in pg-cart-mobile,
which is the only code that can move that section. It was measured as INERT at
ten viewport sizes (1280x900/700/600/520/460/400/360, 1440x760/480, 1512x820,
390x844): `pane.pgLift` stayed 0 and no inline `bottom` was ever written,
because rule 2a (`bottom:0 !important`) already seats CHECKOUT 6px above the
drawer's clip floor at every one of them. So no change was made there. If the
pane is still seen to twitch after this, seatPane is the place to look and it
will need a reproduction from the affected machine.

Verified: uploaded checksum 06ae37a6f849ddcd28b29b80c613bdc3 matches the local
file byte for byte.

Deployed to the DRAFT theme "Copy of Simpler cart + frame add-on (Claude)"
(163134439652) -- confirmed a byte-identical duplicate of live across the first
100 files including config/settings_data.json and layout/theme.liquid -- because
the live theme is now published and theme-file writes against it are blocked.
Needs publishing from Shopify admin.

---

