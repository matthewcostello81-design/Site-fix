# R36S Ultra product page (clone of the R36S Pro page)

Built on the draft product "Pocket Era R36S Ultra" (handle pocket-era-r36s-ultra,
the renamed Flip SP product). Single Device $109.99 (compare $149.99), Max Bundle
$139.99 (compare $221.96); Duo Pack $7.00 off each and Duo Max $20.00 off each
(admin discounts "R36S Ultra - Duo Pack Savings" / "R36S Ultra - Duo Max Savings").

## New files
- templates/product.pg-ultra.json (pg-landing with hide_reviews, Ultra features)
- sections/pg-ultra-tiles.liquid, pg-ultra-story.liquid, pg-ultra-cart.liquid
  (clones of the pg-pro2-* sections: prefixes pg-ul / pg-uls / data-pg-ul)

## Edited shared files
- sections/header-group.json: registers pg_ultra_cart
- sections/pg-cart-addons.liquid: 'ultra' family (clear daily case, hard shell,
  screen protector, protection kit), $20.00 Duo Max
- sections/pg-landing.liquid: "hide_reviews" setting (default off)
- sections/pg-home.liquid, snippets/social-meta-tags.liquid: no rating / no
  aggregateRating for the Ultra
- layout/theme.liquid: the Ultra add-on and kit pages redirect to the Ultra
- sections/pg-theme-css.liquid, sections/pg-flipsp-cart.liquid: add-on handles

## Why reviews are hidden
The product's Judge.me data (110 reviews, 4.91) was imported for the Flip SP
clamshell. It is not shown on the Ultra; the product's review metafields were
also removed. Hide those reviews in Judge.me so they are not synced back.

---

# R36H Pro: no silicone case; the Max ships a hard shell case + 3 screen protectors

## Request
"we cant source a silicone daily well for r36h. SO max bundle will just have
the hard case and 3 screen protectors. Somehow fix that in the product page
upsell" (plus: the Protection Kit photo must lose the silicone case).

## Theme (new unpublished theme "R36H no silicone (Claude 9-23)", duplicated from live)
- sections/pg-r36h-tiles.liquid: the Single's silicone add-on row, its data and
  copy are gone. Max chip "+ 4 Accessories" with "One console, a hard shell case
  and 3 screen protectors"; list: 128GB, 20K games, 3X screen protector, USB-C
  cable, hard shell travel case, free shipping (six items, three a side). Duo
  Max: "2X 4 Accessories", 6X screen protector, 2X hard shell case.
- sections/pg-r36h-story.liquid: "Everything in the Max. Every Piece
  Included." Three cards: 128GB · 20K Games (Mystic Purple shot, replacing the
  silicone card, by request), hard shell travel case, 3 tempered glass screen
  protectors.
- sections/pg-cart-addons.liquid: R36H singles are offered the hard shell case
  and screen protector only; having both unlocks the Duo Max upgrade row.

---

# R36H Pro cart: color picker flickered

## Cause (sections/pg-r36h-cart.liquid)
The script finds the picker it built with `select[data-pg-rh]`, but still
stamped new pickers `data-pg-p2` (`dataset.pgP2`, from the Pro 2 clone). Every
pass missed its own picker and built another: every 400ms, and again on each
MutationObserver call the rebuild itself triggered.

## Fix
The build and the lookup both use `data-pg-rh` (`dataset.pgRh`). No other theme
file references `data-pg-p2`/`data-pg-rh` (33 cart-related files checked), and
the Pro 2 cart keeps `data-pg-p2` on both sides, so it is unaffected.

## Applied to
Pocket Era copy (Claude 9-21b). Publish the copy to go live.

---

# R36H Mystic Purple photo: upscaled to 2048px

The Mystic Purple hero shot (MediaImage 73382859276516, r36h-purple-vivid2.jpg)
was a 1024px, 128KB JPEG. It was upscaled x4 with Real-ESRGAN x4plus by the
`Upscale images` GitHub Action (tools/upscale), downsized to 2048px, and the
blurry floor reflection was blended back from the original because the model
drew stripes into it. Replaced in place with fileUpdate, so the media ID, alt
text, gallery position and the Mystic Purple variant links are unchanged; the
homepage card finds it by alt text. The original is kept at
tools/upscale/orig/r36h-purple-vivid2.jpg for a revert.

---

# Orb page: chart compares against a 3rd party seller

## Change (sections/pg-orb-story.liquid)
The "Why the Orb Stands Out" chart's second column header (and its aria-label)
reads "3rd Party Seller" instead of "Vintage Handheld". Rows unchanged.

## Caveat raised with the owner
"Do the math" says the same orb sells elsewhere, so crosses on "3D character
floating in solid glass", "Seven-color automatic glow" and "36 characters to
collect" claim things another seller's orb may well have.

## Applied to
Pocket Era copy (Claude 9-21b). Publish the copy to go live.

---

# R36H page: compare against the Game Boy Advance, add spec rows

## Request
Name the original Game Boy Advance (not the SP) in the "Do the math" price
comparison, and make the "Why the R36H Stands Out" chart show 20K games,
screen size and battery life beating it.

## Change (sections/pg-r36h-story.liquid)
- `gba_model` default is now "Game Boy Advance". The headline and the chart's
  column header both print it (the header used to be a fixed "Vintage
  Handheld"). The price stays at the owner's ~$150 resale figure.
- Three rows lead the chart, checked for the R36H and crossed for the GBA
  like the rest: "Up to 20,000 games preloaded", "3.5 inch backlit IPS
  screen", "Rechargeable battery". (They were value cells first, e.g. "3.5
  inch" vs "2.9 inch"; the owner asked for the wording on the left and plain
  checks and crosses.)

## Caveats raised with the owner
- An original GBA gets about 15 hours on two AAs, more than the R36H's ~5, so
  the battery row claims rechargeable vs disposable, not longer life.
- Loose PriceCharting listings for a plain GBA were ~$50 to $85 on
  2026-09-17; $150 is the owner's resale figure.

## Applied to
Pocket Era copy (Claude 9-21b), which matched the live theme file for file.
The live theme can't be written through the API; publish the copy to go live.

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
