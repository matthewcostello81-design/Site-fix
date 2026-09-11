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
  wears the "+ FREE LED Base" chip and says "25% OFF today" under its title
  (floored from the live price and compare-at, the SAVE badge's own measure);
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
small script gives every moving element on the page an animation-delay of
minus (time since load mod 8s) so chips the drawer recreates stay in step with
the ones that live on. Two `background:` shorthands marked !important on
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
