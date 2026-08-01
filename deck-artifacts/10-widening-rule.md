# The small-n widening rule

Stated so an engineer could implement it from this page alone.

Source: `lib/proof-core.ts`, function `getProof()`, lines 180–232.

---

## The rule

```
CONSTANTS
  MIN_HOUSEHOLDS = 30      // lib/proof-core.ts:16
  WINDOW_DAYS    = 30      // lib/proof-core.ts:17
  MAX_REVIEWS    = 24      // lib/proof-core.ts:18

INPUT   skuId, storeId
OUTPUT  a facts object, or noData

1. Take every ledger row where row.sku == skuId
                          AND row.store == storeId
                          AND row.daysAgo < WINDOW_DAYS

2. households := count of DISTINCT row.household in that set

3. IF households >= MIN_HOUSEHOLDS:
       scope      := "store"
       scopeLabel := store.name          // e.g. "Alkapuri"
       widened    := false
       GOTO 6

4. OTHERWISE widen. Take every row where row.sku == skuId
                                     AND row.store IS IN (all stores in store.city)
                                     AND row.daysAgo < WINDOW_DAYS
   Recount households over that wider set.

5. IF households >= MIN_HOUSEHOLDS:
       scope      := "city"
       scopeLabel := store.city          // e.g. "Vadodara"
       widened    := true
   ELSE:
       RETURN { noData: true }           // stop here, show nothing

6. From the chosen row set, compute:
       returns    := rows where returned == true
       returnRate := returns / households
       baseline   := category return rate, computed network-wide
                     (all stores, all rows in that category)
       verdict    := "low"    if returnRate / baseline <  0.75
                     "high"   if returnRate / baseline >  1.4
                     "normal" otherwise
       reviews    := review strings from the chosen rows,
                     ordered returners-first, capped at MAX_REVIEWS
```

## Three properties worth stating

**Widening is all-or-nothing.** When the store falls short, every figure is
recomputed over the city set — households, returns, rate and reviews together.
There is no mixing of a store-level count with a city-level rate.

**The threshold is never crossed downward.** A card is either showing ≥ 30
households or showing nothing. The verified invariant in
`scripts/check-retrieval.mjs` asserts this across all 750 combinations.

**One store in a city means widening cannot help.** The city set is identical to
the store set, so the recount returns the same number and falls through to
`noData`. That is exactly what happens at Karjat — 144 of 150 SKUs, and 0
widened, because widening has nothing to widen into.

**The category baseline is always network-wide**, regardless of scope. A single
store does not have the volume to make a per-category return rate stable, so
"that's low for beauty" compares against all 12,382 beauty rows across all five
stores rather than the local slice.

---

## Real example that triggers it

**PET-0010 · Bhaukaal Pet Co Cat Scratching Post · ₹939**
Viewed from Alkapuri: `/p/PET-0010?p=regular`

### Step 1 — store level fails

| | |
|---|---|
| Rows at ST-ALK in the last 30 days | **14** |
| Distinct households | **14** |
| 14 ≥ 30? | **No** → widen |

### Step 2 — widen to Vadodara

Vadodara contains two stores: ST-ALK (Alkapuri) and ST-GTR (Gotri).

| | Rows | Returns |
|---|---|---|
| ST-ALK | 14 | 1 |
| ST-GTR | 27 | 3 |
| **Vadodara total** | **41** | **4** |

41 ≥ 30 → **`widened: true`**, `scope: "city"`, `scopeLabel: "Vadodara"`

### Step 3 — recompute over the wider set

| Field | Value |
|---|---|
| households | 41 |
| returns | 4 |
| returnRate | 9.76% |
| categoryReturnRate (pet, network-wide) | 7.32% |
| ratio | 1.334 |
| verdict | **normal** (1.334 ≤ 1.4) |
| reviews retrieved | 7 |

Note the ratio: 1.334 sits just under the 1.4 "high" boundary, so this reads as
"about normal for pet care" rather than a warning. The thresholds are doing real
work here — a slightly worse product would have flipped the card to amber.

### Step 4 — what renders

```
Too few orders near you. Showing all of Vadodara instead.

41 homes in Vadodara
bought this last month

4 sent it back. That's about normal for pet care.

Most buyers liked the sturdy build and easy cleaning for daily
use. A few mentioned poor quality that did not match the photo.

⛨ From real orders across Vadodara, last 30 days.
```

The provenance line changes too — "across Vadodara" instead of "at your Alkapuri
store". The card never claims local evidence it does not have.

---

## How often each branch fires

Across all 750 SKU-store combinations:

| Branch | Count | Share |
|---|---|---|
| Store level held (≥ 30 locally) | 485 | 64.7% |
| Widened to city | 121 | 16.1% |
| No data | 144 | 19.2% |

Concentrated by store density:

| Store | Density | Widened | No data |
|---|---|---|---|
| Alkapuri | high | 10 | **0** |
| Sector 62 | high | 14 | **0** |
| Sector 128 | medium | 47 | 0 |
| Gotri | low | **50** | 0 |
| Karjat | very low | 0 | **144** |

**The dense stores never hit "no data" once.** The thin store hits it for 96% of
the catalogue. The widening rule is what converts store density into a claim you
are allowed to make — which is the moat argument, expressed as a threshold.
