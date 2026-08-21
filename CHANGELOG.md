# Five things were repainting every frame, on a cart nobody was touching

The flickering is real and it is not a race, a re-render or a layout fight — all
of those were already fixed and the live combination passes the stillness test.
It is `pgShift`, a decorative gradient loop in `pg-drawer.liquid`:

    animation: pgShift 5s ease-in-out infinite

applied to `.pg-save-chip`, `.pg-free-tag`, `.nc-dship` and `.pg-bar-fill`. It
animates `background-position` across a `background-size:240% 240%` gradient.

`background-position` is **not a composited property**. Every frame of that
animation repaints the element on the main thread. Enumerated with
`document.getAnimations()` on a settled drawer holding two discounted lines and a
free gift:

| | live | fixed |
|---|---|---|
| animations running inside `#cart` at rest | **5** | **0** |

Five elements repainting continuously, forever, for a shimmer — with the drawer's
twenty polling loops already competing for the same main thread. On a phone that
is exactly "glitching like flickering", and it never stops, which matches the
report of a steady cart that will not sit still.

The gradients stay; the motion goes. `background-size` drops 240% → 100% so the
full gradient shows at rest rather than a slice of it. A backstop rule names the
four selectors — deliberately **not** a blanket `#cart *{animation-name:none}`,
which would also kill any spinner the drawer legitimately wants while something
is loading. That would be a worse cart than a shimmering one.

`test/run-anim.mjs` is the regression: it boots the real `pg-drawer` and
`nc-cartfix` stylesheets, enumerates every running animation whose target is
inside `#cart`, and fails if there is one.

# And the add-on is 41% shorter

Said twice that it was still too big, so this goes past trimming into layout.

The slots were one per full-width row. That is the roomy layout and the desktop
drawer keeps it — but in the pinned pane it was the single biggest thing left:
two slots stacked cost 70px of a 164px card, for two dropdowns each carrying
about 120px of actual content.

They are now a grid with the price or FREE **above** each one. The label costs
11px; the row it saves is 35px:

    $34.99              FREE
    [ 19 Sylveon  ▾ ]   [ 18 Gyarados ▾ ]
    [   Add 2 to cart - 1 is FREE      ]

`repeat(auto-fit, minmax(140px, 1fr))` is what makes it safe: if the pane is ever
narrow enough that 140px would truncate a character name, the grid falls back to
one column by itself. Three slots wrap to two columns and cost 90px instead of
105px. No markup changed — this is the same `.pg-unlock-pick-r` the desktop
renders.

| | at the start of this round | now |
|---|---|---|
| offer row | 247px | **145px** |
| pinned pane, 390x844 | 324px (38.3%) | **222px (26.3%)** |
| 375x667 | 286px (42.9%) | 219px (32.8%) |
| 360x640 | 286px (44.7%) | 219px (34.2%) |

# Where this is running, again

The photo was the **live** theme. It differs from this draft in exactly two
files, confirmed by querying both themes:

| file | live | draft |
|---|---|---|
| `pg-unlock.liquid` | `b82f92dc` | `03a0ed43` |
| `pg-chips.liquid` | `01a254fc` | `fad3651c` |

Every other cart section is byte-identical across the two. So the live cart has
none of the compaction, none of the per-orb pricing, and — until `pg-drawer` goes
across too — all five of the gradient animations.

Reconstructing the live bytes from git (`git show 6c0151b:...`, `git show
f0d4e7b:...`) reproduced both live checksums exactly, which is how the flicker
was hunted against what the shop is actually running rather than against the
draft.

# The add-on was still eating a third of the screen

A photo of the real cart settled it: the upsell card ran from just under the one
visible cart line all the way down to Shipping Protection, and the line item
above it was clipped mid-row. Measured at 390x844 it was **324px, 38% of the
phone**.

The compaction written last round was gated behind `@media (max-height:700px)`,
on the theory that only small phones were short of room. That was wrong, and the
photo is the proof: a 390x844 iPhone is not short of room in the abstract, and
the panel was still too big on it. Height in the pinned pane is scarce at *every*
screen size, because the pane competes with the cart, not with the page. The
compaction is now unconditional inside `.sticky-in-panel`, with the short-screen
block tightening it further where the squeeze is real.

The largest single saving was structural rather than cosmetic.
`.pg-unlock.is-open .pg-unlock-t{flex:1 1 100%}` gives the copy a full row of its
own — right on the desktop drawer, where the panel has room to breathe. In the
pinned pane it cost an entire line for nothing: the thumbnail sat alone on one
row with 250px of empty space beside it and the headline went underneath.

| | before | after |
|---|---|---|
| offer row | 247px | **164px** |
| pinned pane, 390x844 | 324px (38.3%) | **241px (28.6%)** |
| pinned pane, 375x667 | 286px (42.9%) | 235px (35.2%) |
| pinned pane, 360x640 | 286px (44.7%) | 235px (36.7%) |

In the isolated screenshot harness, which renders the row alone, it goes 229px ->
129px — a 44% cut. `test/shot-upsell.mjs` produces the before/after images.

What went: the subtitle (with the panel open it is the one line saying nothing
the shopper cannot already see — each slot carries its own price or FREE and the
confirm button repeats the count), the thumbnail's own row, the select boxes'
form-sized padding, and the confirm button's padding-derived height. What stayed:
every tap target at or above 32px, the thumbnail, and the headline naming the
bundle.

## A note on where this is running

The screenshot was taken on the **live** theme, "NEW COPY. ADDING FRAME UPSELL
FOR WALL ART" — not the draft this repo tracks. The live theme carries most of
this work, copied across as it shipped, but is one revision behind on two files:

| file | live | draft |
|---|---|---|
| `pg-unlock.liquid` | `b82f92dc` | `1b524ce2` |
| `pg-chips.liquid` | `01a254fc` | `fad3651c` |

That gap is exactly why the photo shows `$20.59` on the line — the blended
average of six orbs at $123.48 — with no per-orb note, and `PICK 1` rather than
`$34.99` on the first slot. Both were fixed in the draft last round. The
connector refuses writes to the live theme, so those two files have to be copied
across (or the draft published) before any of it is visible to a shopper.

# The cart line now states the deal per orb, and the slots open on arrival

## Six orbs read as $20.58 each

A discounted orb line showed one blended figure. Six orbs charged $123.48 with
nothing beside it, so the only per-unit price a shopper could work out was
$123.48 ÷ 6 = **$20.58** — a number that is true of no orb in the cart. Four of
them cost $30.87 and two cost nothing.

Worse, the free count only appeared for *some* deals. `free` was counted as
`line_price === 0`, i.e. only the lines Shopify itself splits off at zero. That
works for a Buy-2-Get-1, which is a BXGY and does split. It does not work at all
for the 6-pack, which is a flat $72.74 off one line — so exactly the tier the
shop owner had just built showed no free units at all.

The line fields answer it for every deal shape at once.
`original_line_price` is the pre-discount total and `final_line_price` is after
LINE discounts only, so their difference is the product discount alone — immune
to the standing Extra 10% off entire order, which lands in `line_price` instead
and would otherwise corrupt the count. Divide by the unit price and you have the
free units, split or not.

The note now names the paid units and their real each-price:

| qty | charged | before | after |
|---|---|---|---|
| 3 | $62.98 | `1 FREE INCLUDED` | `2 x $31.49 + 1 FREE` |
| 5 | $125.96 | `1 FREE INCLUDED` | `4 x $31.49 + 1 FREE` |
| **6** | $123.48 | *(nothing)* | `4 x $30.87 + 2 FREE` |
| **7** | $154.97 | *(nothing)* | `5 x $30.99 + 2 FREE` |
| 8 | $157.46 | `3 FREE INCLUDED` | `5 x $31.49 + 3 FREE` |
| 12 | $251.93 | `4 FREE INCLUDED` | `8 x $31.49 + 4 FREE` |

`test/run-perorb.mjs` drives the real `repct()` against the real pay curve — the
four live discounts, one product discount per line, the cheapest winning — and
asserts at every quantity 1–12 that the printed figures multiply back to the
exact charge and that the blended average never appears. `test/paycurve.mjs`
proves the arithmetic independently, with and without the extra 10% stacked.

Note q=6 and q=7 give $30.87 and $30.99 rather than a round $31.49: the 6-pack's
flat discount genuinely reduces the paid ones a little as well as freeing two.
The figures are what the shopper is actually charged, not a tidy fiction.

## The offer was hidden behind a tap

The design slots were built only on the first tap of ADD, so the row said
"Unlock Buy 2, Get 1 FREE" and the shopper had to tap, wait for a
`/products/<handle>.js` round trip, and only then discover that the offer wanted
them to choose two designs and that one of the two was free. The offer *is* the
choosing; hiding it behind a tap hid the offer.

