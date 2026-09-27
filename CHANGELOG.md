# R36H Ultra page: imported Judge.me reviews in the R36S Ultra format (theme "R36H Ultra reviews (Claude 9-27)")

Owner, 2026-09-27: "just imported reviews for R36H Ultra. make them show on
site and copy the review structure of R36S Ultra." Judge.me synced the
product at 16:32 UTC: 34 reviews, 4.68 average, histogram 26/5/3/0/0.

## What was already there
The R36H Ultra page was built on 2026-09-26 with `hide_reviews` off, so the
review pieces fill in from the Judge.me metafields when the page renders. No
publish is needed for them.
- The rating line under the title. pg-rev-link turns it into "34 verified
  reviews", linking to the breakdown.
- The rotating review card.
- The "Loved by Gamers" photo strip, from pg-r36h-ultra-story.
- The breakdown at the bottom: 4.7 / 34 Reviews with the histogram.

The review CSS on the two pages is identical. So is the bottom order:
story, then "You may also like", then reviews.

## What differed, and the fix
- **Photo strip.** The R36H Ultra story carries the R36H Pro's strip: a
  plain snap-scrolling rail that stops at its last photo. The R36S Ultra's
  strip (pg-ultra-shots) loops: the photo set is printed five times and the
  rail is kept on the middle copy.
  - New `sections/pg-r36h-ultra-shots.liquid` and
    `assets/pgx-pg-r36h-ultra-shots.js`. They are pg-ultra-shots with the
    prefix `pg-uls-` renamed `pg-hus-`.
  - While the new strip renders, it hides the story's strip
    (`[data-rhs="shots"]`). The story section itself is untouched, and its
    script still seats the old strip; nothing needs it to be visible.
  - Both strips read the same photos and need three or more, so they come
    and go together.
  - The schema name is "PG R36H Ultra Photos", because Shopify caps it at 25
    characters.
- **Template fallbacks.** `templates/product.pg-r36h-ultra.json` carried no
  fallback figures and no fallback quotes. It now has 4.7 / "34 reviews" /
  34 and eight five-star reviews from the feed, verbatim, as the R36S Ultra
  template does. These render only if the Judge.me metafields go missing.
  The new section is registered after the story.

## Verified
- Built on a fresh copy of the live theme ("Save % match (Claude 9-27)").
  All 952 file checksums matched live before the upload, including the two
  homepage files changed at 16:43.
- All three uploaded files match the local copies by MD5.
- liquidjs and jsdom, against the real metafields:
  - Rating line "4.7" and "34 verified reviews", linking to #pg-reviews.
  - Breakdown "4.7 / 34 Reviews", histogram 26/5/3/0/0.
  - 27 review cards with no duplicates (Judge.me syncs part of the 34), 11
    with photos.
  - 27 rotating quotes, 25 of them eligible for the featured card (4 stars
    and up).
  - Strip: 20 photos, the same photos in the same order as the story's
    strip, 5 rail copies, pill "Rated 4.7/5 · 34 reviews".
  - The strip is seated right after #pgx-err, still there after the story
    script's second seat, with the rail centred on the middle copy.
  - Fallback path (no metafields): 4.7 / 34, 8 cards, 8 quotes, no strip,
    no hide rule.
- Real Chromium at 390px and 1280px, with the theme's CSS:
  - New theme: the story's strip computes to display:none, and the new
    strip shows with the rail centred.
  - Today (control): the story's strip shows.
  - Both: the rating line, card, grid and "Customer Reviews" title show,
    with no horizontal scroll.

## Raised with the owner
These reviews are in the feed and rotate or show on the page:
- Kenya Bauch (5): says the unit was returned.
- Clyde Rolfson (5): quotes a $50 price.
- Mack Green (4): names AliExpress.
- Shayne Rohan (5): names another seller ("boyhom").
- Craig Kautzer (5): calls it a "laptop".
- Harland Kohler (5) and Jeffery Hackett (3): identical text and photo under
  two names.
- Joannie Champlin (5): the text is only "Pocket Era R36H Ultra". It
  captions 4 strip photos.

The reviews are AliExpress imports that Judge.me marks verified_buyer:
false, while the page says "verified", as on the other console pages.

