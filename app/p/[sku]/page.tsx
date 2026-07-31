/**
 * Screen 3 - product page.
 *
 * The proof card sits directly under the price, before anything else, and is
 * the largest block on the page. That placement is the whole product idea: the
 * moment of hesitation is right after someone reads the price.
 */

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProofCard } from "@/components/ProofCard";
import { Thumb } from "@/components/Thumb";
import { BackIcon, CartIcon, SearchIcon } from "@/components/icons";
import { getItem, getProfile, getProof, getStore } from "@/lib/retrieval";

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

  return (
    <>
      <div className="topbar">
        <Link href={`/browse?p=${profile.id}`} className="iconbtn" aria-label="Back">
          <BackIcon />
        </Link>
        <div className="topbar-title">{item.categoryLabel}</div>
        <span className="iconbtn">
          <SearchIcon size={19} />
        </span>
        <Link href={`/cart?p=${profile.id}`} className="iconbtn" aria-label="Cart">
          <CartIcon />
        </Link>
      </div>

      <Thumb brand={item.brand} name={item.name} category={item.category} variant="pdp" />

      <div className="pdp-body">
        <p className="pdp-cat">{item.categoryLabel}</p>
        <h1 className="pdp-title">{item.title}</h1>
        <p className="pdp-unit">{item.unit}</p>

        <div className="pdp-price">
          <span className="now">&#8377;{item.price}</span>
          <span className="was">&#8377;{item.mrp}</span>
          <span className="off">{item.discountPercent}% OFF</span>
        </div>
      </div>

      {/* Directly under the price, ahead of everything else on the page. */}
      <ProofCard facts={facts} />

      <div className="pdp-section">
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
          <div className="l1">&#8377;{item.price}</div>
          <div className="l2">{item.unit}</div>
        </div>
        <Link href={`/cart?p=${profile.id}`} className="cta">
          Add to cart
        </Link>
      </div>
    </>
  );
}
