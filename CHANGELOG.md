# About Us page: new origin-story copy

Replaced the body of the store page "About Us" (gid://shopify/Page/134072926436,
handle about-us) with the owner's new copy: the living-room origin story, What
We Do, How We Operate (three bolded principles as a list), Where We Are Headed,
and the "Stay Legendary..." sign-off. Wording kept verbatim; formatting only.

Note: Shopify pages are store-wide content, not theme files, so this change is
LIVE immediately, independent of which theme is published. The page uses the
default page template (no templateSuffix); templates/page.about-us.json is an
unused demo-content template and was left untouched.

Applied via Admin API pageUpdate; re-read after saving to confirm.

---

# Cart upsells: top of the drawer on mobile too (like desktop)

## Problem
On phones the upsell rows were pinned inside the bottom checkout pane
(.sticky-in-panel). Requested: put them at the top of the cart on mobile,
exactly as on desktop, scrolling with the items.

## How placement works (two cooperating writers)
- sections/pg-unlock.liquid creates #pg-unlock-slot and used to birth it
  INSIDE the pane on <=760px viewports.
- sections/pg-cart-mobile.liquid's placeUnlock() (exported as
  window.pgPlaceUnlock, also run on a 60ms observer) used to MOVE the slot
  into the pane on mobile.
Both files' comments warn the two writers must agree or the row visibly
teleports on every drawer rebuild (the historic "glitching" bug), so both
were changed together.

## Fix
- pg-unlock: the slot is now always created immediately above the item list
  (.l4ca), at every width. The pinned-pane compact CSS is retained but marked
  INERT (nothing is inside the pane any more); the max-width:414px geometry
  (stretched thumbnail, 30px button) is slot-scoped and still applies at the
  top position.
- pg-cart-mobile: placeUnlock() rewritten to seat the slot above the item
  list at every width; the pane-move branch and its unlockSeated helper are
  retired; header rule 5 updated; pgCartFlush version bumped 2 -> 3.
  window.pgPaneAnchor stays exported for stale-copy safety.

## Merge with a parallel session (important)
Between pushes, another Claude session working from a STALE base overwrote
pg-unlock on theme 163148890340: it RE-APPLIED the orb rail suppression
(NO_CART_RAIL) and reverted the approved sizing/copy polish, while adding a
genuinely new feature, a chooser close button (.pg-unlock-close, X in the
row corner, with label restore and a drawer-close reset). This change MERGES
that close-button feature into the current file and drops the stale
suppression and reverts, per the user's standing requests (orbs restored,
polish approved).

## Applied to
Both drafts via themeFilesUpsert, each re-verified by checksum:
- pg-unlock.liquid 742736c720ed6d05ccd325a10e75d096 (57,487 bytes)
- pg-cart-mobile.liquid 9435b90aa5456ba508b58bfbf1363081 (29,506 bytes)
on `163149316324` "PDP quote no-jump v2" and `163148890340` "PDP quote
no-jump".

Files changed: sections/pg-unlock.liquid, sections/pg-cart-mobile.liquid
(now tracked in this repo)

---

# Cart orb upsell row: smaller ADD button, taller thumbnail, no ragged wrap

## Problem
On the phone cart (pinned pane), the orb offer row read badly: the ADD button
was large relative to the row, the thumbnail sat as a small square inside a
taller row, and the note "Add 2 more (6 crystal legends orbs total) - 1 of
them free" wrapped to three ragged lines.

## Cause
- The note embeds the lowercased product name, which is most of a line by
  itself on a 390px screen.
- On phones at or below 414px, pg-cart-timer's small-phone compact block
  stamps the row's geometry with TWO-ID !important rules (image locked to
  38x38, all text 12px), and that section loads after pg-unlock in
  overlay-group, so pg-unlock's own rules could not win at equal specificity.
- The button's base min-height (40px) was never reduced inside the pinned
  pane.

## Fix (sections/pg-unlock.liquid only)
- Note copy shortened in row(): "Add 2 more - 1 of them free (6 total)"; the
  already-qualified variant drops its "- these cost nothing" tail (the
  headline already says FREE). Pack size and free count remain truthful.
- Pinned pane: thumbnail becomes a stretch-to-row-height portrait
  (width 46px, height auto, min-height 54px, align-self stretch), button
  drops to min-height 32px / 12px text / tighter padding.
- New max-width:414px block using a doubled id (#cart#cart, three ids total)
  to out-specify pg-cart-timer's stamps at any load order: image stretched to
  the row height, button min-height 30px.
- Desktop drawer list is untouched.

## Applied to
Both current drafts via themeFilesUpsert, each re-verified by checksum
(43577254e3e365b37a4f3a116da4fb1f, 56,353 bytes):
- `163149316324` "PDP quote no-jump v2 (Claude 8-23)"
- `163148890340` "PDP quote no-jump (Claude 8-23)"

Files changed: sections/pg-unlock.liquid

---

# Cart: restore the orb upsell rail (Buy 2 Get 1 / Buy 4 Get 2 / Buy 5 Get 3)

## Problem
The orb (Crystal Legends Orb) upsell rows stopped showing in the cart drawer.
The currently published theme is literally named "No orb cart upsell
(Claude 8-23)": a prior session suppressed the orb's cart rail on request,
and that theme went live. The wall art and console rails were unaffected.

## Cause
`sections/pg-unlock.liquid` (the cart's offer rail) gained a
`NO_CART_RAIL = ['pokemon-crystal']` list plus a `railSuppressed()` filter in
`offers()`, which skipped every orb line when computing which upsell rows to
draw. The orb's ladder itself (`LADDERS`) and the product page tiles were left
intact, so restoring is exactly what that code's own comment said it would be:
deleting the suppression, not reconstructing the ladder.

## Fix
Removed the `NO_CART_RAIL` list, the `railSuppressed()` helper, and the filter
line in `offers()`, restoring the file to its pre-removal behavior. Kept the
one unrelated improvement added in the same edit, `#pg-unlock-slot:empty
{display:none}` (hides the empty rail container so it doesn't leave a 12px gap
on small phones), with its comment rewritten since it no longer describes a
suppressed rail.

Verified before shipping that the prices the rail promises are still honored
at checkout: "PokeOrb - Buy 2 Get 1 Free" is ACTIVE with no per-order limit
(so it also covers the Buy 4 Get 2 rung by applying twice) and "PokeOrb -
Buy 5 Get 3 Free" is ACTIVE.

## Applied to
Shopify draft theme `163148890340` ("PDP quote no-jump (Claude 8-23)") via the
Admin API (themeFilesUpsert); re-read after the push and confirmed
byte-identical, 54,404 bytes.

Follow-up: a parallel session created "PDP quote no-jump v2 (Claude 8-23)"
(`163149316324`) seconds around the first push, and its copy captured the old
suppressed pg-unlock (55,827 bytes) - which is why the rail was still missing
on "the draft theme". Pushed the same restored file there too and confirmed
the checksum matches the verified restore (3ad223756d3260c9e95bc20c5db8b6d7,
54,404 bytes). Both current drafts now show the orb rail.

Files changed: sections/pg-unlock.liquid (now tracked in this repo)

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