Files changed:
- theme/sections/pg-r36h-ultra-shots.liquid (new)
- theme/assets/pgx-pg-r36h-ultra-shots.js (new)
- theme/templates/product.pg-r36h-ultra.json

---

# SAVE % pills round like the cart (theme "Save % match (Claude 9-27)")

Owner, 2026-09-27: "make them match". The product-page SAVE pills rounded
the saving down; the cart's "Save n%" (nc-cro, nc-linesave, pg-cart-total)
rounds to the nearest percent. So the R36S Pro Single read SAVE 29% on the
page and Save 30% in the cart.

Fix: every console tile script now rounds to the nearest percent, the same
as the cart. The cart is unchanged (three writers, one of them inside the
260KB nc-cro section).

| Tile | Price vs struck | Page before | Page now = cart |
|---|---|---|---|
| R36S Pro Single | $79.99 vs $113.99 | 29% | 30% |
| R36S Pro Duo Max | $189.98 vs $417.92 | 54% | 55% |
| R36H Pro Single | $109.99 vs $147.99 | 25% | 26% |

Every other pill (R36S Pro Duo Pack and Max, R36H Pro, R36S Ultra, R36H
Ultra, RetroBox) already agreed and reads the same as before.

- Built on a fresh copy of the live theme ("Orb card framing (Claude
  9-26)"), theme 188153364708, unpublished. Publish it to go live.
- The only code change in each script is the pct() line (Math.floor to
  Math.round) and its note. The pro2, r36h and ultra scripts also have their
  two "·" escapes stored as the literal "·" the files already use
  elsewhere (the upload path converts them; same string in JS).
- pg-retrobox-tiles.liquid: the price note no longer says the pill rounds
  down.

## Verified
- Checksums of all six files on the theme match the local copies.
- pct_match: each script's pill against the cart's rounding, for every
  tile at current prices: all match.

Files changed:
- theme/assets/pgx-pg-pro2-tiles.js
- theme/assets/pgx-pg-r36h-tiles.js
- theme/assets/pgx-pg-r36h-ultra-tiles.js
- theme/assets/pgx-pg-ultra-tiles.js
- theme/assets/pgx-pg-retrobox-tiles.js (also brings the repo copy up to
  live: the extra-controller upsell from another session)
- theme/sections/pg-retrobox-tiles.liquid (same)

---

# R36S Pro: Single $79.99, every bundle $5 less per console (product data, live)

Owner, 2026-09-27: "make price of R36S pro single to 79.99. drop the bundle
prices accordingly." Read as: every console is $5 cheaper, in every tile.
Compare-at prices are unchanged, so the SAVE pills rise.

| Tile | Was | Now | Struck | Pill (tile, rounds down) |
|---|---|---|---|---|
| Single Device (64GB) | $84.99 | $79.99 | $113.99 | SAVE 29% (was 25%) |
| Duo Pack (2 singles, $5 off each) | $159.98 | $149.98 | $227.98 | SAVE 34% (was 29%) |
| Max Bundle (128GB) | $129.99 | $124.99 | $208.96 | MOST POPULAR · SAVE 40% (was 37%) |
| Duo Max (2 Max, $30 off each) | $199.98 | $189.98 | $417.92 | BEST DEAL · SAVE 54% (was 52%) |

- Only the variant prices changed: 5 Single and 5 Max colours.
- The Duo prices follow by themselves. The automatic discounts "R36S Pro -
  Duo Pack Savings" ($5 each) and "R36S Pro - Duo Max Savings" ($30 each)
  are unchanged, and so are the tiles' duo_off / duomax_off settings that
  mirror them.
- No theme file prints a fixed Pro price. pg-pro2-tiles and pg-pro2-story
  read the variants live. The dollar amounts in their notes are dated
  history.

## Verified
draftOrderCalculate, nothing saved:
- One Single: $79.99, less the Extra 5% ($3.99), comes to $76.00.
- A Duo Pack: $159.98, less the Duo Pack Savings ($10), is $149.98; less the
  Extra 5% ($7.49), $142.49.
- A Duo Max: $249.98, less the Duo Max Savings ($60), is $189.98; less the
  Extra 5% ($9.49), $180.49.