It opens on arrival now — with the shopper's own picks if they had any and the
defaults otherwise — and the labels carry the money instead of a slot number:

    $34.99   [ Charizard ▾ ]
    FREE     [ Gengar    ▾ ]
    [ Add 2 to cart - 1 is FREE ]

Three guards, because the panel is the tallest thing the pinned pane ever holds
and the pane is bottom-anchored — every pixel it takes is cart the shopper
cannot see:

- **One row at a time.** In practice only the orb has designs to choose
  (`buildChooser` resolves false for the single-variant wall art and console),
  so the cap almost never binds — it is what stops a future multi-variant
  product from filling the screen.
- **Compacted on short screens.** Measured open: 324px, which is 38% of a
  390×844 phone, 49% of an iPhone SE and **51% of a 360×640** — over half the
  screen on the smallest common phone. Under 700px of viewport the subtitle goes
  (with the panel open it is the one line saying nothing the shopper cannot
  already see — each slot is labelled and the confirm button repeats the count)
  along with tighter selects and thumbnail: 324px → 286px, which brings 360×640
  to 44.7%.
- **Not at all below 600px of viewport.** Even compacted, 286px is half of a
  320×568 phone. There the row stays a tap away, as before. Restoring a
  shopper's own half-made picks is never suppressed by this — they asked for
  that panel.

| viewport | pane with the chooser open | auto-opens? |
|---|---|---|
| 390×844 | 324px — 38.3% | yes |
| 375×667 | 286px — 42.9% | yes |
| 360×640 | 286px — 44.7% | yes |
| 320×568 | 286px — 50.4% | **no**, tap to open |

## A deploy that had to be repaired

