"use client";

/**
 * Screen 2 - the browse listing.
 *
 * Receives items with their proof line already computed on the server. The
 * ledger is several megabytes and never crosses to the browser; only the
 * finished one-line summary per card does.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { Thumb } from "./Thumb";
import { CartIcon, ChevronDown, SearchIcon } from "./icons";

export type BrowseItem = {
  id: string;
  brand: string;
  name: string;
  title: string;
  category: string;
  unit: string;
  price: number;
  mrp: number;
  discountPercent: number;
  proofLine: string;
  hasProof: boolean;
};

const TAB_LABEL: Record<string, string> = {
  all: "All",
  beauty: "Beauty",
  pet: "Pet care",
  baby: "Baby care",
  home: "Home",
  electronics: "Electronics",
};

export function BrowseClient({
  items,
  categories,
  profileId,
  storeArea,
  eta,
}: {
  items: BrowseItem[];
  categories: string[];
  profileId: string;
  storeArea: string;
  eta: number;
}) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (tab !== "all" && item.category !== tab) return false;
      if (!q) return true;
      return item.title.toLowerCase().includes(q) || item.category.includes(q);
    });
  }, [items, query, tab]);

  return (
    <>
      <div className="header">
        <div className="header-top">
          <div>
            <div className="eta-label">Delivery in</div>
            <div className="eta">{eta} minutes</div>
            <div className="address">
              <strong>Home</strong> &ndash; {storeArea}
              <ChevronDown />
            </div>
          </div>
          <Link href={`/cart?p=${profileId}`} className="avatar" aria-label="Cart">
            <CartIcon size={18} />
          </Link>
        </div>

        <div className="searchbar">
          <SearchIcon />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search "face serum"'
            aria-label="Search products"
          />
        </div>
      </div>

      <div className="tabs">
        {["all", ...categories].map((key) => (
          <button
            key={key}
            className="tab"
            data-active={tab === key}
            onClick={() => setTab(key)}
          >
            {TAB_LABEL[key] ?? key}
          </button>
        ))}
      </div>

      <h2 className="section-title">
        {tab === "all" ? "Beyond your usual list" : TAB_LABEL[tab]}
        <span style={{ color: "var(--ink-3)", fontWeight: 500, fontSize: 12 }}>
          {"  "}
          {shown.length} items
        </span>
      </h2>

      {shown.length === 0 ? (
        <div className="empty">
          <h2>Nothing matched</h2>
          <p>Try a shorter word, like &quot;serum&quot; or &quot;diaper&quot;.</p>
        </div>
      ) : (
        <div className="grid">
          {shown.map((item) => (
            <Link key={item.id} href={`/p/${item.id}?p=${profileId}`} className="card">
              <Thumb brand={item.brand} name={item.name} category={item.category} />
              <div className="card-title">{item.title}</div>
              <div className="card-unit">{item.unit}</div>
              <div className="card-proof" data-muted={!item.hasProof}>
                {item.proofLine}
              </div>
              <div className="card-foot">
                <div className="card-price">
                  <span className="price">&#8377;{item.price}</span>
                  <span className="mrp">&#8377;{item.mrp}</span>
                </div>
                <span className="addbtn">ADD</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