## Note
- The tiles round savings down. The cart (nc-cro) rounds to the nearest
  percent.
- So the Single reads SAVE 29% on the page and Save 30% in the cart. The Duo
  Max reads 54% on the page and 55% in the cart.
- Neither side is changed here.

Files changed: none

---

# PocketEra RetroBox: strikethrough prices end in .99

Owner, 2026-09-26: "make strikethrough prices round to .99 instead of random
cents".

## Product data (live on every theme)
| Edition | Price | Compare-at | Saving |
|---|---|---|---|
| 8-Bit | $129.99 | $173.99 (was $173.32) | 25.3% |
| 16-Bit | $139.99 | $186.99 (was $186.66) | 25.1% |

Each compare-at is the price / 0.75, rounded UP to the next .99. Rounding to
the NEAREST .99 would give $172.99 and $185.99, which save 24.9% and 24.7%.
The tile's SAVE pill rounds down, so it would read "SAVE 24%" while the cart,
which rounds, read "Save 25%".

## Theme
`sections/pg-retrobox-tiles.liquid` on "Copy of Copy of RetroBox page
(Claude 9-26)" (188129280228, unpublished): the price note carries the new
figures and the rounding rule. Comment only.

## Verified
- The file was re-fetched after upload: MD5 matches the local copy.
- Tiles, rendered with liquidjs and run in jsdom:
  - 8-Bit: $129.99, $173.99 struck, "SAVE 25%".
  - 16-Bit: $139.99, $186.99 struck, "2 PLAYERS · SAVE 25%".
- The cart's Save % is 25 for both.

Files changed: theme/sections/pg-retrobox-tiles.liquid

---

# PocketEra RetroBox: new prices ($129.99 / $139.99) with a 25% strikethrough

Theme: "Copy of Copy of RetroBox page (Claude 9-26)" (188129280228,
unpublished). "Copy of RetroBox page (Claude 9-26)" (188125806820) is now the
published theme.

## Product data (live on every theme, by request)
| Edition | Price | Compare-at | Saving |
|---|---|---|---|
| 8-Bit | $129.99 (was $119.99) | $173.32 (was $159.99) | exactly 25% |
| 16-Bit | $139.99 (was $119.99) | $186.66 (was $159.99) | 25.003% |

Each compare-at is the price / 0.75, rounded UP to the cent. The tile's SAVE
pill rounds down, so $186.65 (24.999%) would have read "SAVE 24%".

## Theme
- `sections/pg-retrobox-story.liquid`: the "Pick your era" headline read
  "Two Classic Editions. One Simple Price.", which is no longer true with two
  prices. It now reads "Two Classic Editions. Choose Yours.", shorter than the
  old line, so it still fits one line on a 360px phone. The price cards and the
  comparison table already print each variant's own price.
- `sections/pg-retrobox-tiles.liquid`: comments only. "Same price" is gone,
  and the price note gives the new figures and the rounding rule.
- Nothing else prints a price on this page. pg-landing's own tiles are
  hidden, and its bottom sticky bar is switched off site-wide.

## Verified
- Both files re-fetched after upload: MD5 matches the local copies.
- Tiles, rendered with liquidjs and run in jsdom:
  - 8-Bit: $129.99, $173.32 struck, "SAVE 25%".
  - 16-Bit: $139.99, $186.66 struck, "2 PLAYERS · SAVE 25%".
- Story panel: "Two Classic Editions. Choose Yours." with cards $129.99 and
  $139.99.
- Cart Save %: nc-cro rounds to 25 for both editions.
- draftOrderCalculate (nothing saved), one of each edition: $269.98, then
  "Extra 5% off entire order" -$13.49, subtotal $256.49.

## Note
The published theme still carries "One Simple Price." until this draft is
published. Theme files on the published theme cannot be written from here.

Files changed: theme/sections/pg-retrobox-story.liquid (new to the repo), theme/sections/pg-retrobox-tiles.liquid

---

# PocketEra RetroBox: one review removed, rotating review card taken off

Theme: "Copy of RetroBox page (Claude 9-26)" (188125806820, unpublished).

