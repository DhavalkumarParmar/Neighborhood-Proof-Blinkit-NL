# Failure modes

Every row was checked against the code. The "how the code handles it" column
cites the file. **Likelihood is my engineering judgement, not measured** — there
is no telemetry in this build, so treat those cells as opinion and the rest as
fact.

## Handled

| Failure mode | Likelihood | Impact if unhandled | How the code handles it | What the user sees |
|---|---|---|---|---|
| **LLM timeout** | Medium | Product page hangs up to the network timeout | `AbortSignal.timeout(8000)` on the fetch, wrapped in try/catch → returns `null` (`summarise.ts:240,263`) | Numbers alone. No spinner, no error. Measured latency is 1.4–1.8 s, so 8 s is ~4× headroom |
| **LLM HTTP error** (4xx/5xx) | Medium | Error surface or crash | `if (!response.ok) return null` (`summarise.ts:243`) | Numbers alone |
| **No API key set** | High on a fresh deploy | Every product page errors | Checked before any call: `if (!apiKey ... ) return null` (`summarise.ts:257`) | Numbers alone. The app is fully usable without a key |
| **Malformed / non-JSON model response** | Low | Parse crash | `extractText()` tries `output_text`, then walks `steps[].content[]`, returns `""` if neither exists | Numbers alone |
| **Model returns only thoughts / blocked output** | Low | Empty sentence rendered | Empty text short-circuits before `sanitise()` | Numbers alone |
| **Model invents a figure** | Medium — this happened in testing | A fabricated statistic on a card whose whole premise is honesty | Prompt bans digits, **and** `sanitise()` drops any sentence containing one (`summarise.ts:73`). Belt and braces — the prompt alone was not trusted | Either a clean sentence, or none |
| **All sentences dropped by the guard** | Low | Blank region under the rule | `sanitise()` returns `null` when nothing survives | Numbers alone |
| **Small sample at store level** | High by design — 121 of 750 combos | A confident claim from 6 households | Widen to city when < 30 (`proof-core.ts:201`) | "Too few orders near you. Showing all of Vadodara instead." |
| **Small sample city-wide too** | High at thin stores — 144 of 750 | Same, worse | `noData: true` (`proof-core.ts:209`) | "New here. No orders yet to show you." |
| **Client-side fetch failure** | Low | Skeleton spins forever | `.catch()` sets state to done/null; a `cancelled` flag prevents setState after unmount (`ComplaintLine.tsx:30`) | Skeleton disappears, numbers remain |
| **Empty search / filter result** | Medium | Blank grid | `shown.length === 0` branch (`BrowseClient.tsx:158`) | "Nothing matched — try a shorter word, like 'serum' or 'diaper'" |
| **Unknown SKU in URL** | Low | Crash | `notFound()` (`p/[sku]/page.tsx:44`) | Next.js 404 page |
| **Missing / invalid `?p=` profile** | Medium — easy to hand-edit | Crash or blank | `redirect("/")` on all three pages | Bounced to the profile picker |
| **Missing product image** | High — 109 of 150 SKUs | Broken image icons | Manifest lookup returns `null`; component renders a tinted tile instead (`Thumb.tsx`) | A coloured tile with the brand monogram. Same footprint, so the grid stays even |
| **Client tampering with numbers** | Low | Fabricated proof via a crafted request | `/api/summary` recomputes facts server-side from SKU + store and accepts no numbers from the browser (`api/summary/route.ts`) | No effect — the request is ignored |
| **Repeat model calls for the same card** | High | Cost and latency on every view | In-memory `Map` keyed `sku\|store\|scope` (`summarise.ts:250`) | Instant on second view |

## Known gaps — not handled

I would rather name these than have them found.

| Gap | Likelihood | Impact | Why it is not handled | What would actually happen |
|---|---|---|---|---|
| **Rate limiting (HTTP 429)** | Medium under demo load | Sentences vanish for a burst of viewers | No retry, no backoff, no 429-specific path anywhere in the codebase — a 429 is just `!response.ok` | Cards silently lose their sentence and quietly recover. Degrades gracefully but invisibly, so you would not know it was happening |
| **No observability** | Certain | Cannot tell "working" from "quietly broken" | Deliberate: silent degrade means a dead key looks identical to a healthy one. `diagnose()` (`summarise.ts:121`) exists but is only wired to the check script | You must run `GEMINI_API_KEY=... npm run check:summary` to know the model layer is alive |
| **Cache is per-instance and unbounded** | Medium | Cold starts re-pay latency; memory grows with unique cards | A `Map` in module scope. No TTL, no eviction, not shared across serverless instances | Fine at 150 SKUs × 5 stores. Would need a real cache at catalogue scale |
| **No cost ceiling** | Low at demo scale | Unbounded spend if traffic spiked | No request budget or circuit breaker | A scripted crawl of all 750 combinations would make 750 model calls |
| **Prompt injection via review text** | Low here, **high in production** | Review text goes straight into the prompt. A real user-submitted review could carry instructions | Reviews are synthetic and from a fixed 79-string bank, so it cannot happen in this build. There is no input sanitisation | Not exploitable in the demo. Would need handling before real reviews |
| **`getProof` is O(records) per call** | Low | Slow listing pages | Indexed by `sku\|store` at module load, so it is fast — but the browse page still calls it 150 times per request | Fine at this size; unmeasured above it |
| **Accessibility not audited** | Certain | Unknown | No audit run. Icons have `aria-label`s and the tone changes are not colour-only (text says "That's high"), but contrast ratios and screen-reader flow were never checked | Unknown |
| **No tests on the UI layer** | Certain | Regressions in rendering | `check:retrieval` and `check:summary` cover the data and model layers. The React components have no tests | Verified by screenshot only |

## The one worth a slide

**"Model invents a figure" is the only failure mode that would destroy the
product's credibility rather than just degrade it.** It is the only one with two
independent defences: a prompt rule and a code-enforced guard. Everything else
fails to *less* information; that one would fail to *wrong* information.
