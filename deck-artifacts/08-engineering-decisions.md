# Key engineering decisions and trade-offs

---

## Decisions taken

### Numbers computed in code, never asked of the model

**Chose:** the model receives review prose and returns one sentence. Every
figure is counted in `lib/proof-core.ts`.
**Rejected:** giving the model the ledger and asking it to summarise including
counts.
**Why:** the product's only asset is that the numbers are true. A model that
produces a count can produce a wrong count, and there is no way to prove
otherwise on a slide. This makes "no number on this card was generated" a claim
that survives inspection.

### A code-enforced guard on top of the prompt rule

**Chose:** ban digits in the prompt *and* drop any sentence containing one in
`sanitise()`.
**Rejected:** prompt instructions alone.
**Why:** tested and it failed. The model emitted "The return rate was 4." — a
figure we had supplied, stated meaninglessly. The rule only became reliable when
enforced in code. This is the single most defensible decision in the build.

### Facts recomputed server-side in the API route

**Chose:** `/api/summary` takes `sku` and `store`, recomputes everything.
**Rejected:** the client posting the facts it already has.
**Why:** one round trip cheaper, but it would mean a crafted request could put
any numbers on a card. Not acceptable for a product about trustworthy numbers.

### Numbers server-rendered, sentence fetched after

**Chose:** proof card renders counts in the server pass; a client component
fetches the sentence and drops it in.
**Rejected:** awaiting the model during SSR.
**Why:** a slow model would delay the whole page. This way the card is complete
and useful at first paint, and the sentence is an enhancement. It also makes the
silent-degrade path structurally trivial — nothing to unwind.

### Silent degradation with no error state

**Chose:** on any model failure, render numbers alone. No message, no retry, no
apology.
**Rejected:** "Summary unavailable" or a retry affordance.
**Why:** an error message would draw attention to the least important part of
the card. The numbers are the product.
**Cost, stated plainly:** a broken key looks identical to a healthy one. I added
`diagnose()` for the check script to make misconfiguration findable, but there
is no runtime signal. Named as a gap in `06-failure-modes.md`.

### Network-wide category baseline, not per store

**Chose:** compare a product against all 12,382 beauty rows across five stores.
**Rejected:** the local store's category rate.
**Why:** one store does not have volume to make a per-category rate stable. A
noisy baseline would flip verdicts between stores for the same product.

### Returners' reviews retrieved first

**Chose:** order review strings returners-first, then trim to 24.
**Rejected:** chronological or random sampling.
**Why:** the prompt rule "you must name a recurring negative" cannot fire if the
complaint never reaches the model. Retrieval order is what makes the prompt rule
enforceable — a small detail that carries a lot of the product promise.

### Synthetic data with a seeded PRNG, dates as `daysAgo`

**Chose:** deterministic generator, offsets instead of absolute dates.
**Rejected:** a hand-written fixture, or absolute timestamps.
**Why:** reproducible, and the "last 30 days" window stays true whenever the
demo is opened rather than quietly emptying out. Three (SKU, store) pairs have
pinned counts so the demo copy reads exactly as designed; everything else is
generated.

### Invented brand names

**Chose:** Aurvi, Sattva Skin, Pawrush.
**Rejected:** real Indian D2C brands.
**Why:** the app attaches fabricated return rates and complaints to whatever is
on the card. Doing that to a real company's product on a public URL is a
different thing from a demo.
**Note:** the product *photos* supplied later do show real brands. That was
raised and accepted as a deliberate call given the limited audience.

### Complaints gated by product traits

**Chose:** derive traits from each product name (`liquid`, `pump`, `gear`,
`food`, `makeup`, `cleaner`, `battery`) and let each complaint declare which
traits make it possible.
**Rejected:** assigning complaints per category.
**Why:** category-level assignment gave a cat scratching post dog-food reviews
and a kajal pencil a broken pump. Obviously fabricated to anyone who reads a
card — which undoes the realism the whole demo depends on.

---

## Cut for time

| Cut | Why | Consequence |
|---|---|---|
| Working cart and checkout | Not the idea being tested | Cart is an honest stub |
| Real per-SKU photography | 150 images was not a good use of the budget | 41 of 150 SKUs have photos; the rest use tinted tiles that read as deliberate |
| Rate-limit handling | Would not fire at demo scale | A 429 silently drops the sentence |
| Observability | Conflicts with silent degrade | Health only checkable via a script |
| UI tests | Data and model layers have checks; components verified by screenshot | Rendering regressions would not be caught automatically |
| Accessibility audit | No time | Unknown; tone changes are not colour-only, which helps |
| Per-store category baselines with shrinkage | Network-wide baseline is good enough at this volume | Would matter at real catalogue scale |

---

## What I would build next, in order

1. **Confidence intervals, not just a threshold.** The current rule is a hard
   cut at 30 households. 30 is defensible but arbitrary. A Wilson interval on
   the return rate would let the card say "somewhere between 3% and 7%" and
   would make the widening decision statistically rather than conventionally
   motivated.

2. **Real review ingestion with injection handling.** Review text goes straight
   into the prompt. Safe here because the 79-string bank is synthetic; not safe
   the moment a real customer can type into it.

3. **Complaint clustering before the model call.** Right now 24 raw strings go
   in and the model finds the theme. Clustering them in code first — then asking
   the model only to phrase the largest cluster — would make "the recurring
   complaint" a computed fact rather than a model judgement, moving one more
   thing across the boundary into code.

4. **Measure whether it works.** The entire premise is that local complaint-
   inclusive proof drives category crossover. Nothing in this build tests that.
   The first real experiment is proof card versus star rating on cross-category
   conversion, with return rate as a guardrail — you would want to know the card
   is not just suppressing purchases of products that are actually fine.

5. **Cache with a TTL, shared across instances.** The in-memory `Map` is
   per-serverless-instance and unbounded. Fine at 750 combinations, not at
   catalogue scale.

**The honest gap in the whole project:** it demonstrates that the mechanism can
be built truthfully. It does not demonstrate that shoppers behave differently
when they see it. That is the next thing worth budget, and it is worth saying
before someone in the room says it for you.
