/**
 * Screen 3 - product page.
 *
 * Follows the app's structure: full-bleed hero with floating circular buttons,
 * carousel dots, then content in white cards on a grey page, then the sticky
 * add-to-cart bar.
 *
 * Two deliberate departures from the real screen. The star rating and review
 * count are gone, and the proof card takes their place directly under the
 * price - the moment of hesitation is right after someone reads the price, and
 * this card is the largest block on the page because it is what resolves it.
 */

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProofCard } from "@/components/ProofCard";
import { Thumb } from "@/components/Thumb";
import {
  BackIcon,
  ClockIcon,
  HeartIcon,
  SearchIcon,
  ShareIcon,
  ShieldIcon,
  TagIcon,
} from "@/components/icons";
import { imageFor } from "@/lib/images";
import { etaMinutes, getItem, getProfile, getProof, getStore } from "@/lib/retrieval";

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ sku: string }>;
  searchParams: Promise<{ p?: string }>;
}) {
  const { sku } = await params;
  const { p } = await searchParams;

  const profile = getProfile(p ?? "");
  if (!profile) redirect("/");

  const item = getItem(sku);
  if (!item) notFound();

  const store = getStore(profile.storeId);
  if (!store) redirect("/");

  const facts = getProof(item.id, profile.storeId);
  const eta = etaMinutes(store);

  return (
    <>
      <div style={{ position: "relative" }}>
        <div className="pdp-float">
          <Link href={`/browse?p=${profile.id}`} className="roundbtn" data-float="true" aria-label="Back">
            <BackIcon />
          </Link>
          <span className="spacer" />
          <span className="roundbtn" data-float="true">
            <HeartIcon size={18} />
          </span>
          <span className="roundbtn" data-float="true">
            <SearchIcon size={18} />
          </span>
          <span className="roundbtn" data-float="true">
            <ShareIcon />
          </span>
        </div>
        <Thumb
          brand={item.brand}
          name={item.name}
          category={item.category}
          image={imageFor(item.id)}
          variant="pdp"
        />
      </div>

      <div className="dots">
        <i data-on="true" />
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className="card">
        <div className="pdp-meta">
          <span className="chip">
            <ClockIcon />
            {eta} mins
          </span>
          <span className="sep" />
          <span className="chip">{item.categoryLabel}</span>
        </div>

        <h1 className="pdp-title">{item.title}</h1>

        <div className="pdp-meta">
          <span className="chip" style={{ fontWeight: 700, color: "var(--ink)" }}>
            {item.unit}
          </span>
          <span className="sep" />
          <span className="chip">
            <TagIcon />
            Sold at your {store.name} store
          </span>
        </div>

        <div className="pdp-price">
          <span className="now">&#8377;{item.price}</span>
          <span className="was">MRP &#8377;{item.mrp}</span>
        </div>
        <div className="off-text" style={{ marginTop: 4 }}>
          &#8377;{item.mrp - item.price} OFF
        </div>
      </div>

      {/* Where the star rating would be, only much bigger. */}
      <ProofCard facts={facts} />

      <div className="card why">
        <div className="why-item">
          <div>
            <ClockIcon size={20} />
          </div>
          Superfast
          <br />
          delivery
        </div>
        <div className="why-item">
          <div>
            <TagIcon size={20} />
          </div>
          Best prices
          <br />
          and offers
        </div>
        <div className="why-item">
          <div>
            <ShieldIcon size={20} />
          </div>
          Easy
          <br />
          returns
        </div>
      </div>

      <div className="card">
        <h3>Product details</h3>
        <dl style={{ margin: 0 }}>
          <div className="detail-row">
            <dt>Brand</dt>
            <dd>{item.brand}</dd>
          </div>
          <div className="detail-row">
            <dt>Unit</dt>
            <dd>{item.unit}</dd>
          </div>
          <div className="detail-row">
            <dt>Category</dt>
            <dd>{item.categoryLabel}</dd>
          </div>
          <div className="detail-row">
            <dt>Sold from</dt>
            <dd>
              {store.name} store, {store.city}
            </dd>
          </div>
          <div className="detail-row">
            <dt>Returns</dt>
            <dd>Easy return within 7 days of delivery</dd>
          </div>
        </dl>
      </div>

      <div className="bottombar">
        <div className="meta">
          <div className="l0">{item.unit}</div>
          <div className="l1">
            &#8377;{item.price}
            <s>MRP &#8377;{item.mrp}</s>
          </div>
          <div className="l2">Inclusive of all taxes</div>
        </div>
        <Link href={`/cart?p=${profile.id}`} className="cta">
          Add to cart
        </Link>
      </div>
    </>
  );
}
