# Cart: the order Total was hidden on every non-Max iPhone

## Symptom
The pinned cart pane showed "You saved (72%) $402.54", Shipping Protection, the
trust row and CHECKOUT -- and no Total anywhere. Reported from a 393px iPhone.

## Cause
The "Small-iPhone cart polish" change added one <style> block to
sections/pg-cart-timer.liquid. It is the ONLY file that differs between the
theme that was live before it and the one live now -- 13,393 -> 16,871 bytes,
everything else byte-identical. Inside its `@media (max-width:414px)` block:

    #cart .sticky-in-panel .l4tt{display:none !important}

`.l4tt` is not a taxes note, which is what the block's own comment assumed when
it claimed "no element is removed except the taxes note". pg-cart-total already
hides every row in that list except the Total:

    #cart .sticky-in-panel .l4tt:has(li.pg-tt) li:not(.pg-tt){display:none !important}

So by the time the compact rule applied, the only thing left in `.l4tt` was
`li.pg-tt` -- "Total $402.54". Hiding the list hid the Total and nothing else.

414px covers every non-Max iPhone (SE, mini, 15/16/17). The 430px Pro Max the
layout was tuned on was the one device that still showed it, which is why it
survived review.

## Fix
The rule is removed. Nothing replaces it: pg-cart-mobile already compacts that
row at every width under 760px (`.l4tt{margin:1px 0 !important}` plus its own
font sizing), so it returns tight rather than at desktop size. The rest of the
compact block -- row padding, thumbnails, chips, the rush banner, the upsell
rows, the frame offer, the trust row -- is untouched. The header comment's false
"nothing removed except the taxes note" claim is corrected in place so the same
mistake is not repeated.

## Measured, before and after, in a Chromium harness running the real cart
sections with the real compact block layered on:

    LIVE   393px (15/16/17)   l4tt display=none    Total *** HIDDEN ***
    LIVE   414px (Plus)       l4tt display=none    Total *** HIDDEN ***
    LIVE   430px (Pro Max)    l4tt display=block   Total VISIBLE 'Total $105.07'

    FIXED  393px              l4tt display=block   Total VISIBLE 'Total $105.07'
    FIXED  414px              l4tt display=block   Total VISIBLE 'Total $105.07'
    FIXED  430px              l4tt display=block   Total VISIBLE 'Total $105.07'

Cost of restoring it, at 393x852 scrolled to the end:

    live   pane 283px  item area 569px  CHECKOUT -6px vs drawer floor (inside)
    fixed  pane 313px  item area 539px  CHECKOUT -6px vs drawer floor (inside)

30px, and CHECKOUT stays inside the drawer's clip with the drawer still
scrollable.

Uploaded checksum 3af8bd32e4de073ac2658b5bf9b5ad2c matches the local file byte
for byte. Deployed to the DRAFT theme "Copy of Copy of Small-iPhone cart polish
(Claude)" (163138797796); writes against the published theme are blocked.
Needs publishing.

---

