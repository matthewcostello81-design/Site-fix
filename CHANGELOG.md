# Duo Pack cart link landed on a stock theme page

## Problem
Clicking the "Pocket Era R36S Duo Pack" title in the cart opened a product page
nobody on the team recognised — plain title, stock Sale badge, white
"Configuration" boxes, "Excl. VAT" line.

## Cause
Nothing was wrong with the link. `r36s-duo-pack` is a real, ACTIVE product and
the cart pointed at it correctly. It simply had **no template assigned**
(`templateSuffix: null`), so Shopify fell back to the base theme's default
`templates/product.json` — the untouched Xtra product template. That is the
"weird looking product page": it was never designed, it is what every product
gets when no template is chosen.

For comparison, the console (`handheld-game-console`) carries `pg-landing`, and
the protective case carries `redirect`. The Duo Pack was created without one —
half-finished work from the "Duo Pack as product" round.

## Fix
Set the Duo Pack's `templateSuffix` to `pg-landing`, so
`/products/r36s-duo-pack` renders the real R36S landing page. This is a PRODUCT
setting, not a theme file, so it applies on the live store immediately and to
every route into the product (cart title, search, collections, ads), not just
the cart link. Reversible by setting the suffix back to null.

    productUpdate(product: {id: "gid://shopify/Product/9225766043876",
                            templateSuffix: "pg-landing"})

KNOWN TRADE-OFF, chosen deliberately by the owner: `pg-landing`'s section has
its own `product` setting, pinned to `handheld-game-console`. The template
therefore renders the CONSOLE landing page whatever product it is assigned to —
so the Duo Pack's own title, its Sale -$107.50 badge and its
64GB+64GB / 64GB+128GB / 128GB+128GB configuration picker do NOT appear on that
URL. The shopper lands on the R36S page and buys from its own tiles. If the Duo
Pack is later meant to sell itself from its own page, it needs a template driven
by the current product rather than a pinned one.

## Applied to
Live product data (all themes). No theme file changed.

Files changed: none — CHANGELOG only

---

# Free-case text glitching when Shipping Protection is toggled

## Problem
Flicking the Shipping Protection switch in the cart made the free case's text
jump around before settling — every time, in both directions.

## Cause
It is not the switch, it is what the switch does. pg-drawer's `spBox()` handler
ends in `spRefreshDrawer()`, which re-fetches `/` and runs

    cur.innerHTML = fresh.innerHTML;

replacing the WHOLE drawer with the server's rendering. Everything pg-case-mobile
stamps onto a case line is DOM state and dies with it: the `data-pg-case` /
`data-pg-truefree` / `data-pg-paidcase` attributes, the inline `display:none` on
the variant paragraph, the hidden stepper, and its own FREE GIFT pill.

Every rule that suppresses the wrong pill and the money on the $0.00 line was
keyed on those attributes. So between the swap and the next 250ms tick the line
rendered raw — "Free with console /" back, a stepper and a struck price on a free
line — while pg-drawer's `badge()` (800ms) and pg-mobile's `caseLine()` (1200ms)
each got a say on which line wears the pill. Three writers repainting one line at
three different offsets is the flicker.

A second, permanent fault sat underneath it: `caseLine()` writes
`visibility:visible !important` INLINE on `.semantic-amount`, `.nc-lsave`,
`.cols`, `.money` and `.price` for every case line, and inline `!important` beats
any stylesheet. A visibility-only hide is therefore reversed on its beat and
restored on ours, forever — the struck $24.99 on the free line was never hidden
at all.

## Fix
`sections/pg-case-mobile.liquid`:

- The rules now key on markup the SERVER renders, so they are in force in the
  same frame the new HTML lands with no JS in the path: any case line via
  `li:has(a[href*="free-gift"])` (both variants share the handle), and the gift
  line specifically via `li:has(a[href*="id=49640846426340"])` — the remove link
  carries the variant id, the same evidence `variantOf()` reads. The old
  attribute selectors stay as the no-`:has()` fallback.
