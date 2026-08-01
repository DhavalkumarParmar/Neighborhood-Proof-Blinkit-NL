# Screen inventory and demo URLs

Four screens. Layout described top to bottom as rendered, at a 430px phone
shell (`--shell: 430px` in `app/globals.css`).

---

## ⚠ The deployed base URL is not in the repo

I do not have your Vercel URL — it was never shared with me and nothing in the
codebase records it. **Every path below is relative.** Prefix them with your
deployment origin before putting them in the deck.

```
https://<your-vercel-domain>/p/BEA-0001?p=regular
```

There is no `vercel.json`, no environment file, and no deployment metadata
committed, so I cannot infer it. Fill this in yourself.

---

## The four proof-card state URLs

These are the screenshot targets. All four are also linked from the profile
picker at `/` under "Jump straight to a state", so you can reach them by
clicking rather than typing.

| State | Path | What the card says | Product |
|---|---|---|---|
| **Normal** | `/p/BEA-0001?p=regular` | "212 homes near you" · "9 sent it back. That's low for beauty." | Aurvi 10% Niacinamide Face Serum |
| **Widened to city** | `/p/PET-0010?p=regular` | "Too few orders near you. Showing all of Vadodara instead." · "41 homes in Vadodara" | Bhaukaal Pet Co Cat Scratching Post |
| **Honest negative** | `/p/BEA-0003?p=regular` | "11 of 38 sent it back. That's high." | Sattva Skin Onion Hair Oil |
| **No data** | `/p/BEA-0001?p=bachelor` | "New here. No orders yet to show you." | Same serum, seen from the thin store |

Note the fourth row: **same SKU as the first, different shopper.** That is the
sharpest way to demo the moat — one product, two pincodes, and the card changes
from "212 homes near you" to "nothing to show you." Put those two screenshots
side by side.

The `?p=` parameter selects the shopper: `regular` (Alkapuri, Vadodara),
`parent` (Sector 62, Noida), `bachelor` (Karjat). It is required — every page
redirects to `/` without a valid one.

---

## Screen 1 — Profile picker · `/`

**Demonstrates:** that proof is local, so which store serves you decides what
can be said.

Not styled as the Blinkit app. This is deliberately demo chrome — a reviewer
needs to choose a vantage point before the app makes sense.

Hierarchy, top to bottom:
1. Green kicker "NEIGHBOURHOOD PROOF"
2. H1, 25px/800 — "What did homes near you actually do with this?"
3. One paragraph of body copy explaining the swap from star ratings
4. Three shopper cards — avatar initials, name, green role label, one-line
   behavioural blurb, then store area and pincode in grey
5. Divider, then "JUMP STRAIGHT TO A STATE" — four labelled links, one per
   proof-card state, each with the numbers as a right-aligned hint
6. Footer disclaimer

The state links exist so an evaluator does not have to hunt through 150 SKUs.

---

## Screen 2 — Browse listing · `/browse?p=regular`

**Demonstrates:** the proof line replacing the star rating at listing level —
the concept visible before you even open a product.

Hierarchy:
1. **Yellow header** — "Blinkit in" / "8 minutes" (29px/800) + a "24/7" pill /
   "HOME – Alkapuri, Vadodara" with chevron / wallet chip and avatar right
2. **White search bar**, 46px, mic icon behind a divider
3. **Icon tab rail** on the yellow — All, Beauty, Home, Pet Care, Baby Care,
   Electronics; active tab has a dark underline. Horizontally scrollable.
4. **Section title** "Beyond your usual list" + live item count
5. **Two-column card grid** on a light grey page. Each card:
   - bordered image box containing the photo, a heart icon, carousel dots, and
     the unit label with the **ADD button inside the box** (as the real app does)
   - price, then struck MRP
   - "₹180 OFF" in plain blue text, not a badge
   - product title, two lines max
   - **the proof line in green — sits exactly where `★★★★½ 1,593` sits in the
     real app**
   - delivery time with a clock icon
6. **Four-tab bottom bar** — Home, Order Again, Categories, Cart

Delivery ETA is derived from store density, so Karjat shows 19 minutes and
Alkapuri 8.

The listing search and category tabs are live client-side filters, not decoration.

---

## Screen 3 — Product page · `/p/[sku]?p=[profile]`

**Demonstrates:** all four proof-card states. This is the concept screen.

Hierarchy:
1. **Full-bleed hero image** with floating circular buttons — back, heart,
   search, share
2. Carousel dots
3. **White card:** delivery time · category → product title (20px/700) → unit ·
   "Sold at your Alkapuri store" → price + MRP → "₹180 OFF" in blue
4. **PROOF CARD** — directly under the price, the largest block on the page:
   - "NEIGHBOURHOOD PROOF" label with a status dot
   - *(widened state only)* an amber notice strip
   - headline count, 26px/800 — "212 homes near you" / "bought this last month"
   - returns line, 15.5px/700 — "9 sent it back. That's low for beauty."
   - horizontal rule, then the model's complaint sentence
   - provenance line with a shield icon
5. Three-reason strip — superfast delivery, best prices, easy returns
6. Product details table
7. Sticky bottom bar — unit, price, MRP, "Inclusive of all taxes", green
   Add to cart

**The two deliberate departures from the real Blinkit screen:** the star rating
and review count are gone, and the proof card takes their place. Tone changes by
state — green for normal/widened, amber for negative, neutral grey for no data.

---

## Screen 4 — Cart · `/cart?p=regular`

**Demonstrates:** nothing about the concept. Deliberately a stub.

1. White top bar — back button, "Your cart" / "Delivering to Home"
2. Centred empty state — cart icon in a grey circle, "Cart is empty", one line
   saying checkout is not part of the demo and pointing back to the product page
3. Green "Back to browsing" button
4. Four-tab bottom bar

Building a fake checkout would invite questions about a flow that is not the idea.

---

## Footer

On every screen: *"Concept demo, built for demo and educational purposes only.
Not affiliated with Blinkit."*
