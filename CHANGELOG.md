# Home cards: button, badge and price in the titles' type

By report: "that font doesn't match our theme font, like the product titles
on the homepage." Poppins is the theme's heading font and is loaded at
400-700 on every page, so the family already matched; what read as a foreign
font was the styling carried over from the product tiles: uppercase, .06em
tracking and an 800 weight (which renders as 700, the heaviest loaded)
beside sentence-case 500 titles.

`sections/pg-home.liquid`: the card button keeps the tiles' fill, size,
corners, arrow and 8s wave, in the titles' type (Poppins 600, sentence case,
no tracking); the Sale badge keeps the SAVE badge's colours in the same type;
the price line is 600 untracked (pg-theme-css stamped it 800 with .01em) and
the struck price 400.

# The ADD TO CART wave was pinned by !important background shorthands; home struck price readable

By report: "add to cart buttons on the homepage are not dynamic and the
crossed out price is hard to see."

In the cascade an !important declaration beats a keyframe animation, and a
`background:` shorthand marked !important sets background-position along
with the colour. pgShiftT animates background-position, so every such rule
on a waving button held its gradient still, whatever was stamped inline
(inline stamps set the image and size, never the position). Measured in a
harness carrying the base theme CSS and the full footer group: with pg-dark
as it was, the home button's background-position sat at 0% 0% across the
run; with the fix it advances 20% -> 98% over 2.4s, in step with the
product page's main button.

- `sections/pg-dark.liquid`: the home card button's fallback and hover use
  background-color, not the shorthand.
