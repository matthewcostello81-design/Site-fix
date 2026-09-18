# R36S Pro 2: no in-cart upsells

## Request
"hide the in cart upsells on the r36s pro 2" (draft "Advance SP Product Page
+ Other Fixes").

## Where they came from
`sections/pg-cart-addons.liquid` (header group) paints the cart's Pro 2
cards -- Upgrade to the Max Bundle, Add a 2nd console (Duo Max), Switch to
the Duo Max Bundle -- and, while one is up, claims the cart's single upsell
seat (`#pg-unlock-slot.pg-one-mine`) so pg-cart-offer's card is hidden.
pg-cart-offer itself has no family for the Pro 2 and paints nothing for a
cart that names no family, so with these cards off a Pro 2 cart carries no
upsell at all.

## Change (`sections/pg-cart-addons.liquid`)
A switch, `PRO2_UPSELL = false`; `pro2Offer()` returns null while it is
false. Nothing else in the file changes: the wall-art frame offer, the
line-photo correction and the one-seat rule keep running, and a cart holding
a Pro 2 plus another product still shows that product's card (pg-cart-offer's,
since this file no longer takes the seat). `true` brings the three Pro 2
cards back exactly as they were; the code is kept whole.

## Verification
jsdom, against a `#cart` with a Pro 2 line and stubbed /cart.js + product
JSON: switch off -> no `.pg-addon` painted, seat not claimed, pg-cart-offer's
card left alone (Pro 2 only, and Pro 2 + orb); switch on (control) -> the Max
Bundle upgrade card is painted and the seat claimed, so the harness exercises
the real path. 6/6.

## Applied to
Shopify draft theme 164128784612 ("Advance SP Product Page + Other Fixes")
via the Admin API (themeFilesUpsert, body from the pushed branch).
Files changed: sections/pg-cart-addons.liquid

---

# Crystal orb: Buy 5 Get 4 tile kept the USD price in other currencies

## Problem
On the Crystal Legends Orb page, with the store switched to CAD, GBP, EUR or
AUD, every tile converted except the top rung ("Buy 5, Get 4 FREE"), which
went on showing the USD figure ($174.95) - and, measured against a converted
struck-through price, a wrong SAVE % and "each" price with it.

## Cause
`sections/pg-tile-copy.liquid` builds that tile from a table whose price was
a fixed number of USD cents:

    {tier: '5', units: 9, free: 4, pay: 17495, ...}   // 5 x $34.99

Everything else on the ladder is derived at render time from `#pgx-vdata`,
the variant prices pg-landing prints with Liquid, which Shopify localises to
the buyer's market currency (CAD 50.00, GBP 27.00, EUR 30.95, AUD 50.00 for
this orb). The one hardcoded figure was the one that did not follow.

## Fix (`sections/pg-tile-copy.liquid`)
- The table entry now says how many orbs are charged (`paid: 5`) and
  `extraTile()` prices the rung as `paid x unit` from vdata, so the price,
  the SAVE % and the per-unit pill all follow the currency (and any admin
  price change). USD is unchanged to the cent: 5 x 3499 = 17495.