- The money and stepper on the gift line are hidden with `opacity` and
  `pointer-events` as well as `visibility` — properties pg-mobile's `caseLine()`
  never writes (nor pg-chips' STYLE map), which is the same trick this file
  already used for the pills. The box keeps its size; the digits cannot be
  brought back.
- `pass()` also runs on a MutationObserver over `#cart`, so our own pill lands
  with the rest of the new markup instead of up to 250ms later. Re-entrancy is
  guarded so our own writes do not re-trigger it; the 250ms interval stays as the
  backstop for a wholesale `#cart` replacement.

## Verification
Chromium harness with both real cart lines (paid-first, the order the cart
actually ends up in) and both competing writers at their real beats, sampling
computed styles across t+0 … t+2600ms after a simulated `spRefreshDrawer()`:

- Control (old rules): 12/12 sampled frames wrong — raw variant line and stepper
  for the first ~250ms, FREE GIFT pill on the PAID line from t+120, stepper
  flashing back at t+900, struck price never hidden.
- Fixed: 0/12 wrong, including t+0 and t+16, before any script has run.

## Applied to
Theme "MATT Duo Pack fix (Claude 9-7)" (unpublished, 163721380068), verified
byte-identical (md5 14f36d6b33d9cda9a3b7431b14489126).

Files changed: sections/pg-case-mobile.liquid

---

# Duo Pack spare-case upsell: same row as every other upsell on a phone

## Problem
With the DUO PACK in the cart the spare-case upsell was bulky and cut off on a
390-402px phone — the title wrapped to two lines and the ADD button painted over
the SAVE chip. With a single console the same pitch looked right.

## Cause
They are two different components, and only one had been fixed.

With ONE console the offer is pg-unlock's ladder row (rung 1, "Add a 2nd R36S")
— the row whose phone geometry was measured and corrected. With the DUO PACK
that rung is already taken (1 paid + 1 discounted = the 2 in the cart), so
pg-unlock renders nothing for the console, and pg-frame-add's `offer()` — which
shows its row only when no `.pg-unlock[data-pg-unlock*="handheld-game-console"]`
exists — puts up `.pg-frameoffer` instead. Same pitch, same slot, different
stylesheet, carrying both faults pg-unlock had already had removed:

1. `.pg-frameoffer-px` was `white-space:nowrap`, making "was + now + SAVE chip"
   one unbreakable unit. On a 390px phone that is wider than the copy column, so
   it overflowed and painted under the ADD button. pg-unlock's note on its own
   `-px` rule describes the identical failure.
2. No small-phone geometry at all. Its only media block was `max-width:480px`,
   and the one thing it sized — `.pg-frameoffer-p` — is a class the markup does
   not contain (the price element is `-px`), so the block only recoloured the
   subtitle. Meanwhile the row sits in `#pg-unlock-slot`, where pg-cart-timer
   stamps geometry with two-ID `!important` rules and nothing here answered them.

## Fix
`sections/pg-frame-add.liquid` — the row now carries pg-unlock's geometry:

- The price line wraps: nowrap moved onto the struck price alone, the chip is an
  inline-block, so a narrow column drops the chip rather than running it under
  the button. Row gets `flex-wrap:wrap`.
- Card, thumbnail, type and button restated from `.pg-unlock`: 11px/13px padding,
  14px radius, same gradient, border and shadow, 54px thumb, 13.5px title,
  12.5px sub, and ONE button definition (`flex:0 0 auto`, `min-height:34px`,
  `padding:0 16px`) replacing the two that disagreed about padding and size.
- `max-width:600px`: gap 11, 48px thumb, 14px title, 11.5px sub — pg-unlock's
  mobile-parity block.
- `max-width:414px` (iPhone 13/16/17 land at 390-402px): 46px thumb stretched to
  the row height, 30px button, chip shrunk to 10.5px. Written with `#cart#cart`
  — three ids — so it beats pg-cart-timer's two-ID `!important` rules whatever
  the load order, the same answer pg-unlock's own 414px block gives.

Measured in Chromium at 390/393/402/414/430px, both rows side by side with their
real CSS: row heights 82-85px and within 1px of each other, title on one line, no
overlap between the price line and the button, no overflow past the card.

## Applied to
Theme "Duo Pack fix (Claude 9-7)" (unpublished, 163721380068),
`sections/pg-frame-add.liquid`, verified byte-identical
(md5 f11ae73eae854afe07393ae10978395a).

Files changed: sections/pg-frame-add.liquid

---

# Cart: stop the free case looping and billing spare cases

## Problem
A few seconds after the Duo Pack went in, the cart drawer started rebuilding
itself repeatedly, the case line's text and price jumped up and down, and more
cases kept arriving — chargeable $13.99 "Spare case" units the shopper never
chose.

## Cause
`pg-giftguard.ensureGift()` asked "does any line carry the `_free_gift`
property?" and added a gift when the answer was no. That is not the same
question as "is the gift already in the cart", and it was answered from a
`/cart.js` read that can be stale: pg-drawer, pg-cart-total, pg-cart-variants
(every 400ms), pg-chips and pg-giftguard all poll that endpoint, and Shopify
throttles it under that load — pg-chips already documents responses coming
back unparseable for exactly this reason.

One stale read and giftguard added a SECOND gift. The add merged into the same
line, so the gift line's quantity became 2. Two other sections watch for
precisely that and both answer it the same way:

    pg-drawer      giftSync()  : gift.quantity > 1 -> set it to 1, then ADD
                                 the surplus as 49640879063268 ($13.99)
    pg-case-mobile normalise() : the same rule, on its own 2s beat

So a stale read became a billable spare case; each write refreshed the drawer;
each refresh put more load on the same endpoint, and the next stale read did it
again. That loop is both the extra cases and the churn — the line text and
price move because four sections re-badge and re-price the case rows on
250ms/300ms/800ms beats while the drawer is being rebuilt underneath them.

The 1.2s poll added to pg-r36s-mobile in the previous commit was making the
throttling worse, on the same page the drawer opens over.

## Fix
`sections/pg-giftguard.liquid` — three changes, all in the one file, so the two
downstream sections need no edit:

1. The gift is detected BY VARIANT (49640846426340), not by a property. A
   question that cannot go stale into a false "no".
2. An add is followed by an 8s cooldown AND re-checked against a fresh read
   taken at the moment of the decision, so a slow endpoint can no longer be
   answered with a second gift.
3. The gift line is capped at one unit here, by REMOVAL. pg-drawer and
   pg-case-mobile cap it too, but by moving the surplus onto the paid variant —
   i.e. by charging for it. Removing it first leaves their branch nothing to
   sell. A unit that arrived by accident is not an upsell.

Its cart read also drops from 1.2s to 2s. The badge pass stays at 250ms: it is
DOM-only and never touches the network.

`sections/pg-r36s-mobile.liquid` — the duo baseline poll drops from 1.2s to 5s,
pauses while the cart drawer is open or the tab is hidden, and refreshes
immediately when the drawer closes so an edit made in there is still picked up
before the next tap. The post-add reconcile drops from five checks to three
(1200/2500/4000ms), which still clears every late writer in the theme.

## Applied to
Theme "Duo Pack fix (Claude 9-7)" (unpublished, 163721380068), both files
uploaded and verified byte-identical
(pg-giftguard 5c970a1a3cf4e1809ee0b2808e2aecb7,
pg-r36s-mobile ee133a9869aee280e1e37db3b284d79e).

Note: spare cases already added to a cart by the old loop are real cart lines
and are not removed by this — remove them once, and they will not come back.

Files changed: sections/pg-giftguard.liquid, sections/pg-r36s-mobile.liquid

---

# R36S Duo Pack: add exactly two consoles, not three

## Problem
Adding the Duo Pack on the R36S product page put THREE consoles in the cart.
Confirmed against real store data, not just reported: the abandoned checkout of
2026-09-07 18:31 holds three `Transparent Purple / 64G` consoles plus the free
case, and order #1029 shows the correct shape for comparison (two consoles plus
the free case).

