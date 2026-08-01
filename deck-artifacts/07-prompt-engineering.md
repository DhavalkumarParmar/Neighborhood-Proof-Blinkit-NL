# Prompt engineering decisions

Source: `lib/summarise.ts`. Model `gemini-3.6-flash`, endpoint
`POST /v1beta/interactions`, `temperature 0.3`, `max_output_tokens 400`,
`thinking_level "minimal"`, 8 s timeout.

---

## The system prompt, verbatim

```
You write one short honest summary of what people near a shopper said about a
product they bought from a quick-commerce app in India.

Your only job is to name the recurring theme in the reviews. You are given
counts for context so your wording does not contradict them, but the app
already prints every number on the screen directly above your sentence.

Rules you must follow:
- Never write a digit. Never restate a count, a rate or a percentage. The
  screen already shows them, and repeating them reads as clutter.
- If you need to describe a quantity, use a word: "most", "a few", "several",
  "after a few weeks".
- Never invent or estimate a figure of any kind.
- If the reviews contain a recurring negative, you must name it. A summary that
  is only positive when negatives exist is a failure.
- If most reviews are happy and there is no repeated problem, say briefly what
  people liked instead.
- Separate the product from its packaging or delivery when the reviews do. If
  the thing inside is fine and the bottle or box is the problem, say so.
- Simple everyday English for Indian readers. Short sentences. No jargon. No
  marketing language. No exclamation marks.
- One or two sentences. Maximum 40 words. Plain text only, no bullet points,
  no bold, no quotes.

Good examples of tone:
Main issue people had: the pump stops working after a few weeks. The serum
itself is fine.
Most who sent it back said it came leaking.
People mostly said the smell is too strong for a closed room.
No repeated complaint. People said it cleans well and lasts a while.
```

## What gets sent as input

```
Product category: Beauty & Personal Care
Homes that bought it: 212
Homes that sent it back: 9
Return rate: 4.2%
Average return rate for Beauty & Personal Care: 6.4%
How this product compares to its category: low

Reviews from those orders:
- Okay for the price.
- Product is good but the pump stopped working in 3 weeks.
...
```

The counts are **read-only context**. They are there so the model does not write
"most people sent it back" when nine did. It is never asked to output them.

---

## Why each constraint exists

### "Never write a digit"

The strongest rule, and the one that changed during testing (see below). The
card prints every figure itself in 26px type directly above the sentence, so a
number in the sentence is at best redundant and at worst wrong. Banning digits
outright makes the guard trivially checkable: one regex, no ambiguity about
which figures were "allowed".

This also cleanly satisfies the "never state a percentage without a
plain-language read beside it" requirement — the model states no percentages at
all, and every read that appears beside a number is generated in `lib/copy.ts`
where it cannot drift from the arithmetic.

### "If the reviews contain a recurring negative, you must name it"

Without this, the model does what summarisers do by default: writes the pleasant
average. On the hero serum — 9 returns from 212, a genuinely good product — the
easy summary is "people liked it". But 11 of 24 retrieved reviews mention the
pump failing. Burying that makes the card marketing, and the entire premise is
that this is *not* marketing.

This is why the retrieval layer puts reviews from people who returned the
product **first** in the list before trimming to 24 (`proof-core.ts:118`) — the
prompt rule cannot fire if the complaint never reaches the model.

### "Separate the product from its packaging or delivery"

Because the most useful thing the demo says is a distinction, not a verdict:
*"The serum itself works well, but the pump dispenser breaks."* That tells a
shopper they can buy it and decant it. A flat "mixed reviews" would not.

### "Simple everyday English for Indian readers"

Target user is a grocery shopper being asked to cross into a category they have
never bought from. Jargon reads as marketing, and marketing is what the card is
positioned against. Short sentences also keep it under the two-line space the
card allocates.

### "Maximum 40 words, one or two sentences"

The card has a fixed slot. `sanitise()` enforces the sentence cap in code
independently by slicing to the first two sentences, so a rambling reply is
truncated rather than breaking the layout.

---

## Real before/after from testing

This is not hypothetical — it happened on the first live call against the API.

**Before.** The guard originally allowed figures we had supplied to the model,
and dropped only unrecognised ones. The allowed set included the return rate
rounded to a whole number. For the hero serum that value is `4`:

> "People liked the serum, but many complained that the pump dispenser stopped
> working after a few weeks. **The return rate was 4.**"

That passed the guard — `4` was technically a number we had provided. It is also
meaningless: 4 what? It is exactly the naked, unqualified figure the product
exists to avoid.

**The change.** Ban digits entirely; drop any sentence containing one.

```js
// lib/summarise.ts
const kept = sentences.filter((sentence) => !/\d/.test(sentence));
```

**After**, same SKU, same data, live call:

> "The product itself works well, but many buyers complained that the pump
> dispenser breaks or stops working quickly."

**The lesson for the slide:** prompt instructions are a preference, not a
guarantee. The rule only became reliable when it was enforced in code. A model
told "don't invent numbers" will still emit a supplied number in a nonsensical
context — the fix was to remove the entire category of output rather than police
it case by case.

---

## Live outputs across all three states

Captured from the deployed code path, not written by hand:

| State | Data | Model output |
|---|---|---|
| Normal | 212 homes, 9 returns (4.2% vs 6.4% baseline) | "The product itself works well, but many buyers complained that the pump dispenser breaks or stops working quickly." |
| Negative | 38 homes, 11 returns (28.9% vs 6.4%) | "While users found the product good for their skin, many reported that it arrived leaking and spilled inside the packaging." |
| Widened | 41 homes across Vadodara, 4 returns | "Most buyers liked the sturdy build and easy cleaning for daily use. A few mentioned poor quality that did not match the photo." |

The first row is the one to show. **A 4.2% return rate is good** — the model
still named the pump complaint, because the prompt makes an only-positive
summary a failure. That is the behaviour that distinguishes this from a review
summariser.