- The Single tile on one-price products now takes its price and compare-at
  from the same vdata figure (it was pgLadder's product-JSON figure), so all
  three rungs are priced from one presentment-currency source.
- The desktop sticky bar's bundle picker keeps the amount once pg-money has
  swapped the $ for EUR/GBP (its dollar regex found nothing after that).

Symbols are unchanged: prices are still built as "$" and `snippets/pg-money`
rewrites them for non-dollar currencies (EUR/GBP) as before; CAD/AUD keep
the plain $ by that snippet's design.

## Verification
No storefront access from this sandbox, so the script was run in jsdom
against a simulated orb page with pgLadder-built tiles, stubbed pgDrop/fetch
and Liquid-style vdata: CAD (5000/10000) -> Buy 5 $250.00, struck $900.00,
BEST DEAL · SAVE 72%, $27.78 each, Buy 2 $100.00/$300.00, Single $50.00/
$100.00; USD (3499/6999) -> $174.95 / $629.91 / 72% / $19.44 each, identical
to the old hardcoded output; GBP page with USD product JSON -> Single follows
vdata ($27.00) and Buy 5 = $135.00. 15/15 checks. One look at the orb page in
CAD on the preview is still worth doing.

## Applied to
Shopify draft theme 164124426468 ("Copy of Wall art + cart upsells (Claude
9-17b)") via the Admin API (themeFilesUpsert).
Files changed: sections/pg-tile-copy.liquid

---

# Footer currency/language picker on phones: black screen

## Problem
On a phone, tapping the country (currency) or language picker in the site's
bottom bar covered the screen with a black sheet, about 360px wide, with
nothing on it and no way to close it. Reported as "whenever I switch the
currency at the bottom of the website ... black screen".

## Cause
Theme (Xtra) behaviour, not a pg-* regression. The footer's picker renders a
phone-only link `<a class="mobile-only" href="./" aria-controls="nav">`
(`snippets/language-country-selector.liquid`, origin: footer), because the
theme means to show the country list inside its mobile menu drawer `#nav`.
`assets/custom-async.js` binds `nav_burger()` to every `a[aria-controls="nav"]`
and its document click handler matches the footer picker links by that same
attribute. `nav_burger()` adds `has-nav` then `m2a` to `<html>`, which fades in
`#root > .panel-1`, the drawer's dark backdrop (screen.css: fixed/absolute,
width 100%, max-width 360px, full height; async-menu.css: visible under
`.m2a`).

This store has no menu-bar menu, so `sections/header.liquid` renders
`<div id="nav" class="hidden">` (display:none) and no burger. The backdrop
still fades in, the drawer it is for is 0 x 0, and the shopper is left looking
at the empty sheet. The 360px panel against a 390px phone leaves the ~30px
sliver of page visible at the right edge of the screenshot.

## Fix (`sections/pg-currency-sheet.liquid`, header-group; rewritten)
An earlier version of this section only intercepted the tap. This version
does not rely on a single mechanism; three independent layers:

1. Disarm: `aria-controls="nav"` is stripped from the footer's
   `li.sub.currency > a.mobile-only` / `li.sub.lang > a.mobile-only` links as
   soon as they are parsed (MutationObserver from the header-group script,
   which runs before the deferred theme scripts and before custom-async.js is
   loaded via runWhenIdle), so the theme never binds the drawer to them and
   its footer click handler no longer matches. `href="./"` becomes `#`
   (the old value walked up a directory if a tap ever slipped through).
2. Own the tap: a capture-phase click listener on `window` runs ahead of any
   theme listener, cancels the event and opens the section's own bottom sheet
   listing the countries from the footer's real `form.localization-form`
   (current one ticked). Tapping a row submits that form with the row's own
   submit button as submitter (`requestSubmit`, hidden-input fallback), so
   Shopify switches country/currency exactly as the desktop dropdown does.
   Rows re-enable after 6s if the page has not left.
3. Backstop: if `m2a`/`has-nav` ever land on `<html>` while `#nav` has no
   client rects (display:none), they are removed immediately, so the empty
   drawer sheet cannot stay up whatever opened it. A page with a displayable
   menu is left alone.

Desktop is untouched (its link is `a.toggle.mobile-hide`).

## Verification
No storefront access from this sandbox (egress blocked), so the mechanics were
tested in jsdom against a copy of the theme's real handlers (element-level
`nav_burger` binding + document footer click handler): strip happens before the
theme binds (0 links bound); tap opens the sheet, is cancelled, no
`m2a`/`has-nav`; adversarial order (theme bound first) still blocked by the
capture listener; row tap submits `country_code=CA` on the footer form; guard
removes drawer classes with `#nav.hidden` and leaves a displayable nav alone;
unrelated clicks untouched. 20/20 checks. Needs one real tap on a phone
against the theme preview to confirm.

