# Cart drawer: stop it tearing itself down on every change

## Problem
Changing anything in the cart — quantity + / −, remove, adding an orb from the
rail, switching the console version or an orb variant — made the drawer come
apart and reassemble itself: pieces vanished, the panel jumped as it collapsed
and re-grew, and everything popped back in one at a time over the next second.

## Cause
`pg-drawer`'s refresh rebuilds the drawer with

    fetch('/') -> parse -> cart.innerHTML = fresh.innerHTML

The fetched page has never run any JavaScript, so its `#cart` is the bare theme
markup. Every part of the drawer this theme builds at runtime — the "Your Cart"
header, the reward progress bar, the shipping-protection toggle, the savings
breakdown, the SAVED n% and FREE GIFT pills, the +/− steppers, the variant
pickers, the recommendation rail, the drawer logo — was destroyed on every cart
change and then landed again in waves as each section's own poller noticed it
was missing: 300ms (pg-chips styling), 400ms (pg-cart-variants pickers,
nc-cart-tweaks bars), 700ms (pg-chips percentages), 800ms (pg-drawer's
steppers, bar and totals), 900ms (pg-unlock). Three of those files describe the
teardown in their own comments and poll specifically to survive it.

## Fix (`snippets/pg-cart-smooth.liquid`, rendered by `sections/pg-cart-fast.liquid`)
Only two regions of the drawer come from the server — the line-item lists
(`.l4ca`) and the totals (`.l4tt`). Those are swapped; everything else is left
standing, so there is nothing to rebuild and nothing to pop back in.

- **`window.pgDrawerRefresh` is replaced with a morphing version**, same
  contract (promise, single-flight, mid-flight calls folded into one follow-up),
  so every existing caller is unchanged.
- **`cart.innerHTML` is guarded at the element**, which catches the two callers
  living inside pg-drawer's closure and unreachable from outside: the
  shipping-protection toggle and the free-gift sync. Markup carrying runtime
  chrome of its own is passed through untouched, so a deliberate rebuild still
  works, and any structure the morph does not recognise (an emptied cart) falls
  back to the original whole-drawer swap.
- **Carried vs rebuilt.** Pills and struck prices are display-only, so they are
  cloned across with quantity-dependent figures rescaled — no blink, no stale
  number. The variant `<select>` and the steppers capture live state (a line key
  and quantity, an input reference), so carrying them would let a swap post
  against a stale line; they are rebuilt. Steppers are rebuilt in the same tick
  as the swap so + and − are never briefly dead; the picker is left to
  pg-cart-variants' 400ms pass with its space reserved so nothing jumps.
- **Fewer bytes per change**: the refresh reads `/?section_id=side-cart` rather
  than the ~580KB homepage, validated on arrival and permanently abandoned for
  the old whole-page fetch if it ever comes back wrong.
- **Motion**: height changes ease, genuinely new pieces fade in rather than
  snap, and the list dims while a change is in flight instead of going blank.
  All of it off under `prefers-reduced-motion`.

No add-to-cart, discount-ladder or checkout logic is touched — the change is
entirely in how the drawer's existing HTML is put on screen.

## Applied to
Shopify theme `162816262372` ("Copy of ★ PUBLISH THIS — Cart + Logo Fixes")
on `thepocketera.com`, verified byte-identical to the live theme's cart files
before the write. The live theme could not be written to directly: the Shopify
tooling blocks theme-file writes to the published theme, so this needs
publishing from Shopify admin.

Files changed:
- snippets/pg-cart-smooth.liquid (new)
- sections/pg-cart-fast.liquid (one line: renders the new snippet)

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
