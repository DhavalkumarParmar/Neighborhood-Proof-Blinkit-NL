/**
 * The proof card. Sits directly under the price and is the biggest block on
 * the page, because it is the thing that gives someone conviction to buy from
 * a category they have never bought from before.
 *
 * Everything numeric here arrives already computed in `facts`. This component
 * does no arithmetic beyond choosing a tone, and the model never touches a
 * figure - only the one sentence rendered by <ComplaintLine />.
 */

import type { Facts } from "@/lib/proof-core";
import {
  boughtHeadline,
  provenanceLine,
  returnsLine,
  widenedNotice,
  NO_DATA_HEADLINE,
  NO_DATA_LINE,
  NO_DATA_SUB,
} from "@/lib/copy";
import { ComplaintLine } from "./ComplaintLine";
import { ShieldIcon } from "./icons";

export function ProofCard({ facts }: { facts: Facts }) {
  if (facts.noData) {
    return (
      <section className="proof" data-tone="muted" data-state="no-data">
        <div className="proof-label">
          <span className="dot" />
          Neighbourhood proof
        </div>
        <p className="proof-nodata-line">
          {NO_DATA_HEADLINE} {NO_DATA_LINE}
        </p>
        <p className="proof-nodata-sub">{NO_DATA_SUB}</p>
        <p className="proof-provenance">
          <ShieldIcon />
          From your {facts.storeName} store.
        </p>
      </section>
    );
  }

  const { count, where } = boughtHeadline(facts);
  const notice = widenedNotice(facts);
  const tone = facts.verdict === "high" ? "warn" : "good";

  return (
    <section
      className="proof"
      data-tone={tone}
      data-state={facts.widened ? "widened" : facts.verdict === "high" ? "negative" : "normal"}
    >
      <div className="proof-label">
        <span className="dot" />
        Neighbourhood proof
      </div>

      {notice && <p className="proof-widened">{notice}</p>}

      <p className="proof-headline">
        {count} {where}
        <span className="sub">bought this last month</span>
      </p>

      <p className="proof-returns">{returnsLine(facts)}</p>

      <ComplaintLine sku={facts.skuId} store={facts.storeId} />

      <p className="proof-provenance">
        <ShieldIcon />
        {provenanceLine(facts)}
      </p>
    </section>
  );
}
