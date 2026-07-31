"use client";

/**
 * Screen 2 - the browse listing.
 *
 * Card layout follows the app: image box with the unit label and ADD button
 * inside it, price above the title, offer as plain blue text. The proof line
 * sits where the star rating sits in the real app, which is the swap the whole
 * concept rests on.
 *
 * Items arrive with their proof line already computed on the server. The ledger
 * is several megabytes and never crosses to the browser.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { Thumb } from "./Thumb";
import { BottomNav } from "./BottomNav";
import {
  AllIcon,
  BeautyIcon,
  BottleIcon,
  CartIcon,
  ChevronDown,
  ClockIcon,
  HeadphoneIcon,
  HeartIcon,
  MicIcon,
  PawIcon,
  PersonIcon,
  SearchIcon,
  SprayIcon,
  WalletIcon,
} from "./icons";

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
  image: string | null;
};

const TAB_LABEL: Record<string, string> = {
  all: "All",
  beauty: "Beauty",
  pet: "Pet Care",
  baby: "Baby Care",
  home: "Home",
  electronics: "Electronics",
};

const TAB_ICON: Record<string, React.ReactNode> = {
  all: <AllIcon />,
  beauty: <BeautyIcon />,
  pet: <PawIcon />,
  baby: <BottleIcon />,
  home: <SprayIcon />,
  electronics: <HeadphoneIcon />,
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
            <div className="eta-label">Blinkit in</div>
            <div className="eta-row">
              <span className="eta">{eta} minutes</span>
              <span className="eta-badge">
                <ClockIcon size={11} />
                24/7
              </span>
            </div>
            <div className="address">
              <b>Home</b> &ndash; {storeArea}
              <ChevronDown />
            </div>
          </div>

          <div className="header-actions">
            <span className="wallet">
              <WalletIcon />
              <span>&#8377;0</span>
            </span>
            <Link href="/" className="avatar" aria-label="Switch shopper">
              <PersonIcon />
            </Link>
          </div>
        </div>

        <div className="searchbar">
          <SearchIcon size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search "face serum"'
            aria-label="Search products"
          />
          <span className="divider" />
          <span className="mic">
            <MicIcon />
          </span>
        </div>

        <div className="rail">
          {["all", ...categories].map((key) => (
            <button
              key={key}
              className="rail-item"
              data-active={tab === key}
              onClick={() => setTab(key)}
            >
              {TAB_ICON[key]}
              <span>{TAB_LABEL[key] ?? key}</span>
            </button>
          ))}
        </div>
      </div>

      <h2 className="section-title">
        {tab === "all" ? "Beyond your usual list" : TAB_LABEL[tab]}{" "}
        <span>{shown.length} items</span>
      </h2>

      {shown.length === 0 ? (
        <div className="empty">
          <h2>Nothing matched</h2>
          <p>Try a shorter word, like &quot;serum&quot; or &quot;diaper&quot;.</p>
        </div>
      ) : (
        <div className="grid">
          {shown.map((item) => (
            <Link key={item.id} href={`/p/${item.id}?p=${profileId}`} className="pcard">
              <div className="pcard-media">
                <span className="pcard-fav">
                  <HeartIcon />
                </span>
                <Thumb
                  brand={item.brand}
                  name={item.name}
                  category={item.category}
                  image={item.image}
                />
                <div className="pcard-dots">
                  <i data-on="true" />
                  <i />
                  <i />
                  <i />
                </div>
                <div className="pcard-mediafoot">
                  <span className="pcard-unit">{item.unit}</span>
                  <span className="addbtn">ADD</span>
                </div>
              </div>

              <div className="pcard-price">
                <b>&#8377;{item.price}</b>
                <s>&#8377;{item.mrp}</s>
              </div>
              <div className="off-text">&#8377;{item.mrp - item.price} OFF</div>

              <div className="pcard-title">{item.title}</div>

              <div className="pcard-proof" data-muted={!item.hasProof}>
                {item.proofLine}
              </div>

              <div className="pcard-meta">
                <ClockIcon />
                {eta} mins
              </div>
            </Link>
          ))}
        </div>
      )}

      <BottomNav profileId={profileId} active="home" />
    </>
  );
}