## Applied to
Shopify draft theme 164114661604 ("Wall art + cart upsells (Claude 9-17b)")
via the Admin API (themeFilesUpsert).
Files changed: sections/pg-currency-sheet.liquid

---

# R36 Pro 2 PDP: title matches the Shopify product title

## Problem
The R36 Pro 2 page heading read "R36 Pro 2" while the product in Shopify is
titled "Pocket Era R36S Pro 2".

## Cause
`templates/product.pg-pro2.json` set pg-landing's `display_title` override to
"R36 Pro 2". pg-landing renders the h1 as
`{{ section.settings.display_title | default: prod.title }}`, so the override
won over the real title.

## Fix (`templates/product.pg-pro2.json` only)
`display_title`: "R36 Pro 2" -> "" so the h1 falls back to `prod.title` and
tracks whatever the product is called in Shopify, the same as the R36S
template (`product.pg-landing.json`, `display_title: ""`).

Checked that nothing rewrites the h1 afterwards: the only script that reads
`#pgx h1` is pg-theme-css's sticky buy bar, which is disabled. pg-r36s-title /
pg-orb-title only style it.

Not changed: pg-pro2-tiles' tier notes still say "One R36 Pro 2 (64GB) ...";
those are tile copy, not the title.

## Applied to
Shopify draft theme 164085727460 ("Copy of Power Ball 12k (Claude 9-15b)")
via the Admin API (themeFilesUpsert).
Files changed: templates/product.pg-pro2.json

---

# R36 Pro 2 PDP: show the imported Judge.me reviews, linked review count

## Problem
The R36 Pro 2 page (`templates/product.pg-pro2.json`, Pocket Era) showed
"5.0 · Trusted by over 10,000 customers" as plain text under the title and no
customer reviews, while the R36S page showed "5.0 · 421 verified reviews" as a
link that jumps to the review block at the bottom.

## Cause
Not a template bug. `sections/pg-landing.liquid` reads the product's Judge.me
metafield (`judgeme.review_widget_data`) and, when it has a count, prints
"<n> reviews" in the rating line and renders the review block from the synced
reviews; `sections/pg-rev-link.liquid` then rewrites "<n> reviews" into a
"<n> verified reviews" link to `#pg-reviews`. When the page was screenshotted
the Pro 2 product had no Judge.me data yet, so pg-landing fell back to the
template's `rating_label` prose, which pg-rev-link deliberately skips because
it is not a count.

Judge.me finished syncing the imported reviews onto the Pro 2 product at
2026-09-17 01:51:55 UTC (143 reviews, 4.63 average, 13 with text, 10 with
customer photos). The metafield definition is storefront-readable, so the
existing Liquid now renders them without any section change.

## Fix (`templates/product.pg-pro2.json` only)
Made the fallback on this template behave the same way, so the page shows a
linked count whether or not Judge.me is reachable:
- `rating_label`: "Trusted by over 10,000 customers" -> "143 reviews". It is
  count-shaped, so pg-rev-link's `^\s*([\d.,]+)\s+reviews?\s*$` match
  upgrades it to a "143 verified reviews" link exactly like the Judge.me path.
- `review_total`: 12 -> 143 and `rating_value`: "5.0" -> "4.6", so the
  fallback review-block header matches the real numbers.
- The 8 theme-editor `review` blocks (fallback cards) were copied from the
  R36S template; replaced with 8 of the actually imported Pro 2 reviews so the
  fallback shows this product's reviews, not the R36S's.

`sections/pg-landing.liquid` and `sections/pg-rev-link.liquid` are untouched.

## Applied to
Shopify draft theme 164085727460 ("Copy of Power Ball 12k (Claude 9-15b)") on
shop `v9fqfa-bd.myshopify.com` via the Admin API (themeFilesUpsert).
Files changed: templates/product.pg-pro2.json

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