## What changed
- The owner removed Lore Predovic's review (5 stars, "Awesome good superb .
  worth it", 1 photo) in Judge.me. Judge.me re-synced at 21:36 UTC: 29 reviews
  at 4.72, histogram 21/8/0/0/0, 16 photos. pg-landing, pg-rev-link and
  pg-retrobox-shots read the metafields at render time, so the rating line,
  grid and strip follow on their own. The removed review was not one of the
  template's fallback quotes.
- The owner asked, with a screenshot, to "remove the mini slideshow i
  highlighted": the rotating review card (pg-landing's `.pgx-quote`) under
  the photo strip.

## Fix
- `sections/pg-retrobox-shots.liquid`: `#pgx#pgx .pgx-quote{display:none
  !important}`, scoped to the RetroBox page. The other console pages keep
  their card.
  - The card is hidden rather than deleted because three scripts expect it:
    pg-mobile's quoteUp() re-seats it and stamps inline position and margin,
    pg-theme-css's moveQuote() moves it, and pg-page-polish rotates it.
  - None of them sets `display` inline, and the only other display rule on
    the card is pg-landing's plain `display:flex`, so the rule holds.
- `templates/product.pg-retrobox.json`: the fallback count reads 29
  ("29 reviews" / 29). The fallback rating stays 4.7.

## Verified
- Both files re-fetched after upload: MD5 matches the local copies.
- Re-rendered with the new metafields (liquidjs and jsdom):
  - Rating line "4.7", "29 verified reviews".
  - Grid "4.7 / 29 Reviews", histogram 21/8/0/0/0, 29 unique cards.
  - Strip: 16 photos, pill "Rated 4.7/5 · 29 reviews".
  - "Lore Predovic" appears nowhere in the rendered page.
- Real Chromium (Playwright), using the theme's own CSS from pg-landing,
  pg-theme-css, pg-tile-copy, pg-r36s-mobile, pg-tiktok-pdp, pg-reviews-text
  and pg-mobile, plus the inline styles pg-mobile stamps:
  - The card computes to display:none, height 0, at 390px and 1280px, whether
    or not moveQuote() has moved it.
  - The rating line, strip, grid and "Customer Reviews" title all still show.
  - Control: without the rule, the card shows at 113 to 120px.
- jsdom's own cascade ignores !important and specificity, so it cannot judge
  this rule. That is why the check runs in Chromium.

Files changed: theme/sections/pg-retrobox-shots.liquid, theme/templates/product.pg-retrobox.json

---

# PocketEra RetroBox: show the imported Judge.me reviews in the R36S page's format

Theme: "Copy of RetroBox page (Claude 9-26)" (188125806820, unpublished), the
same draft as the RetroBox fixes below. The live theme was not touched.

## Problem
The owner imported the RetroBox's reviews into Judge.me: 30 reviews, 4.73
average, 22 five-star and 8 four-star, 7 with photos. The feed's product_name
is "PocketEra RetroBox". The page showed none of them. It had no "verified
reviews" line at the top, no review slideshow mid-page, and no breakdown at
the bottom.

## Cause
The page was built earlier the same day, before the product had reviews:
- `templates/product.pg-retrobox.json` set `hide_reviews: true` on pg-landing.
- pg-retrobox-story left out the Pro story's buyer photo strip and its
  "Customer Reviews" title.

## Fix
Done the same way as on the R36S Ultra page.
- `templates/product.pg-retrobox.json`
  - `hide_reviews` is off, so pg-landing renders the rating line, the
    rotating review card and the `#pg-reviews` block with its histogram.
    pg-rev-link makes the rating line "30 verified reviews" and a jump link.
  - The fallback figures (used only if the Judge.me metafields go missing)
    read 4.7 / "30 reviews" / 30.
  - The fallback quote blocks are eight five-star reviews from the feed,
    verbatim. None of them names a game system, matching the story's
    no-franchise rule.
  - The new section is registered.
- `sections/pg-retrobox-shots.liquid` (new) and
  `assets/pgx-pg-retrobox-shots.js` (new)
  - They are pg-ultra-shots with `pg-uls-` renamed `pg-rbp-`: the "Loved by
    Gamers" buyer photo strip with its rating pill and looping rail. It holds
    every review photo in feed order and is seated under Add to cart (order 6
    on phones).
  - The section also carries the Pro story's "Customer Reviews" title rules
    for `#pg-reviews`.
  - The story section is untouched: its `lower()` already seats the story
    above the review grid when there is one.

