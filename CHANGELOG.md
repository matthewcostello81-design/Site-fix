# PDP: the review rotator was resizing the page every 6 seconds

## Symptom
On mobile the product page "just keeps adjusting or changing -- the screen
changes when you are not pressing anything."

## Cause
pg-landing renders a rotating customer review in `.pgx-quote` and advances it on
a timer:

    if (quotes.length > 1) setInterval(nextQuote, 6000);

`nextQuote()` only rewrites the text, so the box was sized by whatever review it
happened to be showing. Measured at 390px against the wall art's own eight
Judge.me reviews:

    51 chars  ->  94px
    71 chars  ->  94px
    78 chars  -> 113px
    117 chars -> 134px
    183 chars -> 176px

An 82px swing, every six seconds, with the shopper touching nothing.

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

Noted but not fixed here: pgDuo's 2500ms build guards on
`first.dataset.pgSingled`, and pgLadder inserts its tiles BEFORE the native
first tile -- so `first` becomes a `.pgx-lad` tile that lacks the flag and the
build re-fetches `/products.json?limit=50` a couple of extra times before it
settles. Wasteful, not the reported bug.

## Fix
The space is reserved rather than the rotation slowed, in nc-pgx-style.liquid --
whose own header is "PDP polish overrides for pg-landing", which is exactly what
this is:

    html body #pgx .pgx-quote{height:113px;box-sizing:border-box;overflow:hidden}
    html body #pgx .pgx-quote-name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    html body #pgx .pgx-quote-txt{-webkit-line-clamp:3; ...}

The text clamp alone was not enough: a long REVIEWER NAME wraps to a second line
and still pushed the box to 130px on the 183-character review -- a 17px residual
swing. The name is held to one line and the height is fixed rather than merely
floored, so nothing inside the box can move the page whatever a future review
contains.

## Measured, before and after, across all eight real reviews
    BEFORE  390px: 94..176px  -> content below jumps up to 82px per rotation
    BEFORE  430px: 94..176px  -> up to 82px
    AFTER   390px: 113px flat -> 0px
    AFTER   430px: 113px flat -> 0px

Verified with pg-landing's real CSS and the patched nc-pgx-style layered on top
in load order, so the override is confirmed to win on specificity.

Uploaded checksum 3f54c3cd8691d33f334010fb8e34cdd5 matches the local file byte
for byte. Deployed to "PDP quote no-jump (Claude 8-23)" (163148890340), a fresh
duplicate of the live theme, verified byte-identical to live on pg-unlock,
pg-landing, nc-pgx-style, layout/theme and config/settings_data.json before
patching. Needs publishing.

---

