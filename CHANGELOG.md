# Orb PDP: product title bold, matching the R36S

The orb's title read smaller and lighter than the R36S's. Both pages get the
same rule from pg-landing (`.pgx-title`, 46px desktop / 34px mobile, weight
600), so the weight was never the difference — pg-tiktok-pdp shrinks the orb
title to 20-23px on phones as part of fitting the photo, stars and first bundle
tile onto one screen.

New section `sections/pg-orb-title.liquid`, registered in
`templates/product.pg-crystal.json` only:

- weight 700 at every width — the bold that was asked for, and the heaviest
  Roboto Slab cut pg-landing actually loads (400;500;600;700), so it is a real
  weight rather than a synthesised one;
- 34px again on phones, matching the R36S.

Kept out of pg-tiktok-pdp: that file owns the ad landing's layout logic, this is
one typographic override. It renders after pg-tiktok-pdp at equal selector
specificity, so it wins on source order.

## Applied to
Theme `163618390244` ("Copy of Matt Copy of TikTok PDP v2 no-header"),
unpublished — needs preview and publish from Shopify admin.

Files changed:
- sections/pg-orb-title.liquid (new)
- templates/product.pg-crystal.json (registered pg-orb-title)

---

# Orb gallery: opens on photo 1, and the name pill drops the number prefixes

## Why it opened on photo 18 of 35

`sections/pg-tiktok-pdp.liquid` (job 2) re-points the bundle pickers at the
landing section's "Default selected size" setting, and `pg-gallery-tweaks`
scrolls the photo strip to whatever character is picked. That setting said
`01 Pikachu`, and Pikachu's photo sat 18th in the strip — so the page opened
mid-strip at 18/35, on a photo the counter said was nowhere near the start.

Two things then drifted apart when the variants were renamed to plain names
("01 Pikachu" -> "Pikachu"):

- `default_size` still said `01 Pikachu`, which now matches no variant, so the
  default quietly fell through to the first variant (Arceus).
- `pg-gallery-tweaks` reads the character NAME from the media alt text
  ("Crystal PokeOrb – 01 Pikachu" -> "01 Pikachu"), which still carried the
  numbers. That is why the pill read "01 PIKACHU", and it also broke
  `gotoTitle()`: picking a character in the bundle picker compares the picker's
  label (the variant title, "Pikachu") against that alt-derived name, so the
  strip stopped following the picker.

## Fix

1. **Media alt text (Shopify data, all 35 character photos)**: number prefixes
   removed — "Crystal PokeOrb – 01 Pikachu" -> "Crystal PokeOrb – Pikachu". The
   pill now reads "PIKACHU", and picker -> strip matching works again because the
   alt-derived name equals the variant title. One typo fixed while there:
   "12 Lacario" -> "Lucario" (the variant is spelled Lucario, so that one photo
   could never be matched).
2. **Media order**: Pikachu's photo moved to position 2 in the product media,
   i.e. the FIRST photo of the strip (position 1 is the hero group shot, which
   `pg-gallery-tweaks` hides and which is still the collection-card image). The
   gallery now opens at 1/35 on Pikachu, per the owner.
3. **`templates/product.pg-crystal.json`**: `default_size` `01 Pikachu` ->
   `Pikachu`, so the setting matches the renamed variant again and the pickers
   preselect Pikachu deterministically instead of falling through to Arceus.
   Photo, name pill and picker now all agree on load.

Nothing in `pg-tiktok-pdp.liquid` needed to change — its mechanism was right,
only the value it pointed at was stale. Its comments still quote the old
"13 Arceus" / "01 Pikachu" names as examples.

## Applied to
- Alt text and media order: the live product (Shopify data, effective immediately).
- Template: theme `163618390244` ("Copy of Matt Copy of TikTok PDP v2 no-header"),
  an unpublished copy of the current live theme — the connector blocks writes to
  the live theme, so this draft needs previewing and publishing from admin.

Files changed: templates/product.pg-crystal.json

---

# Orb PDP: logo + banner back, and "496 verified reviews" links to the reviews

## 1. Logo and announcement banner returned to the Crystal Legends Orb page

`sections/pg-tiktok-pdp.liquid` (registered only in `templates/product.pg-crystal.json`)
hid the whole header on phones for the TikTok ad landing:

    @media (max-width:900px){
      #pgx .pgx-announce{display:none !important}   /* scrolling banner */
      #pgx .pgx-head{display:none !important}       /* logo + Home/Track/Contact nav */
    }

Both rules were removed, so the orb page now opens with the same Pocket Era
wordmark, marquee banner and nav as the R36S and wall art pages. Nothing else
about the mobile layout changed — the photo-first gallery, the in-tile ADD TO
CART, the capped photo height and the below-the-fold reflow all stay. The
"cart bar waits for a 160px scroll" gate stays too: it now simply reinforces
what a visible header already does.

## 2. "496 reviews" -> "496 verified reviews", clickable

New section `sections/pg-rev-link.liquid`, registered in all three pg-landing
product templates (`product.pg-landing.json` R36S, `product.pg-crystal.json`
orb, `product.pg-wallart.json` wall art).

`pg-landing` renders the rating line as a plain span whose count comes from the
Judge.me metafield (R36S 421, orb 496, wall art 77), and several scripts on the
page rewrite parts of the buy column on an interval. So the upgrade runs as a
repeated, idempotent pass rather than a one-shot markup edit: the "<n> reviews"
node becomes `<a class="pgx-revlink" href="#pg-reviews">n verified reviews</a>`,
and the click smooth-scrolls to `#pg-reviews` (the id `pg-landing` puts on the
review section at the bottom), offset by the sticky cart bar height so the
score heading is not hidden under it.

The fallback rating label used by products with no Judge.me reviews yet
("Trusted by over 10,000 customers") is left alone — it is not a count.

## Applied to
Shopify theme `163617112292` ("Copy of TikTok PDP v2 no-header (Claude 8-29)"),
an unpublished, byte-identical copy of the live theme — the Shopify connector
blocks writes to the live theme, so this draft must be previewed and published
from Shopify admin to go live.

Files changed:
- sections/pg-tiktok-pdp.liquid
- sections/pg-rev-link.liquid (new)
- templates/product.pg-landing.json (registered pg-rev-link)
- templates/product.pg-crystal.json (registered pg-rev-link)
- templates/product.pg-wallart.json (registered pg-rev-link)

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