## Verified
- All three files re-fetched after upload: MD5 matches the local copies.
- The new section and pg-landing's review Liquid were rendered with liquidjs
  against the real Judge.me metafields, then run in jsdom with pg-rev-link and
  the new script.
  - Rating line: "4.7" and "30 verified reviews", linking to #pg-reviews.
  - Grid: "4.7 / 30 Reviews", histogram 22/8/0/0/0, 30 cards with no
    duplicates, 7 of them with photos.
  - Rotating card: 30 quotes, all 4 stars and up, so all are eligible for the
    featured card.
  - Strip: 17 photos, 5 rail copies, pill "Rated 4.7/5 · 30 reviews", seated
    right after #pgx-err, rail centred on the middle copy.
  - Fallback path (no Judge.me data): 8 fallback cards, no strip, title CSS
    kept.

## Raised with the owner
- The 30 reviews are AliExpress imports that Judge.me marks
  verified_buyer: false. The page still says "30 verified reviews", and
  pg-verified adds "Verified" chips, as on the other console pages.
- Gene Macejkovic's review text is only "PocketEra RetroBox", which looks like
  an import artifact. It captions 5 strip photos.
- Dana Rowe describes plugging into "component" on the TV. The RetroBox is
  HDMI.

Files changed: theme/templates/product.pg-retrobox.json, theme/sections/pg-retrobox-shots.liquid (new), theme/assets/pgx-pg-retrobox-shots.js (new)

---

# PocketEra RetroBox: hero pill, edition photo switch, cart photo, 5% note, $159.99 compare-at

Theme: "Copy of RetroBox page (Claude 9-26)" (188125806820, unpublished). The
live theme (188122235108) was not touched. Product: PocketEra RetroBox
(`pocketera-retrobox`, template `pg-retrobox`).

## Problems
1. The pill on the hero photo (both consoles) read "16-Bit Edition". The
   section built its photo-to-edition map with `alt contains '16-Bit Edition'`,
   and the hero's alt, "PocketEra RetroBox 8-Bit and 16-Bit Editions",
   contains that string.
2. Picking the 8-Bit (or 16-Bit) tile changed the selection only; the photo
   above stayed where it was.
3. The cart showed the hero for both editions: neither variant had an image,
   so Shopify fell back to the product's first photo. That value also feeds
   `/cart.js`, which pg-cart-addons' syncImages() writes back onto every cart
   line, so a Liquid-only fix in side-cart would have been undone.
4. The owner asked to make sure the extra 5% applies, and for a $159.99
   strikethrough.

