# Pocket Era promo emails

Two templates, one design system, built to match the live theme (the `pg-*`
layer: Poppins, purple `#7A2FA2` / `#4A1C66`, ink `#121212`, lavender tints,
dark footer). Both are fluid so phones never zoom out.

| File | What it is | Where it goes |
| --- | --- | --- |
| `abandoned-checkout.liquid` | Shopify notification template for the abandoned checkout email. Pulls the real cart lines, the recovery link and the customer's first name. | Shopify admin > Settings > Notifications > Customer notifications > Abandoned checkout > Edit code. Replace everything, Save, then "Send test email". |
| `win-back-promo.html` | Marketing "come back" email: hero, best sellers grid, live deals, trust list. | Klaviyo / Omnisend / Mailchimp custom HTML template (swap `{{UNSUBSCRIBE_URL}}` and `{{COMPANY_ADDRESS}}` for that platform's tags). For Shopify Email, rebuild it with the build sheet below. |

Suggested subject line for the abandoned checkout email (the subject field
accepts Liquid):

```
{{ shop.name }}: your cart is saved. Free shipping when you come back.
```

## Why the current emails render in half the screen on phones

Every symptom of that kind comes from a fixed width somewhere in the email:

1. A content table with `width="600"` and no `max-width`. Phone mail apps
   shrink the whole email to fit 600px, so it lands in half of the screen.
2. An image or a column with a hard pixel width wider than the phone.
3. A missing `<meta name="viewport" content="width=device-width">` tag.
4. In Shopify Email: an image block set to a fixed pixel size, or a two-column
   section whose columns do not stack.

These templates avoid all four: the outer table is `width="100%"`, the content
table is `width:100%; max-width:600px`, every image is `width:100%; height:auto`
inside its column, and a media query stacks the layout under 480px. Outlook
desktop, which ignores `max-width`, gets a ghost 600px table through the MSO
conditional comments.

## Shopify Email build sheet

Shopify Email's editor does not accept pasted HTML, so recreate the design with
its blocks. Same values for the abandoned cart, abandoned product browse and
welcome automations, and for campaigns.

Theme settings (the paint bucket in the editor):

| Setting | Value |
| --- | --- |
| Background (outside) | `#F4EEF9` |
| Body / section background | `#FFFFFF` |
| Text | `#121212` |
| Muted text | `#6B6478` |
| Links and accent | `#7A2FA2` |
| Button | fill `#7A2FA2`, text `#FFFFFF`, corner radius 8 |
| Headings font | Poppins (or Helvetica if Poppins is not offered) |
| Body font | Poppins, 16px |
| Footer background | `#16101F`, text `#A296B4`, links `#C79BEA` |
| Logo | the header logo (`hf_20260811_225331_...png`), 110 to 120px wide, centered |

Section order and copy:

1. **Text bar** (background gradient is not available, use `#5E2585`): white,
   uppercase, 12px, letter-spaced: `FREE SHIPPING ON ALL ORDERS  |  30-DAY MONEY-BACK GUARANTEE`
2. **Logo**, centered, then a 13px muted line: `Retro gaming, pocket-sized.`
3. **Image**: the hero (`pg-hero-4k.png`), full width of the column, corners 14.
   Keep it as a full-width image, never a fixed pixel width.
4. **Text**: eyebrow in accent purple, uppercase, letter-spaced:
   `RETRO GAMING, REIMAGINED`, then the heading (30px, bold):
   `Your classics are waiting.` (abandoned cart: `Your cart is saved.`,
   product browse: `Still thinking it over?`), then 16px body:
   `15,000+ retro games in your pocket, glowing crystal orbs and holographic
   wall art. Pick up where you left off, shipping is on us and an extra 5%
   comes off at checkout.`
5. **Button**: `Shop best sellers` to `https://www.thepocketera.com/#pg-shop`
   (abandoned cart: `Complete my order` to the cart, product browse:
   `Back to it` to the product).
6. **Products** block: two columns, product images at column width. Pick from
   the R36S console, Crystal Legends Orb, Holo Legends Wall Art, R36S Duo Pack,
   R36S Pro 2. The Dragon Ball Z lamp is off the site, do not feature it.
7. **Text** on a `#5E2585` background, white: eyebrow `APPLIED AUTOMATICALLY AT CHECKOUT`,
   `An extra 5% off your whole order. No code needed.`,
   `Buy 2, get 1 free on Crystal Legends Orbs and Holo Legends Wall Art.`
   Only list discounts that are ACTIVE under Discounts in the admin.
8. **Text** on `#F4EEF9`: `WHY SHOP WITH POCKET ERA` then three lines:
   `Free tracked shipping to the US, Canada and the UK. Orders ship within 1 to 2 business days.`
   `30-day money-back guarantee on every order.`
   `US-based support. Call (402) 979-6583 or reply to this email and a real person answers.`
9. **Footer**: `Pocket Era`, `Retro gaming, pocket-sized.`, links Track order,
   Shipping, Returns, Contact, then the phone and email line. Shopify Email adds
   the unsubscribe link and the business address itself.

## Copy rules

* Only promise what checkout takes off. Live automatic discounts on
  2026-09-17: extra 5% off the whole order, buy 2 get 1 free on Crystal
  Legends Orbs and on Holo Legends Wall Art. When one ends, remove its line.
* No invented urgency (stock counters, fake timers), no press logos, no
  medical or sustainability claims.
* Plain punctuation: periods, commas, parentheses. No em dashes.

## QA before sending

1. Send a test to a Gmail and an iPhone Mail address. The card should fill the
   phone width with a 12px margin on each side and the button should span the
   width.
2. Tap every link: recovery link, products, Track order, Shipping, Returns,
   Contact, the phone number.
3. Check the prices in the win-back grid against the catalog.
