# PDP: the review rotator was resizing the page every 6 seconds

## Symptom
On mobile the product page "just keeps adjusting or changing -- the screen
changes when you are not pressing anything."

## Cause
pg-landing renders a rotating customer review in `.pgx-quote` and advances it on
a timer:

    if (quotes.length > 1) setInterval(nextQuote, 6000);

`nextQuote()` only rewrites the text, so the box was sized by whatever review it
happened to be showing. Measured against the wall art's own eight Judge.me
reviews, with pg-theme-css's `.pgx-quote` rules in load order:

    390px: 94..214px  -> a 120px swing
    430px: 94..176px  -> an 82px swing

Every six seconds, with the shopper touching nothing.

It lands in the worst possible place. pg-mobile's `quoteUp()` (1500ms interval)
parks this box directly under `.pgx-rating` -- ABOVE the price, the variant
picker and ADD TO CART -- so the entire buy box slid up and down on a six-second
cycle.

## What it is NOT
Ruled out along the way, so they are not re-investigated:

  - The five files the "PDP gallery + sticky fixes" change touched. Diffed
    against the previously live theme: pg-landing's arrow `jump()`,
    pg-gallery-tweaks' `gotoTitle()`, pg-wallart-gallery's desktop arrows and
    `stripGoto()` are all CLICK-driven; pg-pick-size's removed guard only
    widens a desktop rule; pg-theme-css removed the bottom sticky bar.
  - pgStars' `docH()`, which toggles `display` on the star columns every 1500ms.
    `.pgf-stars` is already `display:none` under 1100px (pg-theme-css line 272)
    and docH restores by CLEARING the inline value, so on mobile it never
    changes anything.
  - pgLadder's 3000ms build: guarded by `if (document.querySelector('.pgx-lad'))
    return`, so the interval is a retry, not a rebuild.

## Fix
The space is reserved rather than the rotation slowed:

    #pgx .pgx-quote:not([data-pg-moved]){height:113px;box-sizing:border-box;overflow:hidden}
    #pgx .pgx-quote:not([data-pg-moved]) .pgx-quote-name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #pgx .pgx-quote:not([data-pg-moved]) .pgx-quote-txt{-webkit-line-clamp:3; ...}

The text clamp alone was not enough: a long REVIEWER NAME wraps to a second line
and still pushed the box past 113px -- a 17px residual swing. The name is held to
one line and the height is fixed rather than merely floored, so nothing inside
the box can move the page whatever a future review contains.

`:not([data-pg-moved])` scopes this to the rotating copy. `moveQuote()` drops a
second, non-rotating copy further down the page carrying that attribute; it keeps
its own sizing.

### Correction to the first attempt
This first went into `nc-pgx-style.liquid`, whose header reads "PDP polish
overrides for pg-landing" and which looks like the obvious home. **That file is
registered in no section group and in no product template, so it never renders**
-- the rule was dead code and would never have applied. Caught before publishing
by checking footer-group.json, header-group.json and all three product templates;
that file is reverted to its original 57ad8441582059a9d2f69d375a920512 and the
rule now lives in pg-theme-css, which IS in footer-group, loads on every page,
and already styles `.pgx-quote` twenty lines above.

## Also in this file: one catalogue read per page instead of three
Two blocks in pg-theme-css each download `/products.json?limit=50` -- `yml()`
for "You may also like" and pgDuo's `build()` for the Duo Pack prices -- and
each can do it more than once. pgDuo's build runs on a 2500ms interval and
guards on `first.dataset.pgSingled` where `first` is `#pgx .pgx-tile`; pgLadder
inserts `.pgx-lad` tiles BEFORE the theme's first tile, so `first` becomes a
ladder tile that never carried the flag and the guard misses on the pass right
after the ladder builds. `yml()` runs at DOMContentLoaded and again at 1200ms,
and its `.pgu-yml` guard is tested before its own fetch resolves.

Measured on the orb page: three downloads of the same 50-product payload per
product page view. Both call sites now share one in-flight promise via
`window.pgCatalog()`; a failed read clears the cache so callers can retry.

The pgDuo guard is deliberately NOT re-pointed at `#pgx .pgx-tile:not(.pgx-lad)`,
which is the more correct reading of `first`: that would also move which tile
loses its radio dot, a visible change nobody asked for.

## Measured, before and after
Quote box, across all eight real reviews:

    BEFORE  390px: 94..214px  -> content below jumps up to 120px per rotation
    BEFORE  430px: 94..176px  -> up to 82px
    AFTER   390px: 113px flat -> 0px
    AFTER   430px: 113px flat -> 0px

Catalogue reads on the orb page:

    BEFORE  /products.json x3 at t=[20, 22, 1018] ms
    AFTER   /products.json x1 at t=[18] ms

with `ladder=4 bs=1 yml=1 cards=1 singled="pgx-tile pgx-lad pgx-sel"` identical
in both -- every DOM outcome unchanged.

Deployed to "PDP quote no-jump v2 (Claude 8-23)" (163149316324), a fresh
duplicate of the live theme, verified byte-identical to live on pg-theme-css,
nc-pgx-style, pg-unlock and config/settings_data.json before patching. Needs
publishing.

---

