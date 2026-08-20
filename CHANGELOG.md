# Wall art gallery: one photo per view on desktop

## Change
With the top room shot gone, the photo strip under the video was still laid
out two-up on desktop, which pg-landing sized for thumbnails sitting beneath a
big hero. The strip is the gallery now, so two small tiles were too little.
Desktop shows one photo per view, paged by the arrows pg-landing already draws
at that breakpoint, matching the crystal orbs page.

## How
`sections/pg-wallart-gallery.liquid` now mirrors `sections/pg-gallery-tweaks.liquid`,
which does exactly this on `product.pg-crystal.json`:

    @media (min-width:901px){
      #pgx .pgx-thumbwrap .pgx-thumbs button{flex:0 0 100% !important}
    }

Under 900px the strip was already one photo per view — `pg-gallery-mobile`
does that site-wide from `footer-group` — so only desktop needed handling.

## Dropped from the first pass
The click-to-enlarge hero and the desktop flex ordering that positioned it are
gone. Both existed to give back a large view of a photo the thumbnails showed
small; at full width the strip is that large view, so the hero stays hidden.
Removing the flex column also removes the mobile hazard it carried, since
`.pgx-vid` has a `flex:0 0 88%` under 900px that a column flex parent would
have read as a height.

---