## Fix
- `sections/pg-retrobox-tiles.liquid`: a photo is an edition's only when the
  alt text before " - " equals a variant's Edition (case-insensitive). Every
  photo is listed; non-edition photos carry `name` ("Pocket Era RetroBox",
  spelled like the store's other "Pocket Era ..." titles). The tier notes now
  end "plus an extra 5% off at checkout", as on the R36S Pro.
- `assets/pgx-pg-retrobox-tiles.js`: the pill shows the edition or `name`.
  Tapping a tile (or Enter/Space, or a story button via pgRbSelect) shows that
  edition's first photo: the big photo on desktop; on phones the carousel
  scrolls to that slide (instant jump, as the orb picker does). The in-tile
  Add to cart only selects, so adding never moves the photo.
- Product data (live on every theme, by request): variant images assigned
  (8-Bit -> "...mini TV console with controller", 16-Bit -> "...mini TV console
  with 2 controllers"), so the cart and checkout show the chosen edition. The
  compare-at price on both editions is now $159.99 against $119.99. The tiles
  now strike $159.99 with a SAVE 25% pill. In the cart, nc-cro's cartWasFix
  reads the line's compare-at and prints "$159.99 / $119.99 / Save 25%",
  replacing the old "$119.99 / $119.99 / Save 0%".

## Verified
- Both files re-fetched after upload: MD5 matches the local copies.
- The new Liquid was rendered with liquidjs, and the script was run in jsdom.
  - Before the fix, the phone slides read "16-Bit Edition | 8-Bit | 8-Bit |
    16-Bit | 16-Bit".
  - After the fix they read "Pocket Era RetroBox | 8-Bit Edition | 8-Bit
    Edition | 16-Bit Edition | 16-Bit Edition".
  - Desktop: tile picks, Enter, and pgRbSelect switch the big photo and its
    pill. Thumbnail clicks still work.
  - Phone: the strip scrolls to slide 4 for the 16-Bit and to slide 2 for the
    8-Bit. The in-tile Add to cart leaves the photo where it is.
  - With the compare-at set, each tile reads "$119.99 / $159.99 struck", and
    the pills read "SAVE 25%" and "2 PLAYERS · SAVE 25%".
- draftOrderCalculate (nothing saved), one of each edition:
  - "Extra 5% off entire order" applied, -$11.99.
  - The line images are the two edition photos.
  - The hero is still the product's first photo.

## Not changed, flagged
- "Save 0%" on full-price cart lines, site-wide. nc-linesave draws its
  was/now/Save row whenever total_discount > 0, and the automatic 5% alone
  triggers that. nc-cro repairs the row only when the line has a compare-at.
- The product title is "PocketEra RetroBox" (no space). The pill and the other
  products use "Pocket Era", so the cart and checkout title differ from the
  pill.

Files changed: theme/sections/pg-retrobox-tiles.liquid, theme/assets/pgx-pg-retrobox-tiles.js

---

# R36S Ultra: second review cleanup synced by Judge.me (no theme change)

## What happened
The owner removed more of the Ultra's reviews on 2026-09-25. Judge.me re-synced
the product metafields at 23:55 UTC: 321 reviews at 4.34 became 271 at 4.73.
The live theme (166000885988) reads those metafields at render time (pg-landing,
pg-rev-link, pg-ultra-shots, and pg-page-polish's featured card, which reads the
grid), so the rating line, histogram, grid and photo strip updated themselves.
Removed reviews that had been on the page and are gone: Yuri Goodwin (3),
Lena Pollich (1), Steve Abbott (the Anbernic RG SP review), Scot Braun,
Graham Heathcote, Latrisha Grimes. No other Ultra file hardcodes a review figure.

## Not changed, deliberately
`templates/product.pg-ultra.json` still carries the fallback values (4.3 /
"321 reviews" / 321) and a fallback quote from Latrisha Grimes, a removed
review. They render only if the Judge.me metafields are absent. No theme copy
was made for this alone: the change is invisible, and a copy of the live theme
published later would roll back any live edits made in between. For the next
theme draft: rating_value "4.7", rating_label "271 reviews", review_total 271,
and rev5 replaced with a review still in the feed.

## Raised with the owner
Across the two cleanups, by star (first import -> now): 5: 251 -> 226,
4: 32 -> 29, 3: 22 -> 10, 2: 13 -> 1, 1: 51 -> 5. Removing reviews for being
negative while the page shows a count and a star breakdown is review
suppression under the FTC's 2024 consumer review rule (16 CFR 465.7);
removing reviews about a different product is not. Separately, the page calls
these imported reviews "verified" (pg-rev-link's "N verified reviews", and
pg-verified's chip on about two thirds of cards, chosen by a hash of name and
text), while Judge.me marks the synced reviews verified_buyer: false.

Files changed: none

---

# Crystal Legends Orb: name pill and picker jump for Dragonair and Raichu (product data, live)

## Problem
On the live orb page, the two newly added characters (Dragonair, Raichu) showed
"CRYSTAL LEGENDS ORB" in the name pill over their photos instead of their own
names, and picking either one in the bundle picker did not move the photo strip
to its photo, unlike every other character.

## Cause
Both come from pg-gallery-tweaks, which names each strip photo from the product
media's ALT TEXT ("Crystal PokeOrb – Arceus" -> "Arceus", the part after the
dash), and jumps the strip on a pick by matching the picked name against those
same names. The two new photos were uploaded with blank alt text, which Liquid
fills with the product title, so their name read "Crystal Legends Orb" and no
photo was ever named "Dragonair" or "Raichu" for the picker to find. Their
variant images were already assigned correctly.

## Fix
Product data only, applied directly to the live product (no theme change, no
publish): alt text set with `fileUpdate` on the two media, in the same format
as the other 37:

    MediaImage 73534459674852  "Crystal PokeOrb – Dragonair"
    MediaImage 73534611816676  "Crystal PokeOrb – Raichu"

Verified by re-reading the product media and by replaying pg-gallery-tweaks'
own script in jsdom against the before and after data: before, both slides read
"Crystal Legends Orb" and picking them left the strip where it was; after, they
read "Dragonair" / "Raichu" and a pick jumps to the right slide. The two files
share a name stem ("Keep-the-product-in-the-FIRST-reference"), and the strip
requests each photo at its exact filename, so the exact-match lookup is the path
taken and the looser stem fallback cannot swap them.

## Noted, not changed
- Adding an orb in future: set its photo's alt text to "Crystal PokeOrb – Name"
  or the pill and the picker jump will miss it the same way.
- Arcanine has no photo on the product at all (no variant image, no media), so
  picking it cannot move the strip.
- The page still says 36 characters (benefits row, features text); the product
  now has 39 options. That copy is in the theme.

Files changed: none (product media alt text via the Admin API)

---

# R36S Ultra page: reflect the removed reviews; review card prints real stars

## What changed in Judge.me
The owner removed 48 of the Ultra's imported reviews on 2026-09-25. Judge.me
re-synced the product metafields at 02:56 UTC: 369 reviews at 4.14 became 321
at 4.34 (histogram 232 / 31 / 21 / 8 / 29). pg-landing, pg-rev-link and
pg-ultra-shots read those metafields at render time, so the rating line, the
"verified reviews" count, the histogram, the review grid and the photo strip
update by themselves. Two things did not.

## Fix
- `templates/product.pg-ultra.json`: the fallback figures (shown only if the
  Judge.me metafields go missing) now read 4.3 / 321, and the fallback quote
  from Emely Jacobs, one of the removed reviews, is replaced verbatim with a
  review that is still published (Corazon Casper, 5 stars).
- `assets/pgx-pg-page-polish.js` (section 8, the rotating review card under
  the buy box): it printed five stars beside every quote whatever the review
  said, so the Ultra's 1-star "the device arrived damaged" and 3-star "fake SD
  card" reviews rotated as five-star quotes, and on the published theme the
  orb page's two 2-star reviews ("scratches on the glass", "base was completely
  broken") do the same. Each quote now carries the rating its own grid card
  shows and prints it (a 4-star shows 4 filled stars); reviews under four stars
  are left out of this featured card and stay in the grid, the histogram and
  the count. A card whose stars cannot be read is left out rather than guessed
  at. This file is shared by every pg-landing page, so the orb, R36S Pro and
  R36H cards change the same way.

Verified with a jsdom simulation of the card against the stored file: before,
the 3-star and 1-star quotes rotated with five stars; after, only 4-star and up
rotate, each with its real stars, and duplicates still collapse.

## Still in the Ultra's feed (for the owner, not changed here)
- Steve Abbott, 5 stars: a review of an Anbernic "RG SP" clamshell, not the
  Ultra. It entered the review_widget_json_ld slice after the cleanup, so it
  shows in the grid and rotates in the featured card.
- Zack Kerluke, 5 stars: "... and not some random obsolete bit of garbage
  instead", a wrong-item complaint rated 5. It rotates in the featured card.
- Lena Pollich (1 star) and Yuri Goodwin (3 stars): in the grid with their
  real stars, no longer featured.

## Applied to
Shopify draft theme `166000885988` ("Copy of Copy of Cart pane rows back
(Claude 9-24)"). Not published; the published theme still hides the Ultra's
reviews until this draft goes live.

Files changed: templates/product.pg-ultra.json, assets/pgx-pg-page-polish.js
(mirrored under theme/)

---

# R36S Ultra page: show the imported Judge.me reviews, in the R36S page's format

## Problem
The owner imported the R36S Ultra's reviews into Judge.me (369 reviews, 4.1
average) and the Ultra product page showed none of them: no "369 verified
reviews" line under the title, no rotating review card, no buyer-photo strip
and no review breakdown (histogram plus grid) at the bottom, all of which the
R36S Pro and R36H Pro pages have.

## Cause
When the Ultra page was built (2026-09-23) its Judge.me data belonged to the
Flip SP, so `templates/product.pg-ultra.json` set `hide_reviews: true` on the
shared `pg-landing` section, and `sections/pg-ultra-story.liquid` was cloned
from the Pro story with the "Buyer Reviews" photo strip cut out. The data is
the Ultra's own now (Judge.me's product_name in the feed reads "Pocket Era
R36S Ultra"), but the page was still wired to hide it.

## Fix
- `templates/product.pg-ultra.json`: `hide_reviews` off, so `pg-landing`
  renders its rating line (pg-rev-link makes it "369 verified reviews" and a
  jump link), the rotating review card and the `#pg-reviews` block with the
  histogram and the review cards, all from `judgeme.review_widget_data` and
  `review_widget_json_ld`. Fallback settings match the feed (4.1, 369) and
  eight real five-star reviews from the feed are the fallback quote blocks,
  the way the other console templates carry them. Registers the new section.
- `sections/pg-ultra-shots.liquid` (new) + `assets/pgx-pg-ultra-shots.js`
  (new): the "Buyer Reviews" photo strip with the "Loved by Gamers" pill and
  the looping rail, ported from the Pro story (`pg-p2s-` rules renamed to
  `pg-uls-`) as its own small section instead of rewriting the 55KB Ultra
  story file. Every photo of every synced review, in feed order; the pill
  prints the feed's own average and count and then follows the page's rating
  line. Seated after the Add to cart button (desktop) or the last tile, order 6
  on phones, exactly where the Pro page puts it.

The Ultra story section and its script are untouched; the story's own
`lower()` already seats the story above the review block when one exists.

## Applied to
Shopify draft theme `166000885988` ("Copy of Copy of Cart pane rows back
(Claude 9-24)"). The theme named in the request had been published mid-task
(writes to the live theme are blocked), so the fresh copy made from it is the
draft that carries this change. Not published.

Files changed: sections/pg-ultra-shots.liquid (new), assets/pgx-pg-ultra-shots.js (new),
templates/product.pg-ultra.json (mirrored under theme/)

---

# Cart drawer: 5% off, shipping protection and subtotal back in the pinned pane

## Problem
The cart drawer's summary rows (the 10-minute "EXTRA 5% OFF" countdown chip,
the Shipping Protection toggle, and the Subtotal / Extra 5% Off box) had come
loose from the pinned bottom pane. On a long cart they scrolled away with the
items; on a short cart they floated above a blank gap. The Total and Secure
Checkout stayed pinned below them either way, so the summary read as broken.

## Cause
An edit made earlier on 2026-09-24 added a `pgSeatAbove` helper to
`assets/pgx-pg-drawer.js` that seats those three rows in the scroll flow just
above the pane's flex spacer, to keep the pane short. The spacer then grows
between them and the pane on a short cart, and on a long cart they are simply
part of the scrolling list. pg-cart-timer, pg-cart-total and pg-drawer's own
pgPane all seat through that helper, so all three rows moved together.

## Fix
`pgSeatAbove` now seats the rows INSIDE `.sticky-in-panel`, in a fixed order,
directly above the theme's totals list:

    countdown chip -> Shipping Protection -> Subtotal / Extra 5% Off
    -> Total -> Secure Checkout -> express pay -> card icons

A row that is already in place is left alone, so the observers that watch the
drawer see no churn. The duplicate (guarded, dead) copy of the helper further
down the file was removed. The existing compact styling for these rows inside
the pane (pg-drawer; pg-cart-mobile under 760px; pg-cart-timer under 414px)
applies again because they are back where those rules look for them.

Verified with a jsdom simulation of the drawer: a fresh drawer, a drawer left
in the old layout, a late-arriving toggle, and a pane with no totals list all
end in the same order, and repeat calls make zero DOM mutations.

## Applied to
Shopify draft theme `165991940324` ("Cart pane rows back (Claude 9-24)"),
duplicated from the live theme `165957664996` ("JS to assets - fast nav
(Claude 9-24)") so it carries everything live has. Not published.

Files changed: assets/pgx-pg-drawer.js (mirrored at theme/assets/pgx-pg-drawer.js)

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
