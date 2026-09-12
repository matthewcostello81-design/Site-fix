# Cart: the free gift arrives with the console, and stops flickering

Reported on an iPhone 13: adding an R36S left the cart without its free
case for a long time, and the free-gift pill and the $0.00 price jumped
up and down repeatedly. Both symptoms came from `sections/pg-giftguard.liquid`.

## 1. The gift was placed by a poll, one to fifteen seconds late
Placement hung off `check()`, a 2s interval. The chain was: add console ->
wait for the tick -> GET /cart.js -> a second GET ("one more read") ->
POST /cart/add.js -> `pgDrawerRefresh()`, which has a 700ms floor in
pg-cart-fast and then re-fetches `/` in full. Under a throttled /cart.js
the file's own notes already recorded a console sitting 15s with no case.

That last step replaces the drawer's innerHTML wholesale, so every
stamping script (pg-case-mobile, nc-linesave, pg-chips, pg-drawer) re-ran
against fresh nodes while the shopper watched. The second cart mutation
WAS the re-render.

Fixed by not making a second request: `window.fetch` is wrapped, and a
POST to /cart/add.js carrying a console, Duo Pack or Trio Pack variant
gets the free case appended to its own items array. One round trip, and
the drawer's first paint already has the gift. The wrapper rewrites
nothing unless the method is POST, the URL is /cart/add.js, the body is
JSON, an item is a known earning variant, and the file knows the cart has
no gift. Earning variant ids are seeded and re-learned from the products
on load. The poll stays as the safety net for add paths it cannot see,
and every cart write now nudges a check 250ms later instead of waiting
out the full interval.

## 2. Two intervals fought over data-pg-free, four times a second
`pg-case-mobile asGift()` set `li.dataset.pgFree` every 250ms;
`pg-giftguard apply()` deleted it every 250ms, because its release clause
looked for `.pg-free-tag` and pg-case-mobile deliberately renders
`.pg-truegift-tag` instead. pg-drawer styles the whole gift module from
that attribute: `> section > p` display, `> section` grid rows, and
`figure img` height 110px. So the thumbnail resized and the row grew and
shrank, dragging the pill and the price with it.

The release clause now counts `.pg-truegift-tag` as a badge, and the
unearned branch no longer writes `data-pg-free` at all -- stamping it on a
paid spare case turned that row into a gift module and started the same
fight with `asPaid()`. Ownership of the attribute is pg-case-mobile's
alone; this file reads it and never writes it.

## Applied to
Theme "Copy of Copy of Single tile box (Claude 9-11f)".
Files changed: sections/pg-giftguard.liquid

---

