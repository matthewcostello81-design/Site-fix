# Product pages: remove the money-back guarantee

## Problem
Every product page promised a 30-day money-back guarantee in several places.
The merchant asked for it to be removed from the product pages.

## Where it appeared
Live product pages use four templates: `product.json` (accessories and shipping
protection), `product.pg-crystal.json` (Crystal Legends Orb), `product.pg-pro2.json`
(Pocket Era R36S Pro) and `product.pg-r36h.json` (Pocket Era R36H Pro). The
three landing-page templates render `sections/pg-landing.liquid`, and each has a
matching story section with a comparison table.

- `sections/pg-landing.liquid`: the green "30-day money back guarantee" pill
  under the payment icons, plus the schema default for the Shipping accordion.
- Template `shipping_text` settings (the Shipping accordion): the sentence
  "Every purchase is covered by our 30-day money-back guarantee."
- `sections/pg-orb-story.liquid`, `pg-pro2-story.liquid`, `pg-r36h-story.liquid`:
  the "Brand new with a 30-day guarantee" row in the "Why it stands out"
  comparison table.
- `templates/product.pg-bag.json`, `pg-blank.json`, `pg-console.json`: a
  "30-day money-back guarantee" USP block under the buy button. `pg-blank` is
  the template on the draft Pocket Era R36S Ultra product.
- `sections/pg-mobile.liquid`: the announcement marquee message list included
  "30-day money back guarantee". The marquee is site-wide, so this one change
  also affects non-product pages.

## Fix
- Removed the guarantee pill from `pg-landing.liquid` and dropped the sentence
  from its schema default. The JS in `pg-acc-place`, `pg-tiktok-pdp` and
  `pg-theme-css` that referenced `.pgx-guar` already tolerates it being absent
  (null check, or `querySelectorAll` + `forEach`), so nothing else needed to move.
- Dropped the guarantee sentence from `shipping_text` in every `pg-*` product
  template that carried it (crystal, pro2, r36h, dbz, flipsp, landing,
  powerball, wallart). The rest of the shipping copy and the policy links stay.
- Removed the `usp_2` guarantee block (and its `block_order` entry) from
  `pg-bag`, `pg-blank` and `pg-console`.
- Removed the "Brand new with a 30-day guarantee" comparison row from the three
  story sections.
- Removed the guarantee message from the marquee list in `pg-mobile.liquid`.

## Left as is (not a money-back guarantee, or not a product page)
- "Easy Returns / 30-Day Returns" info tile on `pg-landing.liquid`.
- "No hassle returns, 30 days return" USP on the default `product.json`.
- Cart drawer trust row "30-Day Guarantee" (`pg-cart-express`, `nc-cartfix`) and
  the homepage "Money back, no hassle" tile (`pg-home`).
- The retired `nc-*` wellness templates (all their products are in draft).

## Applied to
Pushed to Shopify draft theme `165951144164` ("R36S Ultra page (Claude 9-23)")
via the Admin API (themeFilesUpsert). The 16 files were byte-identical between
that draft and the then-live theme (`164327686372`) before the change.

Other sessions then layered further edits on the same draft (a site-wide
"returns removed" pass, a `hide_reviews` setting on `pg-landing`, a new
`pg-ultra` template, Fall Sale marquee copy) and published the result as theme
`165957402852` ("Copy of Banner no free items (Claude 9-24)"). Every file in
this list was re-fetched from that live theme and grepped: none of the
money-back guarantee copy remains, and the only differences from the repo copies
are those later edits by other sessions. The copies in `theme/` are the versions
pushed by this change, not the later live versions.

Files changed:
- sections/pg-landing.liquid
- sections/pg-mobile.liquid
- sections/pg-orb-story.liquid
- sections/pg-pro2-story.liquid
- sections/pg-r36h-story.liquid
- templates/product.pg-crystal.json
- templates/product.pg-pro2.json
- templates/product.pg-r36h.json
- templates/product.pg-dbz.json
- templates/product.pg-flipsp.json
- templates/product.pg-landing.json
- templates/product.pg-powerball.json
- templates/product.pg-wallart.json
- templates/product.pg-bag.json
- templates/product.pg-blank.json
- templates/product.pg-console.json

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