## Cause
The console page has three separate scripts that can post to `/cart/add.js`:

- `pg-landing`'s own handler, bound to `#pgx-atc`. Its `mode` is only ever set
  by clicking a `[data-pgx-tile]` tile, and the visible 2-pack is NOT one of
  those: `pg-theme-css:140` hides pg-landing's `double` tile and `pgDuo`
  injects its own `.pgx-tile.pgx-duo`. So selecting the Duo Pack leaves `mode`
  at `'single'` — this handler adds ONE.
- `pgDuo` (in `pg-theme-css`), a document-capture handler that adds TWO.
- `pg-r36s-mobile`, a window-capture owner, added in the 9-6 round, that also
  adds two and stops the event.

Two plus one is the only arithmetic in these files that produces three. In a
spec-compliant browser it cannot happen — the window-capture owner stops the
event before either of the other two sees it, verified in Chromium against the
real handler shapes (`WITH/WITHOUT guards`, tap on both the bottom button and
the in-tile one: always two). The owner was already live and the count was
still wrong, so the extra write comes from something these files do not
explain, and the previous round's one-shot trim was never published.

## Fix
`sections/pg-r36s-mobile.liquid` — the enforcement, and the only part that is
live-critical:

- Claims `window.pgDuoOwner` so the other two writers can stand down by name
  rather than by event ordering.
- Enforces the count instead of arguing about it. `lastN` — the console total
  polled BEFORE the tap, on its own 1.2s beat, so a stray write from the same
  tap can never inflate it — sets the target at `lastN + 2`. The cart is
  re-read at 900/1800/3000/4500/6000ms, past every late writer in the theme
  (the 900ms add-on rider, pg-giftguard's 1200ms beat, a drawer refresh), and
  any surplus console is taken back off.
- The trim only ever REMOVES, only touches the console line, never removes more
  than the two units the tap is answerable for (so a stale baseline cannot eat
  a console the shopper added themselves), and issues no write at all when the
  count already agrees — which is every case that could be measured.

`sections/pg-landing.liquid` and `sections/pg-theme-css.liquid` — defence in
depth, in the repo but NOT applied to the theme: pg-landing's handler returns
early while a Duo Pack tile is selected, pgDuo's handler and the add-on
ride-along defer to `window.pgDuoOwner`. They close the 2+1 path at its source.
They were left unapplied deliberately: with the window-capture owner in place
neither path is reachable (the Chromium run above), and they are 41KB and 90KB
files on the store's main product page, so rewriting them wholesale to add one
line each is not a trade worth making until one of them is being edited anyway.

## Applied to
Theme "Duo Pack fix (Claude 9-7)" (unpublished, 163721380068):
`sections/pg-r36s-mobile.liquid` — uploaded and verified byte-identical
(md5 e844f0f90c1e357f3883b02f295fc1c8). The live theme cannot be written to
through the Shopify MCP; publish or merge that theme to ship it.

Files changed: sections/pg-r36s-mobile.liquid, sections/pg-landing.liquid,
sections/pg-theme-css.liquid

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