- `sections/pg-dark-atc.liquid`, `sections/pg-landing.liquid`,
  `sections/pg-theme-css.liquid`: the product page's main ADD TO CART
  (.pgx-atc) had the same pin from three rules (its base fill, the dark
  skin's fill, and both hovers); all are longhands or a brightness hover
  now, so pg-theme-css's inline wave runs on it as on the tiles.
- `sections/pg-home.liquid`: the card's struck price is .82 white at
  medium weight (the page is dark; #666 vanished into the card).

# Cart offer: the rate read where this store reports it; two review findings

From an adversarial review of the day's diff (three of its five confirmed
findings were the home-page cascade problems already fixed above).

`sections/pg-cart-offer.liquid`
- The extra 10% is read from cart_level_discount_applications as well as the
  per-line allocations. On this store /cart.js reports it at cart level
  (pg-drawer's savings row reads it there), which is why the first cut, which
  looked only at the lines, found nothing. The admin's 10% stays the default;
  a rate found in either place replaces it, so a change to 15% in the admin
  reads "Extra 15% off included" on the next read.
- paint() drops the node cached on each offer before matching: a drawer
  rebuild throws the cards away, and a repaint from the last offers that
  still trusted the cached node reused the detached one and inserted nothing,
  leaving the cart without a card until it next changed.
- A read that went out before one of our writes landed is discarded (a
  generation counter): it could repaint the just-used offer as a live card for
  a second, a window for a double add.

# Cart offer: the pack card reprices as the GB is picked

By report: "the price is not changing when they choose a different GB in the
cart upsell." The price line was written once when the card was built, for
the default size.

`sections/pg-cart-offer.liquid`: a change on the card's GB picker looks the
pack variant up again (the consoles in the cart plus the picked one) and
rewrites the price line: struck compare-at, net figure with the extra 10%,
SAVE chip; the thumbnail follows the variant when it has one. perform()
reads the same picker, so what is printed is what is added. Duo 64G + 128G
reads $219.98 / $134.08 / SAVE 39%; Trio 64 + 64 + 128 reads $319.97 /
$178.17 / SAVE 44%.

# Cart offer: the pack goes in before the old lines come out

By report: "when they add a 3rd R36S through the upsell the whole cart goes
blank." The Duo to Trio upgrade took the Duo line out first and put the Trio
in second, and for the beat in between the cart held nothing but the free
case: pg-giftguard pulled the case (no console to earn it), the drawer's
watchers re-rendered the side-cart section in its EMPTY state, and the
shopper looked at a blank drawer.

`sections/pg-cart-offer.liquid`
- Pack upgrades and pack switches add the pack first and remove the lines it
  replaces after, so the cart is never empty and never without a console. A
  retry after a failed removal never adds a second pack (the add is
  remembered on the offer); a removal that fails leaves both lines standing,
  which the shopper can see and fix, rather than a cart with neither.
- The reader no longer gives up when the drawer shows no line list: with
  lines in the cart that is the empty render caught mid-flight, so it asks
  pg-drawer for a fresh section once per cart state and reads again when it
  lands.

# Home page: pg-home now owns its buttons and badges; cart card: best price always, no swaps, smooth add; Single tile picker back on its own row

By report: "nothing has changed on the homepage" (it had not: two footer-group
sections were overriding pg-home); "the cart upsell is not showing the price
including 10% off -- it showed $135 for the Duo Pack, then $122 once added;
show the best price and state the 10% is included"; "slight glitching and a
delay when you add an upsell, and I saw it swap upsells"; "when you delete
everything from the cart a random orb upsell pops up then disappears"; and
"the GB dropdown on the single R36S is hard to see -- put it back how it was
in the first revision".

`sections/pg-theme-css.liquid`: its cardAtc() restamped the home cards' ADD
TO CART inline with the old 13.5px pill under the same data-pgStyled flag
pg-home used, and because that script runs before DOMContentLoaded it won the
race every time, so pg-home's new button never showed. cardAtc() now only
seats the button at the card's end. Its #pgh .pgh-atc pill rules and its
moving-gradient #pgh .pgh-badge rule are gone too.

`sections/pg-home.liquid`: styleAtc() uses its own flag and re-runs on a slow
beat; the arrow is a real span (the base theme hides button::after and
pg-theme-css kills it); the badge rule is !important at html-body-id
specificity so pg-dark-atc's solid #8B44BE / border:0 no longer wins.
Verified in a harness carrying the base theme CSS, pg-theme-css, pg-dark,
pg-dark-atc and pg-mobile with the old restamp running first.

`sections/pg-cart-offer.liquid`
- The 10% is the default, replaced only by a rate the cart positively shows
  in its line-level allocations, never zeroed by absence. The first cut zeroed
  it when it could not read an allocation, which is why the live card printed
  the gross $135.98 the till then charged $122.38 for.
- Free lines no longer name the newest family: the free case lands a beat
  after the console and was making the console family "newest" over an orb
  the shopper had just added (the card swapped), and a cart holding only the
  free case mid-way through emptying named the console family with no console
  and fell to the orb cross-sell (the orb card that popped up and vanished).
- On add, the card stays put marked "Added" until the fresh read swaps in the
  next offer in one paint (it was pulled out at once, the slot collapsed, and
  the next card arrived a second or two later). A read requested during a
  read runs right after it; a drawer rebuild that wipes the card gets it back
  synchronously from the last offers, without a fetch first.

`sections/pg-r36s-mobile.liquid`: restored to the version before the two
picker moves (the GB dropdown on its own row under the head, as first built).

# Cart offer: one card, for the product added last

By request: "limit it to 1 upsell max. It should go off the product they
added, but if they max out that product with all item combos then move to
the next item."

`sections/pg-cart-offer.liquid`: at most one card. /cart.js lists lines
newest first, so the first line with a known handle names the family (the
free case counts as the console's). That family's deal is offered; when it
has none left (every console has a case; orbs between 9 and 11, where no
free-orb promise is honest), the other families in the cart are tried,
newest first. A plain "Add another Orb / Print" is shown only when no family
has a deal, and a Crystal Legends Orb cross-sell only when nothing else can
be offered, so the cart is never without a card. The console family no
longer falls through to the orb cross-sell on its own.

# Home page buttons and badges match the tiles; the 10% stated in every cart card; Single tile picker beside "25% OFF today"

By request: "add to cart on the homepage for each item should have that same
dynamic add to cart button", "the Sale in the top left corner of the products
on the homepage should be the same colour as the SAVE % in each bundle", "I
don't like where you moved the GB on the single R36S -- put it next to the
25% off today thing", "all the upsells should include the extra 10% and state
it in the upsell, and make sure the save % is accurate".

`sections/pg-home.liquid`
- The three product cards' ADD TO CART is the product tiles' button restated
  (pg-r36s-mobile's .pg-r36-atc): 15px/12px padding, 10px corners,
  15.5px/800 uppercase with the arrow, the same five-stop moving purple at
  the same 8s. It was a slimmer 13.5px pill. Hover brightens instead of
  swapping in a still dark fill (which also stuck after a tap on phones).
  The pgShiftT keyframes are restated in the section so the buttons never
  depend on pg-theme-css (footer-group) being present.
- The Sale badge wears pg-save-badge's .pgx-lad-badge look: the deep purple
  gradient (#8B44BE -> #7A2FA2 -> #4A1C66), pale text, 12.5px/800 uppercase.
  Its percentage is Liquid's floor of compare-at vs price (25 / 25 / 56) and
  matches the price printed under it.
- The card's struck price is #666, not #8a8a8a.

`sections/pg-cart-offer.liquid`: every card carries its own "Extra 10% off
included" line (purple, under the sub-line) instead of one note under the
cards; the case card's sub-line is shorter ("One per console; the 1st is
free"). The SAVE chip measures the struck figure against the net price, so
it is what the shopper actually keeps: Duo upgrade 38%, Trio upgrade 44%,
two cases 49%, "Buy 1 more, get 1 FREE" 55%, a lone orb 32%.

`sections/pg-r36s-mobile.liquid`: the Single tile's GB picker sits in a row
with "25% OFF today" (a .pg-r36-subrow the script builds around the sub),
not under the price. pg-case-mobile parks the "+ FREE Case" chip right after
the sub on every tick, so the chip lands inside that row; it is CSS-ordered
last, after a full-width break, so it keeps its own line and the two scripts
never fight over the DOM.

# Cart offer: the extra 10% in every price, cases for every console; struck prices brighter

By request: "auto include the 10% off in the upsell price and say that
somewhere for all upsells", "if you upsell to 3 pocket boys the next upsell
should be 2 cases not 1", "make the crossed out prices more visible", and, on
the Single R36S tile, "make the GB dropdown more up to the right instead of
taking a whole new line". The ADD TO CART buttons keep their size ("actually
keep the add to cart same size" reversed the shrink asked for minutes before).

`sections/pg-cart-offer.liquid`
- Every card prints the net price: the admin's "Extra 10% off entire order"
  (automatic, every item, stacks with the Buy X Get Y) is folded into the
  figure beside the struck compare-at, and the SAVE chip measures the net. The
  rate is read from the cart, not hard-coded: Shopify allocates that discount
  onto every paid line, so switching it off in the admin drops it out of these
  prices on the next read; a cart with no paid line falls back to 10%.
- One line under the cards: "Prices include your extra 10% off, applied at
  checkout". The two sub-lines that named the 10% themselves are gone (the
  cross-sell now reads "Buy 2, Get 1 FREE"; "Add another Orb" has none).
- "Switch to the Duo/Trio Pack" compares the singles' pre-discount line prices
  to the pack (it compared post-discount singles to the gross pack, so with
  the 10% on, the switch never showed for two singles) and quotes the net
  difference ($14.40 for a 64G + 128G pair).
- The case offer is one card for every console without a case: the free gift
  is one per order, so a Trio Pack is offered "Add 2 protective cases"
  ($25.18 for both, net) and a Duo Pack plus a single the same; one spare
  already held brings it down to one.
- Struck prices in the card: #666 at 12.5px, not #8a8a8a at 12px.

`sections/pg-theme-css.liquid`: the product tiles' struck prices (Single,
Duo, Trio and the orb ladder) are .85 white at 13.5px medium, not .55 white
at 12.5px; the inline colour tilePaint() stamps on them moves with it.

`sections/pg-drawer.liquid`: the cart lines' struck prices (.nc-lsave-was,
s.pg-lwas) are #666, not #8a8a8a; s.pg-lwas 13.5px.

`sections/pg-r36s-mobile.liquid`: the Single tile's storage picker moves into
the price column, right-aligned under the price, instead of a row of its own
under the head (storageUp(); pg-theme-css's own .pgx-storage select and its
"Storage" label ride along, label dropped). The in-tile ADD TO CART keeps
15px / 15.5px. `sections/pg-tiktok-pdp.liquid`: the orb tile's button likewise
unchanged in size.

Not changed: the Duo Pack's SAVE badge. 64G + 64G saves 32.0%, 64G + 128G
32.3%, 128G + 128G 32.5% against the packs' compare-at prices, all flooring to
32%; the dollar saving climbs ($64, $71, $78) but the percentage is flat by
construction of the pack prices.

# Cart upsells: one clean card per family, always something to offer

By request: "there should always be upsells in the cart even at max orbs or max
game boys -- game boys add another case, orbs add more orbs -- less cluttered,
cleaner, simpler; still able to choose Pokemons and GBs; optimised for iPhone
16 Pro Max and iPhone 13."

New `sections/pg-cart-offer.liquid` (header-group). It hides the four rows the
old writers stacked into #pg-unlock-slot (pg-unlock rails, pg-cart-tune's Duo
upgrade and spare case, pg-frame-add's accessory; their scripts keep running,
pg-unlock's duplicate-line repair included) and paints at most two cards,
console first:

- consoles: 1 single -> "Add a 2nd R36S: the Duo Pack" with a GB picker;
  2 or 3 singles -> "Switch to the Duo/Trio Pack" (same consoles, less);
  a Duo Pack -> "Add a 3rd R36S: the Trio Pack" with a GB picker; anything
  else -> a spare case until every console has one, then a Crystal Legends Orb.
- orbs / wall art: the next rung of the ladder the product page sells, phrased
  as the shopper experiences it ("Buy 1 more, get 1 FREE", "Add your FREE 3rd
  Orb", "Buy 3 more, get 3 FREE"), one design picker per unit added, defaulted
  to designs not already held. Past the ladder's top the repeating Buy 2 Get 1
  is offered once it beats the Buy 5 Get 4 already earned (from 12 orbs); at
  9-11 a single orb is offered plainly, since no free-orb promise is honest
  there (Buy 5 Get 4 is once per order in the admin).

Follow-ups the same day: the card is more compact (smaller type, 30px
pickers three to a row, 38px button), the "FREE" picker labels are hot pink,
and the orb offers carry no sub-line since the title already states the deal.

Pack upgrades take the single line out by key and put the matching pack
variant in, so the cart charges the pack price the card printed; every write
checks r.ok and a failed removal never proceeds to an add. Prices and
compare-ats are read live from /products/*.js. Reads are single-flight with a
watchdog, and a changed cart must be seen twice before the card is rebuilt.
Verified in a mocked-cart harness across 12 cart states at true 390px and
430px viewports, including the writes each tap sends.

---

# Orb page: tiles read like the console's; one in-tile button, not two

- `sections/pg-orb-tiles.liquid` (new, orb template): the Single Item tile
  gets its radio dot back (pg-theme-css's product-page pass strips the dot
  from whichever tile is first, which on the orb page is the ladder's single;
  the restored dot wears its own class so that pass leaves it alone), says
  "25% OFF today" under its title beside the dot (floored from the live price
  and compare-at, the SAVE badge's own measure) and then wears the
  "+ FREE LED Base" chip, in the console's order;
  every ladder tile carries the console's white-and-lavender note inside it,
  worded per tile; the bottom deal note under the last bundle is hidden.
- `sections/pg-tiktok-pdp.liquid`: its in-tile ADD TO CART (.pg-tt-atc) was a
  static three-stop purple; it now wears the console button's moving gradient
  at 8s and joins the phase-sync list.
- `sections/pg-orb-atc.liquid` retired and unregistered: the orb template
  already had an in-tile button (pg-tiktok-pdp), so it had doubled them.

## Applied to
Shopify draft theme `163849208036` via the Admin API (themeFilesUpsert).

Files changed:
- sections/pg-cart-offer.liquid (new), sections/header-group.json (registers it)
- sections/pg-cart-pills.liquid (sync list: .pg-offer-*, .pg-tt-atc)
- sections/pg-orb-tiles.liquid (new), sections/pg-tiktok-pdp.liquid
- sections/pg-orb-atc.liquid (retired), templates/product.pg-crystal.json

---

# Cart drawer: the "Add a 2nd R36S: upgrade to the Duo Pack" row was unstyled

## Problem
On the "Duo case wording (Claude 9-10c)" draft, the cart drawer's new Duo Pack
upgrade row rendered as the theme's raw defaults: thumbnail, copy and a black
120px-minimum `<button>` stacked as blocks, an italic "+$60.99", no card at all,
directly above a spare-case offer card that had all of them.

## Cause
`sections/pg-cart-tune.liquid` (this draft) gained a `duoUp()` builder that
appends a `.pg-duoup` row into `#pg-unlock-slot`. Like the sibling `.pg-soloff`
row it reuses pg-unlock's inner class names (`.pg-unlock-t`, `.pg-unlock-px`),
but its container and button classes are its own (`.pg-duoup`,
`.pg-duoup-add`, `.pg-duoup-now`) for the same two reasons as `.pg-soloff`:
pg-unlock sweeps containers it does not recognise, and `.pg-unlock-add` carries
pg-unlock's click handler. Neither of those classes had a single CSS rule.

## Fix (`sections/pg-cart-tune.liquid`, `<style>` block only)
Every `.pg-soloff` selector now also names the `.pg-duoup` equivalent
(container, four-id thumbnail pin, `-now` font-style, `-add` button incl. the
`::before`/`::after` overlay kill, hover, disabled, size overrides and the
max-width:414px block), so the two rows are one design by construction. The
row's slot order is pinned (`order:-1`) so it can never swap with `.pg-soloff`
on a timing race. No JS changed; `.pg-soloff`'s own declarations are unchanged.

Verified in headless Chromium with the theme's real stylesheets (screen.css +
every drawer section's `<style>` in load order) at 390/430px, in and out of
`.sticky-in-panel`: before = the broken stack from the screenshot, after = the
same card as the case offer. Three adversarial reviewers (cascade, JS
lifecycle, visual) found no rule or script that undoes it.

---

# Add-to-cart wave: slower, and in step everywhere

By request the moving purple highlight on the buttons was "too dynamic". Every
`pgShiftT` animation now runs one 8s cycle (was 5s in the stylesheets and 3.2s
on the inline stamp pg-theme-css paints onto the product page button):

- `sections/pg-theme-css.liquid`: `#pgx .pgx-atc`, `#pgh .pgh-atc`, `.pgst-b`,
  the `paint()` and `cardAtc()` inline stamps, and -- so the "+ FREE Case" chip,
  duo ribbon, sale badge and newsletter buttons stay in step with the button
  next to them, as the owner noticed they were -- every other `pgShiftT` too.
- `sections/pg-r36s-mobile.liquid`: the console tiles' in-tile ADD TO CART.

---

# Orb page: the console's in-tile ADD TO CART button

On phones the console page puts an ADD TO CART inside the selected buy tile
(pg-r36s-mobile) and hides the bottom button; the orb page only had the bottom
pill. New `sections/pg-orb-atc.liquid`, registered in
`templates/product.pg-crystal.json`: the same button (pg-r36s-mobile's rule
restated, 8s wave), one per tile, shown only on the selected tile, phones only;
a tap clicks `#pgx-atc` so the ladder's existing add-to-cart posts exactly what
it did before. Rendered side by side with the console's in Chromium: identical.

---

# Orb strike-through pricing (product data, not theme)

The Crystal Legends Orb's compare-at was $70.00 against a $34.99 price, so the
ladder read SAVE 50 / 66 / 72%. Set to $46.99 on all 36 variants (the console's
ratio: $74.99 vs $99.99 = 25%), so the ladder now reads SAVE 25 / 50 / 58% with
the prices and free orbs unchanged. This is live product data (it is not scoped
to a draft theme); the badges and struck figures derive from it at render time,
so no theme code changed for it.

# Cart offer rows: the ADD pill is three letters wide

The theme's bare `<button>` rule (`min-width:min(100%,120px)` and 16px
right/bottom margins) was never waived for the custom offer-row pills, only for
pg-unlock's. On a 440px phone the case offer's pill measured 134px for "ADD"
and left the copy beside it ~100-150px, in which the Duo row's headline would
be clipped by the drawer's two-line clamp. `min-width:0; margin:0` on the
`.pg-soloff-add` / `.pg-duoup-add` rule (pg-cart-tune) and on
`.pg-frameoffer-add` (pg-frame-add), so all three custom rows agree and the
copy keeps the line width.

---

# Shipping Protection: $3.99

Variant 49529437028580 repriced 2.99 -> 3.99 (product data). The two places
the drawer prints the figure by hand -- pg-drawer's service toggle and
pg-cart-main's card -- updated to match.

---

# Cart pills: one colour, one clock

By request the bottom-right SAVED % pill and the "free gift" plaque under the
case line take the same moving purple as the product page buttons, at the same
8s. New `sections/pg-cart-pills.liquid` (header-group) paints every cart pill
(.pg-save-chip, .pg-free-tag, .nc-lsave-off, .pg-gift-off, .pg-free-note,
.pg-unlock-tag, .pg-frameoffer-sv) with one gradient and one animation, and a
small script keeps every moving element on the page on one clock: each pass
seeks every wave animation (Web Animations API, currentTime = document time
mod 8s) whenever it is more than 40ms out, so a chip the drawer recreates,
moves or re-inserts stays in step with the ones that live on. (A first version
wrote a one-shot animation-delay, which went stale on every re-insertion; the
seek replaced it the same day.) The upsell card's own SAVE chip is still, by
request. Two `background:` shorthands marked !important on
.nc-lsave-off (pg-drawer:48, nc-cartfix:172) pinned its background-position
and would have blocked the animation; both are `background-image` now.
pg-gift-purple, which pinned the gift pill still, is retired (empty section,
still registered). pg-drawer's own waves (free-shipping pill, progress bar,
chips) and pg-home's inline button stamp move from 5s to 8s.

## Applied to
Shopify draft theme `163849208036` ("Duo case wording (Claude 9-10c)") on
thepocketera.com via the Admin API (themeFilesUpsert).

Files changed:
- sections/pg-cart-tune.liquid (Duo row CSS, pill floor)
- sections/pg-frame-add.liquid (pill floor)
- sections/pg-theme-css.liquid (8s wave)
- sections/pg-r36s-mobile.liquid (8s wave)
- sections/pg-orb-atc.liquid (new)
- templates/product.pg-crystal.json (registers pg-orb-atc)
- sections/pg-drawer.liquid ($3.99, 8s waves, .nc-lsave-off shorthand)
- sections/pg-cart-main.liquid ($3.99, 8s)
- sections/nc-cartfix.liquid (.nc-lsave-off shorthand)
- sections/pg-home.liquid (8s)
- sections/pg-cart-pills.liquid (new)
- sections/pg-gift-purple.liquid (retired)
- sections/header-group.json (registers pg-cart-pills)

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