The first upload of `pg-chips` landed corrupt, twice. The note originally used
`\u00D7` and `\u00B7` escapes for × and ·, and my instruction to the uploading
agent described those as "non-ASCII characters" — they are not, they are literal
backslash sequences in the source. Attempt one converted them to glyphs (8 bytes
short); attempt two over-corrected to doubled backslashes (6 bytes long), which
also doubled the backslashes in

    /\/products\/([^/?#]+)/

so `handleOf()` matched nothing and every cart row failed to pair. Caught by the
checksum verification, on an unpublished theme, so nothing live was affected.

The root cause is fixed rather than worked around: the note is now pure ASCII
(`4 x $30.87 + 2 FREE`), leaving one deliberate non-ASCII byte in the whole file
— the U+2212 minus sign in a keypad comparison that predates this work.

# The last two confirmed glitches, and one finding that was a harness artefact

The wider audit finished: 37 findings, 8 confirmed, 29 refuted. Four of the eight
were already fixed in the two commits above. This closes the other four.

## A render arriving mid-flight was thrown away

The single-flight guard `return`ed when a render was already in flight, dropping
the request entirely. `afterAdd()` deliberately fires three renders in quick
succession, so on a slow cart the two follow-ups both landed inside the first
one's `/cart.js` round trip and evaporated. Measured with `/cart.js` at 800ms:
the offer row was **absent for 1101ms** after an add.

`pending` now remembers that someone asked, and `done()` re-runs once the flight
lands. `done()` has to be called on *every* exit that clears `rendering` — the
signature no-op and the consolidate branch included — or a request coalesced into
one of those is stranded and the row never comes back at all.

## The shopper's chooser picks were destroyed by any cart change

`render()` refuses to replace a row the shopper has opened, which covers a
re-render. It cannot cover what actually destroys the panel: the theme replaces
`#cart`'s entire innerHTML on every add and quantity change. A shopper who picked
Charizard and Gengar and then tapped **+** on a cart line watched the panel close
and their picks vanish — there is no row left to protect by then.

The picks are now captured the moment they are *made*, not read off the DOM
afterwards (reading later always loses the race with the swap), and replayed onto
the fresh row only when `data-sig` matches — same handle, same rung, same unit
count, therefore the same chooser shape. A different sig drops the snapshot
rather than forcing it onto a panel it does not fit, and a variant that has gone
away since they picked it is skipped rather than selected blindly.

`test/run-picks.mjs` covers both, with a `legacy` mode as the control:

| | deployed | fixed |
|---|---|---|
| row returns after the rebuild | yes | yes |
| chooser still open | **no** | yes |
| picks preserved | **no** — empty | `["1","2"]` |

Still passes with `/cart.js` at 900ms.

## The `/cart.js` storm was the harness, not the cart

One confirmed finding claimed five observers on `#cart` amplify each other into
19 `/cart.js` reads per upsell add, with a shared-reader fix. It reproduced — but
only because the harness never loaded **pg-cart-fast**, which already memoises
that endpoint with a 500ms TTL and a shared in-flight promise, and already
invalidates on every cart write.

A/B on the same page, six seconds of a steady open cart:

| | requests | rate |
|---|---|---|
| without `pg-cart-fast` (the harness) | 25 | 4.2/s |
| with it (what actually ships) | 7 | **1.2/s** |

So the proposed `window.pgCartJson` would have been a second memo stacked on an
existing one — a new cross-file global, shared mutable parsed carts, and changed
error semantics, for a saving already banked. Not applied. The fix's own
load-order note also had the order backwards: it named `pg-cart-imglink` as the
earliest of the group, but per `overlay-group.json` it loads at 22, *after*
`pg-unlock` at 20.

# Three corrections from the adversarial pass

An independent verification round over the same code found three things wrong
with the fixes above, all in the direction of "the fix does not cover the case
it was written for". Numbers are from the verifier's own harnesses.

## The settle flag was in the wrong function

The re-arm fix keyed on "this hold has already run", tested inside
`smoothOpen()` *after* its `.sticky-in-panel` bail. A drawer that opens with its
pane already built returns at that bail without ever running the hold — so the
flag is never set, and the second half of the bug (a class write landing while
the pane momentarily does not exist, blacking out an already-visible drawer)
came straight back.

The gate belongs on `toggle` being *added*, in the observer, where both
re-entries during one opening are caught. Also set on the initial call, or a page
that boots with the drawer already open still pays one extra 1.2s cycle.

The tempting alternative — gate the hold on the cart having rows — is a
regression, and was measured as one: a shopper arriving from an ad opens an
*empty* drawer and the item, the upsell and the CHECKOUT pane all land a beat
later. That is exactly the reshuffle the hold exists to cover, and at the moment
the drawer opens there are no rows to test for. Gated that way the hold never
arms in precisely that case.

## The slot needed to record its desktop home

Creating it inside the pane means `placeUnlock()` never performs the move, so it
never records `pgHome` — and its restore branch has nothing to put back when the
viewport widens past 760px. Measured: rotate to landscape and the row stays
pinned in the pane at a width where it belongs above the list. `pg-unlock` now
records the home `placeUnlock` would have recorded, and `placeUnlock` keeps a
fallback that seats the slot above the list when no home was recorded at all.
`test/run-churn.mjs` now drives 390 → 1100 → 390 and asserts the placement at
each step.

## `mark()`'s backstop should not have been slowed

Slowing the interval to 2000ms made the worst case four times worse for the
case the synchronous call cannot cover — it sits behind a 120ms debounce, a
`/cart.js` round trip and a single-flight guard, so on a real network it can miss
entirely. The write is value-guarded now and therefore free, so the backstop goes
back to 500ms. It is load-bearing: `pg-cart-badge` carries a byte-identical
`mark()` but is rendered by nothing — it appears in no section group and no
template — so `pg-unlock` really is the only thing that re-hides the theme's old
logo disc after a rebuild.

# The drawer could show a cart that predated the shopper's own add

Not a flicker — worse. `pg-cart-fast` coalesces `pgDrawerRefresh`, and a caller
that joins an already-issued rebuild gets a snapshot of the cart as it stood when
that request went out. `done()` cleared `running` with nothing queued, so no
corrective rebuild ever followed.

Reproduced against the real theme scripts: a shopper who adds from the product
page and then taps the drawer upsell makes **three cart writes but only two GETs
go out**, and seven seconds later the drawer still shows the pre-add cart. The
add looks as though it did not happen.

The floor and the single-flight both stay; the wrapper just learns to notice.
Cart writes stamp `lastWrite`; the rebuild stamps `snapAt` when its GET is
issued; if the snapshot predates a write, exactly one redo is queued. A join
during the 700ms wait costs nothing extra — the request has not gone out, so its
snapshot will already contain that write. It cannot loop, because the redo's own
snapshot postdates the write that triggered it. `resolve()` still fires on the
first landing, so `pg-unlock`'s ADD button cannot hang behind the redo.

This covers only the callers that go through `window.pgDrawerRefresh`;
`nc-cartfix`'s own `ncReopen()` and `pg-drawer`'s two internal calls rebuild
outside the wrapper entirely.

# The cart upsell was fighting the countdown banner nine times a second

The add-on rows in the cart "glitching" turned out to be a genuine tug-of-war,
not a rendering artefact. Two scripts each insisted on being the **first child**
of the pinned totals pane:

- `pg-cart-timer` ends its `render()` with
  `if (pane.firstChild !== el) pane.insertBefore(el, pane.firstChild)` for the
  countdown banner `#pg-rush`.
- `pg-cart-mobile`'s `placeUnlock()` ended with the same demand for
  `#pg-unlock-slot`.

Both are driven by MutationObservers on `#cart`, so each one's insert woke the
other, which inserted straight back — for as long as the ten-minute offer window
was open, which is most of a shopper's session.

Measured in a Playwright harness that boots the four scripts which write into
that pane and records the pane's child order on **every animation frame** for six
seconds:

| | deployed | fixed |
|---|---|---|
| distinct pane child orders in 6s | **54** | **2** |
| upsell row y-positions | **345 ↔ 392** — a 47px jump, ~9×/second | **392**, once |
| `/cart.js` requests per second | 2.0 | 0.8 |

Nobody wins a fight like that; they have to agree. The countdown keeps first
place — it is a thin urgency strip framing everything under it, which is what its
own header comment says it is for — and the upsell sits immediately beneath it.
Both conditions are then satisfiable at once, so the first insert settles it.

It stays stable through the banner's whole life cycle: inserted before the banner
exists the slot is first and correct; the banner then takes first place and the
slot is correct as its next sibling; when the window expires and the banner is
removed the slot is first again and correct once more. No transition asks either
party to move twice.

`test/run-churn.mjs` is the regression test, and it has a `legacy` mode that
loads the pre-fix scripts so it can prove it is capable of seeing the churn it
claims is gone.

## The other glitches

- **The row was born in the wrong place.** `render()` re-created the slot above
  the item list — its *desktop* home — on every drawer rebuild, and a rebuild
  happens on every add and every quantity change. On a phone `placeUnlock()` then
  moved it down to the pinned pane on its own 60ms observer tick. ~81ms of
  visible wrong position per rebuild in a zero-latency harness, longer on a real
  phone. The slot is now created where it belongs, and `pg-unlock` calls
  `window.pgPlaceUnlock()` synchronously in the same task it writes the rows, so
  there is no frame in which they are misplaced.
- **The drawer could black itself out permanently.** `smoothOpen()` ends its hold
  by removing `.pg-settling` — itself a class change on `#cart`, which wakes the
  class observer, which calls `smoothOpen()` again. With no totals pane present
  the hold was re-applied immediately, and the drawer spent the rest of the
  session invisible bar one frame every 1200ms. The same path also blacked out an
  already-visible drawer mid-rebuild, when the pane briefly does not exist. The
  hold now belongs to one opening and is cleared when the drawer closes.
- **The thumbnail flashed on every rebuild.** A replaced row means a brand-new
  `<img>` even when the URL is identical; without intrinsic dimensions the
  browser laid it out at 0×0 until the cached bitmap attached. `width`/`height`
  attributes added.
- **An open design-chooser froze forever.** `lastCartSig` was advanced before the
  loop that decides whether the new cart can actually be applied — and that loop
  skips a row the shopper has opened. A change arriving mid-pick was recorded as
  applied without being applied, and every later render short-circuited on the
  signature. The signature is now advanced only for what was really written.
- **The rows could vanish until the next cart change.** `render()` captured
  `#cart` and the item list *before* its `/cart.js` await and used them after. A
  drawer rebuild landing inside that round trip left both detached, so the insert
  happened in a subtree nothing was showing. Both are re-read after the await.
- **Two unguarded writes were driving everyone's observers.** The sticky bar's
  badge rewrote its `textContent` every second whether or not the count had
  changed — a childList record on `document.body` at 1Hz, which three modules
  watch. `mark()` (in both `pg-unlock` and `pg-cart-badge`) rewrote the drawer
  logo's inline style twice a second, forever. Both are now value-guarded.
- **The wordmark popped in half a second late.** `mark()` was driven only by its
  interval, so after a rebuild the header sat logo-less for up to 500ms. It is
  now called in the same task that writes the rows.

# The ADD button was three different sizes, and the biggest was the reported one

Three rules competed, and the cascade resolved *correctly* — that was the
problem. `#cart .sticky-in-panel .pg-unlock-add` is (1,2,0) and beats the
`@media(max-width:600px)` copy at (1,1,0), so the compact size was never
conditioned on the viewport. It was conditioned on `.sticky-in-panel` being an
**ancestor** — which only happens because `placeUnlock()` physically moves the row
there. The CSS was written as if "phone" implied "pinned".

Every phone state where that DOM move had not happened yet — every drawer
rebuild, and permanently if the move ever failed — got `flex:1 1 100%`, throwing
the button onto its own full-width line: a **322 × 42px** slab on a 390px phone,
in a row 2.3× taller than the pinned one.

Measured with all 29 cart stylesheets loaded in their real load order:

| context | before | after |
|---|---|---|
| 390 phone, pinned | 54.3 × **32** | 55.3 × **40** |
| 390 phone, not yet moved | **322 × 42** | 59.3 × 40 |
| 375 iPhone SE, not moved | **307 × 42** | 59.3 × 40 |
| 1280 desktop | 64.3 × 37 | 59.3 × 40 |
| 700 tablet | 54.3 × 32 | 55.3 × 40 |

Height now comes from `min-height`, not padding — the pinned button was a 32px
tap target sitting directly above CHECKOUT. Pinned row 138.1px → 100.4px
un-pinned, pane 209px → 185px (24.8% → 21.9% of a 390×844 phone).

The chooser's confirm button got the same treatment: it took the pinned row to
210px and the pane to 359px — 42.5% of the phone — and is now 171px / 320px while
*gaining* 5px of tap target.

`pgCartFlush` also became a version number rather than a boolean, so an older
copy of `pg-cart-mobile` still live in the theme can no longer claim the flag and
silence the current one for the whole session.

# The pills

`.pg-save-chip` had **zero** dead space left — its 4.1:1 stadium shape was the
*string*, not a layout fault, so no further CSS could round it. The two pills
that were objectively too long were different ones:

| pill | before | after |
|---|---|---|
| `.pg-free-note` "3 FREE INCLUDED" | 168.8px @390 / **229.3px @1280** | 118.9px at both |
| `.nc-lsave-off` "SAVED 74%" | 97.2px | 81.8px |
| `.pg-unlock-tag` "25% off" | 72.4px | 63.2px |
| `.pg-save-chip` | 81.8 × 20 (4.09:1) | **42 × 24 (1.75:1)** |

`.pg-free-note` was the giveaway: it got *longer* as the drawer got wider. It is
inserted as a sibling of the SAVED chip, and the drawer makes that parent a grid
which gives the chip an explicit `grid-area` and `justify-self:start`. The note
got neither, so it was auto-placed into an implicit row at `justify-self:auto` —
stretch — and a stretched grid item with `width:auto` fills its column. Its
`inline-flex` was blockified by grid layout, so inline shrink-wrapping never
applied either.

The SAVED chip's only remaining lever was the word, so it now reads **-74%**
instead of SAVED 74%, in a box 4px taller. `pg-drawer` writes the same element on
its own 800ms clock, so its string was changed to match — two writers with
different text would have flickered between them.

Three supporting fixes:

- **`pg-drawer` and `pg-chips` were writing different geometry to the same
  pills.** Both stamp inline `!important`; `pg-drawer` said `padding:4px 12px`
  and `letter-spacing:.05em`, `pg-chips` said 7px and normal. The pill went wide
  after every cart change and snapped narrow again on the next 300ms tick.
  `pg-drawer` now writes the same values, so there is no race to win.
- **`pg-chips`' guard tested 2 of the 19 properties it writes.** Any other writer
  landing one inline declaration on the other seventeen left both guarded values
  untouched, so every later stamp returned immediately and the pill kept the
  foreign value for the life of the page. Six of the seventeen change the width:
  measured `width:100%` → 276px permanent, `min-width:140px` → 140px permanent,
  never corrected. The guard now covers every width-bearing property.
- **`pg-chips` could not see the write it most needed to see.** Its observer was
  childList-only, and `pg-drawer`'s restyle is an *attribute* change. A scoped
  attribute observer on `#cart` and `.form-cart` now catches it in the same task
  rather than up to 300ms later.

# Two clips that shipped in the last change, and the suite that missed them

`test/run-fab.mjs` tested widths `[320,360,390,430]` — one pixel below the
breakpoint at which the long copy comes back. Every case it ran rendered the
*short* string, so it reported ALL CHECKS PASSED while:

- **≥900px, empty cart:** the bar is capped to 380px while the font returns to
  14.5px, so "ADD TO CART FOR EXTRA 10% OFF" wanted 265.6px in 238.7px and
  silently lost the word **OFF**. It read "ADD TO CART FOR EXTRA 10%" — on the
  default desktop first-visit state.
- **431px:** the phone block stops applying and the copy, both font sizes, both
  gaps, the bar padding and the bag icon all grow in one step. Slack: **0.1px**.

`.pg-cs-long` is now opt-in — hidden by default, shown only across 460–899px
where the smallest measured margin is +29px. Nudging the 430px breakpoint instead
would have dragged the phone font/padding/icon sizes up with it, which is a
different concern.

The suite now spans `[320,360,390,430,431,460,600,768,899,900,1024,1280]` × five
message variants (including the no-clock layout, which was never tested and is
what shoppers see once the peek window expires). Run against the deployed CSS it
produces 7 failures naming exactly those two clips; against the fix, none.

# The sticky bar is centred

`.pg-cs-sub` carried `margin-left:auto`, which right-packed the offer against the
bag icon — an auto margin absorbs *all* free space before `justify-content` is
even consulted, so every spare pixel landed in one lump between the timer and the
offer. Measured gap left-of-text vs right-of-text: 94/9px at 390px, 344/11px at
768px. Shortening the phone copy in the previous change widened that void by
another 69px.

The clock and the offer are one sentence, so they are centred together with
`justify-content: safe center` on `.pg-cs-msg`. `safe` matters: a plain `center`
on a `nowrap`/`overflow:hidden` flex row splits an overflow across both edges and
the start-side half is unreachable — measured, the clock renders at x = −111px,
entirely off the bar, while the offer's tail is cut at the same time.

A bare `center` is kept as a fallback for engines too old to parse `safe`
(iOS Safari before 16), which is only safe because of an invariant now recorded
in the file: the row's sole rigid child is the 42–50px clock in a box that is
never narrower than 183px, so it cannot overflow. Without the fallback those
devices would drop the declaration entirely and keep showing the off-centre bar.

Centring costs no width — `justify-content` only distributes space left over
after flex sizing — so the 320px slack is byte-identical either way: +18.3px
before and after.

**Not changed:** at ≥900px the bar itself is pinned to the right (`left:auto;
width:380px`), 438px right of centre at 1280px. That is deliberate and documented
("a full-width bar across a desktop page reads as a site banner, so cap it and
keep it in the corner the cart already occupies"), and unlike the words it has
never been centred — nothing about it changed recently. Say the word and it is a
one-line change.
# The sticky bar's offer was being cut off on phones

"ADD TO CART FOR EXTRA 10% OFF" wants **225px**. Beside a countdown and a 44px
bag, the message box is:

| screen | box | needed | result |
|---|---|---|---|
| 320px | 175px | 225px | **cut off** |
| 360px | 215px | 225px | **cut off** |
| 390px | 225px | 225px | fits with *zero* slack |
| 430px | 225px | 225px | fits with zero slack |

390px "fitting" is the trap — it fits only because the headless fallback font is
narrower than real Poppins. On a real phone that's a clip too, which is what was
reported.

Under 431px the words **TO CART** are now hidden, leaving "ADD FOR EXTRA 10% OFF"
at about 165px. The full sentence returns above that width. The item wording
("1 ITEM · EXTRA 10% OFF") always fitted and is untouched.

Two supporting changes:

- `.pg-cs-sub` goes from `text-overflow:ellipsis` to `clip`. The parent was
  switched to clip a while back so a tight fit couldn't put dots on the end of
  the offer — but leaving ellipsis on the *child* meant the dots came back the
  moment the child was the thing overflowing. That is exactly what happened.
- The bar's side inset drops 12px → 8px under 431px, which hands 8px back to the
  message.

## The measurement that was wrong the first time

The obvious check — `sub.scrollWidth > sub.clientWidth` — reports "fits" no
matter what, because `.pg-cs-sub` is a shrink-to-fit flex item: its box is always
exactly its content. It tells you nothing about headroom.

The harness now clones the element off-layout at `width:max-content` to get the
width the text actually *wants*, and compares that against what the row can give
it after the clock. Slack now reads 18px at 320px through 128px at 430px, across
three message variants and four widths.

# The pinned upsell was eating the cart

Two changes landed on the same row and compounded: it was made ~20% bigger, and
it was moved *inside* the pinned subtotal pane to stop it being painted over.
Bigger is fine in a scrolling list. Pinned, every pixel it takes is a pixel the
shopper can't use to look at their cart.

**And the occlusion test never caught it**, because that harness loaded
`pg-cart-mobile`'s CSS but not `pg-unlock`'s — so the row it measured was
unstyled. The pane came back 204px and looked fine. With the real stylesheet
loaded it is:

| | row | pane | share of an iPhone SE |
|---|---|---|---|
| before | **155px** | 312px | **46.8%** |
| after | **60px** | 209px | **31.4%** |
| after, two offers pinned | 60px | 275px | 41.3% |

Most of the 155px was one rule: the `max-width:600px` block drops the ADD button
onto its own full-width line, spending a whole row of height on a button that
fits perfectly well beside the copy.

## What changed

A compact variant scoped to `.sticky-in-panel`, so it only applies where the row
is pinned. The desktop drawer keeps the readable size — there the row is still
scroll content and space isn't scarce.

- the ADD button comes back onto the line (`flex:0 0 auto; order:0`)
- thumbnail 60px → 42px
- title 15.5px → 13px, subtitle 12.5px → 11px
- the FREE pill is hidden — the headline already says FREE, and a third line of
  text costs more here than it does in the list

The base size also comes back down from the earlier bump, to sit between where
it started and where it went: thumbnail 66 → 54px, title 16 → 14.5px, subtitle
13 → 12px.

## The harness now loads the real CSS

`run-occlude.mjs` pulls `pg-unlock`'s stylesheet in alongside
`pg-cart-mobile`'s, reports row height, pane height and pane-as-share-of-screen,
and runs a two-offers-pinned worst case (orb + console) on both an iPhone 14 and
an SE. The measurement that was missing is now the one being asserted.

# The 6-pack reads 35%, and it needed a different kind of discount

`Buy 4 Get 2` and `Buy 2 Get 1` are the same deal — 2 free of 6 is 1 free of 3 —
so both badges honestly read 33%. Closing that needed a price change, not a code
change, because a buy-X-get-Y can only ever remove **whole** orbs.

The 6-pack now takes **$72.74 off** — 2.08 orbs — landing on **$137.20**, which
reads 35%. That is exactly the competitor's price, and taking their figure apart
is where it came from: their $72.74 is two free orbs plus **$2.76**, spent
purely to move the badge off 33.

| tile | orbs | price | struck | badge |
|---|---|---|---|---|
| Single Item | 1 | $34.99 | $70.00 | — |
| Buy 2, Get 1 FREE | 3 | $69.98 | $104.97 | SAVE 33% |
| Buy 4, Get 2 FREE | 6 | **$137.20** | $209.94 | **SAVE 35%** |
| Buy 5, Get 3 FREE | 8 | $174.95 | $279.92 | BEST DEAL · SAVE 38% |

The 35% band is narrow — $135.42 to $137.51 — so $137.20 is the defensible
point in it.

## The discount swap

- **Created** `PokeOrb - 6 Pack $137.20` — amount-off, $72.74, minimum quantity
  6, once per order, scoped to the orb.
- **Deactivated** `PokeOrb - Buy 4 Get 2 Free`. It was redundant even before
  this: the repeating Buy 2 Get 1 already frees two orbs at six, so it produced
  the identical $139.96. Deactivated, not deleted — one switch to reverse.

It was created **scheduled** rather than active so the config could be read back
before it went live. That check mattered: `appliesOnEachItem` must be `false`,
because `true` applies $72.74 to *each* unit, every unit clamps to $0.00, and
**all six orbs go free**. Verified `false` on the created node before activating.

`combinesWith.productDiscounts` is `false` on it. Only one product discount
applies per cart line on a non-Plus store — same-line stacking needs Plus plus
`productDiscountsWithTagsOnSameCartLine`, a field that isn't even present in this
store's schema — so the three orb discounts compete rather than add. Setting it
false makes that contest explicit instead of relying on it.

## The whole curve, verified

| orbs | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| bills | 34.99 | 69.98 | 69.98 | 104.97 | 139.96 | **137.20** | 172.19 | **174.95** | 209.94 | 244.93 | 279.92 | 279.92 |

All three bundle tiles land exactly. Two things fell out of it:

**Six orbs cost less than five** — $137.20 against $139.96. Half of that was
already true (the repeating Buy 2 Get 1 made the sixth orb free, so 5 and 6 both
billed $139.96); the amount-off deepens it by $2.76. Nobody should buy exactly
five, and the cart upsell already walks them to six.

**The 6-pack discount wins by $2.76 and only at 6, 7 and 8.** From nine up the
repeating Buy 2 Get 1 frees three orbs ($104.97) and takes over again — correct,
that's the shopper getting the better deal. But Shopify's "best for the customer"
tie-break is *observed* behaviour, not documented behaviour, and the margin here
is thin. If the orb's price ever moves, re-check that $72.74 still beats
`floor(6/3) × unit`, or the 6-pack silently reverts to $139.96 while the tile
still promises $137.20.

# The bundle savings now read on the competitor's scale

The badges said SAVE 67% where the competitor's identical bundle said 33%. The
deal was never different — the **denominator** was.

| | strikes against | Buy 2 Get 1 reads |
|---|---|---|
| competitor | 3 × $34.99 = $104.97 | 33% |
| us, before | 3 × $70.00 compare-at = $210.00 | **67%** |

Compare-at is a $70 MSRP nobody is ever charged, so the badge was measuring the
bundle against a price that appears nowhere else on the site. The bundles are
measured against **units × the single price** now — what those orbs cost bought
one at a time, which is the real alternative a shopper is weighing.

| tile | orbs | price | struck | badge |
|---|---|---|---|---|
| Single Item | 1 | $34.99 | $70.00 | *(no badge)* |
| Buy 2, Get 1 FREE | 3 | $69.98 | $104.97 | SAVE 33% |
| Buy 4, Get 2 FREE | 6 | $139.96 | $209.94 | SAVE 33% |
| Buy 5, Get 3 FREE | 8 | $174.95 | $279.92 | BEST DEAL · SAVE 38% |

Struck figures and badges now match the competitor's exactly on three of the
four rows. Because every orb is the same price, the saving reduces to
`free / total` — 1/3, 2/6, 3/8 — so the badge is simply the fraction of the
pack that arrives free. The test asserts that identity rather than the literal
strings, so the two can't drift.

Tier 0 keeps pgLadder's own `$34.99 / $70.00`: it carries no badge, so there is
no percentage on it to contradict.

## The remaining 33 / 33 is real, and no code can close it

Buy 4 Get 2 *is* Buy 2 Get 1 — 2 free of 6 is 1 free of 3. With whole free orbs
the saving can only ever be `free/total`, and nothing 6-orb-sized lands between
the 3-pack's 33.3% and the 8-pack's 37.5%; the nearest are 5/14 (35.7%) and
4/11 (36.4%), both far bigger packs.

The competitor's 35% is not a better ratio either. Their 6-pack takes $72.74
off, which is **2.08 orbs** — two free orbs plus $2.76 of hand-tuning, bought
purely to make the badge move.

So the three ways out are all pricing decisions: give the 6-pack a third free
orb, shave ~$2.76 off it with an amount-off discount the way they do, or drop
the tier — the repeating Buy 2 Get 1 already frees two orbs at six, so it
delivers that pack unaided.

# Nine cart and product-page fixes

## The cart upsell was never clipped — it was painted over

The offer rows were being cut off at the bottom of the drawer, and the cause was
not an `overflow` or a `max-height`. `placeUnlock()` moved `#pg-unlock-slot` so
it sat as the **immediate previous sibling** of `.sticky-in-panel`, and that pane
is `position:sticky; bottom:0`. A bottom-anchored sticky box is lifted *upward*
out of its flow position whenever that position would fall below the scrollport
— so it renders across whatever precedes it. The pane is opaque white at the
theme's `z-index:5`; the slot is unpositioned. The preceding sibling is exactly
what gets covered, and rule 5 had just guaranteed that sibling was the upsell.

The slot now goes **inside** the pane rather than under it — the one placement
that box cannot occlude, and what "directly above Shipping Protection" meant in
the first place. Raising the slot's z-index was rejected: it would park the
upsell permanently over the CHECKOUT button.

Measured with a probe that asks the compositor (`elementFromPoint`) rather than
trusting the arithmetic:

| | bottom of the offer row |
|---|---|
| before, 8 items @ 390×844 | `PANE` |
| before, 6 items @ 375×667 | `PANE` |
| after, both | `row` |

CHECKOUT stays reachable and the pinned pane stays at 204px — under 72% of the
viewport even on an iPhone SE.

It also dissolves a live mutation loop: `placeUnlock()` wanted to be the pane's
previous sibling and `placeSpacer()` wanted the same slot, both from the same
`apply()`, so they re-inserted the slot on every tick.

## The cart upsell's arithmetic was right; its wording was not

"Buy 1 more, get 1 FREE" never says *which* deal it walks you into, so a shopper
sitting on the 6-orb Buy 4 Get 2 could not tell the row was stepping them to the
8-orb Buy 5 Get 3 — it read like a fourth, unrelated offer. `offers()` now
carries the tier it lands on and the headline names it:

| orbs held | headline |
|---|---|
| 1 | Unlock Buy 2, Get 1 FREE |
| 3 | Unlock Buy 4, Get 2 FREE |
| 6 | **Unlock Buy 5, Get 3 FREE** |
| 8 | *(top of the ladder — no row)* |

The ladder test now asserts the named tier is a real PDP bundle *and* that it
equals the pack the offer actually lands on, so the copy cannot drift from the
maths.

## The SAVED% pill is not stretched — it is just wide

Measured against the drawer's own grid: the pill hugs its glyphs with **0px of
slack** on either side, so there was no layout bug to find. It was built wide.
The width comes off the three things that hold it:

| | before | after |
|---|---|---|
| pill | 96.7px | 81.8px |
| padding | 9px, asymmetric | 7px, symmetric |
| tracking | .05em | `normal` |
| size | 13px | 12px |

`letter-spacing` goes to `normal` rather than a smaller value because it applies
after the *final* glyph too — any non-zero value leaves a gap trailing the `%`.
Two earlier passes tried to balance that instead and both kept the gap.
`word-spacing` and `column-gap` are pinned for the same reason: neither was ever
reset, so an inherited value could widen the pill without appearing in any rule.

The stamp also had two faults: it marked each pill with `dataset.pgChip` and
skipped it forever after, so any pill the drawer rebuilt in place kept
pg-drawer's inline `padding:4px 12px`; and it only ran on a 300ms interval, so
even a fresh pill wore the wide slab for a third of a second and visibly snapped
narrower. The guard is now the rendered value, and an observer runs it in the
same task the pill is inserted in.

## The orb name was waiting on the network

The swipe counter is arithmetic over the DOM and paints on the first frame; the
character name sat behind a `/products/{handle}.js` round trip worth 300–800ms
on a phone. The same media list is already available to Liquid, so it now ships
**with the page** — verified at zero fetches, name present on the first paint.
The fetch is kept as a fallback and now shares one in-flight promise, so the
scroll debounce and five boot timeouts can no longer start five requests for the
same file.

## The rest

- **Sticky top bar dead space.** `.pg-cs-msg` is `flex:1 1 auto`, so it takes
  the whole width the clock and bag leave over — and its children are
  left-packed, parking every spare pixel in one lump between the offer and the
  icon. The offer is pushed to the far end instead.
- **The bottom buy bar shows the product.** A 46px thumbnail following the
  design the shopper picked. Added from `pg-tile-copy` rather than by editing
  the 73KB `pg-theme-css`, since that file writes `.pgst-in`'s innerHTML exactly
  once and repaints only textContent afterwards. It keeps its last good frame
  rather than blinking out on a tick that lands mid-rebuild.
- **The upsell row is bigger** — title 13.5→16px, subtitle 11.5→13px, thumbnail
  52→66px, ADD 13→14.5px, plus a mobile step.
- **Two marquees, both faster.** The top strip goes 16s→10s per loop. The other
  one — four messages over **45s**, about eleven seconds a message — is
  `!important` inside `pg-theme-css`, so it is beaten on specificity from
  `pg-dark` (`html body .pg-marq` is (0,1,2) against its (0,1,0)) rather than by
  rewriting 73KB. 20s is roughly five seconds a message.

## Tests

Four suites, all green: the tile ladder and buy bar (56 checks), the gallery
(23), the cart pane (18) and a new occlusion probe (24). The occlusion and
counter checks were each confirmed to **fail** against a build with only the one
line reverted, so they test the fixes rather than the harness.

# The orb swipe hint: bigger, and the counter keeps up with the finger

Two problems with the pill sitting on the orb photos (`pg-gallery-tweaks`).

## The counter was frozen mid-swipe

`3/35` was repainted by a 90ms debounce hung off the strip's `scroll` event:

```js
strip0.addEventListener('scroll', function(){
  clearTimeout(label._t);
  label._t = setTimeout(label, 90);
});
```

A debounce is the one thing that can't work here. Scroll events fire every
frame, so through a continuous swipe each new event cleared the pending timer
before it could run — the number sat still and jumped once, at the end, when
the strip finally settled.

`paint()` now runs on every animation frame instead, so it counts up under the
finger. Measured over a 12-step sweep with no settle:

| | counter sampled each step |
|---|---|
| before | `1,1,1,4,4,4,7,7,9,9,9,12` |
| after | `1,2,3,4,5,6,7,8,9,10,11,12` |

Two things paid for that frame budget:

- **The button centres are cached.** Reading `offsetLeft` off 35 buttons every
  frame would force a synchronous reflow each time, because the frame before it
  wrote to the counter's `textContent`. The cache is keyed on strip node,
  button count and strip width, so `pg-landing` swapping the strip out
  invalidates it on identity alone. A frame is now 35 subtractions and no
  layout read.
- **The names fetch moved off the hot path.** `label()` is the same pass with
  `loadNames()` awaited in front of it, and still runs on a trailing debounce so
  a late fetch is never stranded.

## The listener didn't survive a gallery rebuild

It was bound to the strip *node*, and `pg-landing` throws that node away and
builds a new one after its fetch — after which the counter only updated via the
MutationObserver's 80ms pass. It now listens on the document in the capture
phase (`scroll` doesn't bubble, but it does capture), which outlives any number
of rebuilds. Covered by a test that replaces the strip and re-sweeps.

## Bigger

| | before | after |
|---|---|---|
| text | 11.5px | 15px |
| arrows | 11.5px (inherited) | 23px |
| padding | 6px 14px | 11px 20px |
| height | ~27px | 41px |

It still covers only the top 50px of a 358px photo, still `pointer-events:none`,
and still fits a 390px phone at 194px wide.

The counter is `font-variant-numeric: tabular-nums` with a `min-width` sized for
the widest reading (`35/35`). Without that the pill is centred with
`translateX(-50%)` and would visibly shimmy left and right as the digit count
changed — which nobody would have noticed while it only repainted once per
swipe, and everybody would notice now that it repaints every frame.

## Tests

Driven headless against a 35-photo stand-in for the strip: 18 checks covering
the sizing, the mid-sweep counter, the character name, a gallery rebuild, and
the touchmove/page-scroll case that used to kill the hint. The two counter
checks were confirmed to FAIL against a build with only the debounce restored
and everything else identical, so they test the fix rather than the harness.

# The sticky buy bar now shows the bundles, and the variants

The bottom buy bar (`#pg-sticky`, built by `pg-theme-css`) showed the selected
tile's price and an ADD TO CART, with **no way to change what was selected** —
and it only appears once the real ladder has scrolled off. The orb page is nine
screens tall on a phone, so by the time the bar shows up the bundles are far
above it, and the one control still on screen silently sells whichever tile was
picked by default: the single.

## What was added

One row above the price/button row:

- **Bundle** — a dropdown naming every *visible* tile with its price and its
  saving: `Buy 5, Get 3 FREE - $174.95 (BEST DEAL · SAVE 69%)`.
- **Storage / options** — a second dropdown mirroring the selected tile's own
  option `<select>` where it has one. That is the console's Storage picker; the
  orb's design pickers are `.pg-drop` widgets, not selects, so they are never
  matched — eight design dropdowns do not belong in a bottom bar.

## It drives the page's controls, it does not replace them

Choosing a bundle **clicks the tile**, so pgLadder's per-tile handler and
`ownSelection()` both run and add-to-cart posts that pack unaided. The option
dropdown writes to the page's select and fires a *bubbling* `change`, which is
what pgLadder's own duo handler listens for. No part of the add path is
duplicated here, so it cannot drift from it.

Visible tiles are found by asking the layout (`getClientRects()`), not by
re-deriving pgLadder's rule — it hides the server-rendered tiles with an inline
`display:none` when it builds its own.

## Where it lives, and why not a new section

It went into `pg-tile-copy`, which already owns these tiles. The alternatives
were worse:

- A **new section** needs a slot in `footer-group`, which has exactly one left.
  Taking it puts the group at the 25-section cap — the documented condition
  where a group renders only its first entries and silently drops the tail — and
  API-added sections are dropped again whenever the theme editor saves.
- `pg-mobile` is registered and already touches `#pg-sticky`, but it is a 26KB
  grab-bag and the picker is about the bundle tiles, not mobile polish.

## Layout

Side by side on a 390px phone the two fields squeezed the storage select to
~45px — `128GB — 10,000 games` rendered as `12...`, and storage is the thing
being chosen. The row wraps instead: flex-basis values wider than half a phone
drop the second field to its own line there, while the orb (one field) still
takes the whole row. Measured: 109px bar on the orb at 390px, 153px on the
console at 390px, 107px at 1280px, no horizontal overflow at any width.

## Verification

- tile ladder suite — **61/61**, including 15 new checks: the row is built and
  sits above the price row, one option per *visible* tile, labels carry
  title/price/saving, choosing a pack selects that tile and moves the bar price
  and the deal note, tapping a tile moves the dropdown back, adding from the bar
  posts the chosen pack (6 units), and the row survives the bar's own 300ms
  repaint.
- new console suite (`run-buybar.mjs`) — **22/22**: both fields on a non-ladder
  product, label read from the page control, options and value mirrored, the
  page control follows the bar *and its own change handler runs with a bubbling
  event*, fallback to the tile's own select when Storage is absent, both duo
  selects move together, pack field hides when only one tile is left, and the
  picker is never duplicated.

# Orb back to $34.99, ladder badges, and eight cart/PDP fixes

Reverts the previous entry's repricing and lands the batch of cart and
product-page corrections. All ten section files were deployed to the draft
theme **PE orb volume tiers + cart pane (Claude)** and verified byte-for-byte
against this repo by MD5.

## Orb price reverted to $34.99

The $33.55 experiment is undone — all 36 variants are back at **$34.99**,
compare-at $70.00. It bought one wanted figure ($134.20) at the cost of
dropping the orb's price on every surface of the shop, and could not buy the
other ($169.95 needs 4.86 paid orbs at $34.99; 5 × $33.55 is $167.75, not
$169.95). One unit price cannot satisfy both.

The tiles quote the nearest reachable whole-orb figures instead:

| tile | orbs | paid | cart charges | struck | save |
|---|---|---|---|---|---|
| Single Item | 1 | 1 | $34.99 | $70.00 | 50% |
| Buy 2, Get 1 FREE | 3 | 2 | $69.98 | $210.00 | 67% |
| Buy 4, Get 2 FREE | 6 | 4 | **$139.96** | $420.00 | 67% |
| Buy 5, Get 3 FREE | 8 | 5 | **$174.95** | $560.00 | 69% |

**A known flat spot:** Buy 4 Get 2 and Buy 2 Get 1 are the *same* discount rate
— both pay 2 of every 3 — so both badges honestly read 67%. The 6-pack buys
more orbs, not a better rate. Only the 8-pack improves on the ladder. That is a
pricing decision, not a code one.

## Product page

- **BEST DEAL moved to the 8-pack**, and every tier now states its saving. Tier 1
  gave up "Best Deal!" for "SAVE 67%"; the 8-pack carries "BEST DEAL · SAVE 69%"
  — the badge is the only place a tile can claim to be best, and dropping the
  number would have left the rung shoppers are steered to as the only one not
  saying what it saves.
- **The note under Add to Cart follows the selected tile.** It was one fixed
  sentence about the 3rd orb whichever rung was picked; it is now derived from
  the selection and repainted on every change.
- **The swipe hint is permanent.** It was removed on the first `scroll` *or*
  `touchmove` — and a finger that starts on the gallery and drags down scrolls
  the *page*, firing touchmove on the strip, so scrolling past the photos killed
  it. That is exactly the reported "it goes away when you scroll". It is now a
  standing label carrying position in the strip (`3/35`).
- **Brighter whites.** Headings go pure `#FFFFFF` (were `#F5F1FA`), secondary copy
  to `#E6DFF2` (was `#C1B4D2`). The Ships By / Easy Returns / Free Shipping row
  gets white labels one weight heavier, near-white values, and icons with a
  brighter, heavier stroke in a disc with an actual edge.

## Cart

- **The SAVED% pill hugs its text.** Padding 15px → 9px, and the trailing
  letter-spacing gap after the `%` is *removed* (`padding-right: calc(9px - .05em)`)
  rather than balanced with a `text-indent`, which had kept the gap and added a
  matching one at the front.
- **The percentage counts every discount, including the 10%.** Order-level
  discounts land in `line_price` and line-level ones in `final_line_price`, and
  which is smaller depends on what is running — so reading either alone
  under-reports. It now takes the lower of the two.
- **The upsell offers the next tier up.** It only ever offered the 3rd orb. It
  now walks the same 2/4/5 ladder as the product page, works out how many units
  already came free, and names the ones about to arrive ("5th & 6th").
- **Free-shipping banner in white** (was `#E4D9F0` on the drawer's darkest
  surface), truck icon with it.
- **The sticky top bar's trailing "…" is gone**, and it says what is in the cart:
  `1 ITEM · EXTRA 10% OFF`. The ellipsis came from `text-overflow:ellipsis`
  truncating "ENTIRE ORDER" on a 390px phone; the wording is shortened at the
  source and overflow is now clipped, so there is nothing to truncate.

## Two bugs the tests caught

- **`pg-tile-copy` would have frozen the product page.** `note()` compared
  `p.innerHTML` against a string containing `&mdash;`, but the parser turns that
  into a literal em dash, so the read-back never matched, every pass rewrote the
  node, and the `MutationObserver` re-fired `pass()` — an unbounded microtask
  loop. The tile suite hung on its first `$$eval` because the page's main thread
  was spinning. Both this and the same ineffective guard in `pg-cart-sticky`
  (which repainted the bar every second) now compare against what was last
  written, held on a JS property so keeping the record is not itself a mutation.

## Verification

- tile ladder suite — **46/46 pass** (prices, badges, per-tier note, pickers,
  add-to-cart unit counts, no duplicate tiles, sold-out variants excluded)
- cart pane suite — **all pass** (no blank slab, CHECKOUT reachable and never
  clipped, at 5/8/12/30 items on phone and desktop)
- cart upsell ladder unit tests — **all pass** (offers land on real tiers at every
  quantity 1-9, paid/free arithmetic matches what Shopify charges)
- every deployed file MD5-verified against this repo

# Orb repriced to $33.55 so every tile matches the cart to the cent

## The problem

A Buy-X-Get-Y discount can only take **whole orbs** off, so a tile can only ever
quote `paid units x unit price`. At $34.99 the wanted prices were not whole
multiples:

- $134.20 ÷ 34.99 = **3.84** paid orbs
- $169.95 ÷ 34.99 = **4.86** paid orbs

No discount could have made the cart agree with either tile. The gap was $5.76
and $5.00 — hidden while the standing "Extra 10% off entire order" ran, and an
over-promise the moment it ended.

## The fix

All 36 orb variants repriced **$34.99 → $33.55** (LIVE store change, on the
owner's instruction). Compare-at stays $70.00.

| tile | orbs | paid | cart charges | struck | save |
|---|---|---|---|---|---|
| Single Item | 1 | 1 | $33.55 | $70.00 | 52% |
| Buy 2, Get 1 FREE | 3 | 2 | $67.10 | $210.00 | 68% |
| Buy 4, Get 2 FREE | 6 | 4 | **$134.20** | $420.00 | 68% |
| Buy 5, Get 3 FREE | 8 | 5 | **$167.75** | $560.00 | 70% |

The 6-pack lands on $134.20 exactly. The 8-pack is 5 × 33.55 = **$167.75**, so
that tile now reads $167.75 rather than the $169.95 originally asked for — one
unit price cannot satisfy both, and $167.75 is the one the cart can honour.

Single and Buy 2 Get 1 Free moved on their own: their figures are pgLadder's
arithmetic on the variant price, not literals in `pg-tile-copy`.

With the standing 10%-off-order combining on top, shoppers pay $30.19 / $60.39 /
$120.78 / $150.97 — **under the tile, never over it**.

## Guard against it drifting again

The tile suite now asserts, per tier, that the quoted price equals
`paid units × $33.55` to the cent — so if the orb price moves without `EXTRA`
moving with it, the tests fail rather than the storefront quietly over-promising.
41 checks, all green.

`EXTRA` in `sections/pg-tile-copy.liquid` is the one place to edit these, and the
file's header says what to recompute if the unit price changes.

## Applied to
Product `9185353367780` (all 36 variants, live) and draft theme `163067101412`
(`sections/pg-tile-copy.liquid`, verified byte-for-byte by MD5).

---

# Cut-off CHECKOUT, white cookie copy, bigger trust icons, reviews 2-3 across

All in draft theme `163067101412` on `www.thepocketera.com`. The live theme is
untouched — publishing is blocked through the API and has to be done by hand in
Shopify admin.

## 1. CHECKOUT was being cut off — a regression from the last pass

Removing the 400px skirt (previous entry) also removed the thing that was
accidentally holding this up.

**What was wrong.** `async-panels.css` sticks the pane at `bottom:-10px`, and a
STUCK sticky box is not confined to its containing block the way the spec reads:
measured against a drawer scrollport ending at y=700, `-10px` put the pane's
bottom at **704**, and `seatPane()`'s downward shift (`bottom:-54px`) put it at
**720**. Overflow clips at the padding box, so up to 20px of pane — the bottom of
the CHECKOUT button — sat outside the drawer. That only ever worked because the
400px skirt made the drawer scrollable on *every* cart, so those pixels could be
scrolled to. No skirt, no scroll, no CHECKOUT.

**The fix.** Two parts, both in `sections/pg-cart-mobile.liquid`:

- `#cart .sticky-in-panel{bottom:0}` seats the pane on the clip edge.
- `seatPane()` loses its downward shift entirely and keeps only a guarantee: if
  the button lands below the drawer's visible floor and the drawer cannot scroll
  that far, the pane is raised by exactly the overshoot. The floor is measured
  from the DRAWER's scrollport (capped by the visual viewport), not from the
  viewport — measuring the viewport was the original mistake, since overflow
  clips at the drawer's padding box.

Measured mid-scroll, four viewport/cart combinations, px past the clip edge:

| | old shift | theme default | shipped |
|---|---|---|---|
| pane | +54 | +10 | **0** |
| CHECKOUT button | +48 | — | **-6** (inside) |

Plus the full 18-case cart suite still green: no blank slab, no scrollable void,
pane never past the clip edge, CHECKOUT reachable in every case.

## 2. Cookie consent copy in white — `sections/pg-dark.liquid`

The notice is Shopify's own `#shopify-pc__banner` (the theme's `cookie-banner`
section is disabled in overlay-group), already styled from pg-dark. Its copy was
`#E4DCF0` on the dialog and `#C9BFD6` on the paragraph — a muted lavender that
reads as greyed-out on `#120B1A`. Every text node in the banner is `#FFFFFF` now.

The policy link keeps purple only as its underline: a link the same white as the
sentence around it is invisible as a link, and tinting the word would have put
the one non-white word in the middle of the copy.

## 3. Trust icons bigger and more detailed — `sections/pg-home.liquid`

44px 1.5-weight outlines in a 46px-padded band left each cell mostly empty. Now
78px desktop / 92px mobile (where they are one per row), stroke-width 2, drawn
on a 48-unit grid so real detail survives:

- **van** — cargo body with panel lines, cab with a glazed window, wheels with
  hubs, speed lines behind it (was a rectangle and two circles)
- **shield** — inner face so it reads as a crest, heavier tick, two sparks
- **padlock** — keyhole and shank, a highlight along the shackle, body rivets
  (was an empty rounded rectangle)

One thing worth knowing: the filled accents use `currentColor`, and pg-dark sets
`.pgh-trust{color:#C1B4D2}` — so they came out grey against a purple stroke until
`color:var(--p)` was added to the icon rule.

## 4. Reviews 2-3 to a row — `sections/pg-reviews-text.liquid`

pg-landing had `.pgx-cards{columns:1}` under 900px, so every review ran the full
page width and the section was one tall column. Now four across on a wide screen
(unchanged), **three on a tablet, two on a phone**, with the type stepping down on
the phone so a ~165px card is not a column of two-word fragments.

Measured: 1280px → 4 per row (296px cards), 768px → 3 (231px), 390px → 2 (166px).

The rule lives in `pg-reviews-text` rather than `pg-landing` deliberately: that
file is already the reviews' override layer, already global, and 3.8KB against
pg-landing's 40KB. Id-scoped selectors mean specificity, not load order, decides.

## Applied to
Shopify draft theme `163067101412`, via Admin API `themeFilesUpsert`; all five
files verified byte-for-byte against local by MD5 after upload.

Files changed:
- sections/pg-cart-mobile.liquid
- sections/pg-dark.liquid
- sections/pg-home.liquid
- sections/pg-reviews-text.liquid

---

# Orb volume tiers + the blank slab under the cart's subtotal pane

Shop `www.thepocketera.com` (Pocket Era). Both changes are in a NEW DRAFT theme
duplicated from the live one, `163067101412` — "PE orb volume tiers + cart pane
(Claude)". Nothing was written to the live theme.

## 1. Two more volume tiers on the Crystal Legends Orb

The upsell ladder on the orb PDP is built at runtime by `window.pgLadder`
(`sections/pg-theme-css.liquid`), then rewritten by `sections/pg-tile-copy.liquid`,
which deletes pgLadder's dead Trio/Quad tiers and turns the Duo tile into
Buy 2 Get 1 Free. So `pg-tile-copy` is where the ladder actually is, and where
the new tiers were added — as additions:

| tier | tile               | orbs | shown   | struck  | badge    |
|------|--------------------|------|---------|---------|----------|
| 0    | Single Item        | 1    | $34.99  | —       | —        |
| 1    | Buy 2, Get 1 FREE  | 3    | $69.98  | $210.00 | Best Deal! |
| 4    | Buy 4, Get 2 FREE  | 6    | $134.20 | $420.00 | SAVE 68% |
| 5    | Buy 5, Get 3 FREE  | 8    | $169.95 | $560.00 | SAVE 70% |

Tiers 0 and 1 are untouched — copy, prices and the "Best Deal!" badge all as
they were. The new tiles are built with pgLadder's own classes and its own
picker factory (`window.pgDrop`), one picker per orb, so its existing
add-to-cart posts 6 and 8 units with no interception.

Two things the shape of the existing code forced:

- **Tier numbers 4 and 5, not 2 and 3.** `ladder()` deletes any tile numbered
  2 or 3 (pgLadder's dead offers), so 2/3 would be built and destroyed on
  alternating passes.
- **Selection is normalised on the document.** pgLadder's per-tile click
  handler is closed over the array of tiles *it* built, so it cannot clear
  `pgx-sel` from a new tile — and add-to-cart reads the FIRST selected tile in
  the document. One delegated listener now owns selection for every `.pgx-lad`.

The shown prices are literal (in `EXTRA`, in cents): they are chosen price
points, not arithmetic on $34.99. The struck-through figure is derived the same
way tier 1 derives its own — compare-at × orbs in the pack.

### The checkout side

Both matching automatic discounts were created on the store (LIVE, on the
owner's say-so — discounts are not theme-scoped):

- `PokeOrb - Buy 4 Get 2 Free` — buy 4 of the orb, get 2 at 100% off
- `PokeOrb - Buy 5 Get 3 Free` — buy 5 of the orb, get 3 at 100% off

One use per order each, combining with product / order / shipping discounts —
the same settings `PokeOrb - Buy 2 Get 1 Free` already carries. Shopify applies
whichever automatic discount is worth most, so the repeating Buy 2 Get 1 Free
still wins where it beats them (12 orbs: four free, not two).

So the shopper pays under the tile, the same way tier 1 already behaves: 6 orbs
bill $139.96 and 8 orbs $174.95, with the standing "Extra 10% off entire order"
combining on top (verified: `combinesWith.productDiscounts` is true on both
sides). **Worth watching** — those pre-10% figures sit *above* the tiles'
$134.20 and $169.95. While the 10% promotion runs the tiles under-quote in the
shopper's favour; if it ends, the 6-orb tile under-quotes by $5.76 and the
8-orb tile by $5.00, and `EXTRA` in `pg-tile-copy.liquid` needs revisiting.

Verified in headless Chromium against a harness reproducing pgLadder's tiles,
`pgDrop` and its add-to-cart: 37 checks — order, copy, prices, badges, picker
counts, tiers 0/1 unchanged, one-tile-selected on every click, 6 / 8 / 3 / 1
units posted per tier, sold-out variants never offered, no duplicate tiles under
the 1.2s poll, and the new tiles removed if the ladder is torn down (leaving
them would stop pgLadder rebuilding — its guard is `if
(document.querySelector('.pgx-lad')) return`).

## 2. The blank white slab under CHECKOUT in the cart drawer

Three causes, all in `sections/pg-cart-mobile.liquid`, measured before and after
in headless Chromium at 1280×900, 1024×1250 and 390×844, with 1, 2 and 12 items:

| | before | after |
|---|---|---|
| scrollable white void below the pane | 346px | 0px |
| blank strip inside the pane under CHECKOUT | 34px | 6px |
| bare drawer ground below the last row | 14px | 0px |

- **The skirt was laid out, not just painted.** `#cart .sticky-in-panel::after`
  was a 400px-tall absolutely positioned box, and an abspos descendant extends
  its scroll container's scrollable overflow — so every cart carried ~360px of
  scrollable white below CHECKOUT. Measured: content 900px, `scrollHeight`
  1260px; with the skirt suppressed, 900px and not scrollable at all. It is now
  a 400px box-shadow **spread** from a zero-height box (shadows never contribute
  to overflow), clipped downward. Not the offset shadow the file's own note
  rejected — that one was `0 400px 0 0`, which slid the cover past the strip it
  was meant to hide.
- **The flex spacer was phones-only.** `#cart` is a flex column, so a short cart
  drops its leftover height below the last child. `pg-cart-spacer` fixed that
  under 760px and was removed on desktop. It is unconditional now, and is zero
  pixels tall when there is nothing to absorb.
- **`:last-child` was landing on a hidden node.** `pg-drawer`'s `pgPane()` moves
  the payment strip into the pane as its last child and rule 4 hides it, so
  pg-cart-fast's `> *:last-child{margin-bottom:0}` never reached the real last
  visible row. The trailing margins are named explicitly now, and the pane's
  bottom padding is trimmed at every width rather than under 600px only.

Checkout button visibility is asserted in every case; the pane stays pinned
(`position:sticky` untouched — the iOS Safari failure mode the file warns about
is not gone near).

## Applied to
Shopify draft theme `163067101412` on `www.thepocketera.com`, via Admin API
(`themeDuplicate` from live `163046228196`, then `themeFilesUpsert`).

Files changed:
- sections/pg-tile-copy.liquid
- sections/pg-cart-mobile.liquid

---

# Cart drawer: stop discount/progress flicker (safe override)

## Problem
In the cart drawer, the free-shipping / discount progress bar and status
messages visibly flickered and briefly showed the wrong discount before
settling, especially as line items or quantities changed.

## Cause
Two things compound in `nc-cro` (the large, checkout-adjacent CRO file):
- A redundant, **un-debounced** `MutationObserver(drawerExtras)` runs on every
  cart mutation, on top of the well-behaved debounced `cartObs` observer that
  already calls `drawerExtras` (disconnect/reconnect guarded). The two race and
  re-render the drawer extras repeatedly.
- The progress-bar fill and status text swap their values instantly, so each
  recompute reads as a hard "snap"/flash rather than a smooth change.

## Fix
Added a self-contained override block to `sections/nc-nohover.liquid`, which
loads after `nc-cro` so it wins cleanly. **No checkout or add-to-cart logic is
touched** — the fix is a guard flag plus CSS:

- **Pre-stamps `#cart[data-nc-extras]`** at parse time (with a short-lived
  `documentElement` observer fallback) so `nc-cro` skips creating its redundant
  observer. `drawerExtras` still runs via the debounced `cartObs`, so nothing is
  lost; if the stamp loses the race it is a harmless no-op.
- **Adds width/color/opacity transitions** to `.nc-track-fill` and the
  ship/discount/tier/gift status elements so value changes ease instead of
  snapping.

Because `nc-cro` is a live-theme file (177KB, not tracked in this repo) and the
storefront isn't previewable from here, the fix was scoped to the override layer
to eliminate any risk to the cart/checkout path. A deeper consolidation of the
competing observers should be done with live preview (Shopify CLI).

## Applied to
Files changed: sections/nc-nohover.liquid

---

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

# Site fix: free-gift bar restyle to match the brand

## Problem
The "Free 5-Level Resistance Band Set / GIFT WITH ANY PURCHASE / INCLUDED FREE"
bar (`.nc-gift-home`, injected by `nc-cro.liquid`) used a mint-green gradient
(#F6FAF6 -> #B7D6C4) with a tan pill, clashing with the site's cream/sand + teal
brand palette.

## Fix (`sections/nc-nohover.liquid`, loads last globally)
Appended a scoped override:
- Bar background -> brand cream/sand gradient (#F7F1E3 -> #E6D6B4) with a subtle
  teal border and soft shadow, so it reads as an on-brand raised card.
- Eyebrow -> brand teal (#2C6E72); heading charcoal (#0F2A33); sub muted (#3C5860).
- "INCLUDED FREE" pill -> brand teal gradient (#2C6E72 -> #15414A) with white text
  (keeps the existing subtle shimmer animation).

Scoped with `#content .nc-gift-home` for specificity; nc-nohover loads after
nc-cro so it wins cleanly. No change to layout or responsive sizing.

## Applied to
Shopify draft theme 161868382436 via Admin API (themeFilesUpsert).
Files changed: sections/nc-nohover.liquid

---

# Homepage: free-gift promo in the hero + header

The gift promo is injected at runtime (not in theme files) and only appeared on
collection pages, so instead of moving that element, added two self-contained,
on-brand free-gift elements (in `sections/nc-nohover.liquid`, global, homepage-scoped
by selector):

- **Hero card** (`.nc-herogift`): a compact cream/teal card injected into the hero
  left column (`.nch-hero-text`), filling the empty space under the trust row.
  "Free 5-pack resistance bands / Added free to every order. No code needed." + FREE pill,
  links to /collections/best-sellers.
- **Header pill** (`.nc-hdr-gift`): a small teal pill in the empty space left of the
  logo (desktop only, min-width 1001px), "🎁 Free 5-pack resistance bands",
  links to /collections/best-sellers. Hidden on mobile.

Both are created via JS with retries + a MutationObserver so they appear reliably.
