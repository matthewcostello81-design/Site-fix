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
