/**
 * Screen 1 - profile picker.
 *
 * Demo chrome rather than an app screen: the whole point of the concept is
 * that proof is local, so which shopper you are (and therefore which dark
 * store serves you) decides what the proof card can say.
 *
 * The four display states are linked directly from here so a reviewer can see
 * all of them without hunting through 150 SKUs.
 */

import Link from "next/link";
import { getStore, profiles } from "@/lib/retrieval";
import pointers from "@/data/demo-pointers.json";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

const DEMO_STATES = [
  {
    label: "Normal",
    note: "212 homes, 9 sent back",
    href: `/p/${pointers.normal.skuId}?p=regular`,
  },
  {
    label: "Widened to city",
    note: "too few nearby, shows Vadodara",
    href: `/p/${pointers["widened-to-city"].skuId}?p=regular`,
  },
  {
    label: "Honest negative",
    note: "11 of 38 sent back",
    href: `/p/${pointers["honest-negative"].skuId}?p=regular`,
  },
  {
    label: "No data",
    note: "new pincode, nothing to show",
    href: `/p/${pointers.normal.skuId}?p=bachelor`,
  },
];

export default function ProfilePicker() {
  return (
    <div className="picker">
      <p className="picker-kicker">Neighbourhood proof</p>
      <h1>What did homes near you actually do with this?</h1>
      <p className="lede">
        Instead of star ratings, every product page shows how many households near your dark
        store bought it, how many sent it back, and what people kept complaining about.
        Pick a shopper to start.
      </p>

      {profiles.map((profile) => {
        const store = getStore(profile.storeId);
        return (
          <Link key={profile.id} href={`/browse?p=${profile.id}`} className="profile">
            <span className="profile-face">{initials(profile.name)}</span>
            <span className="profile-text">
              <span className="profile-name">{profile.name}</span>
              <span className="profile-label">{profile.label}</span>
              <span className="profile-blurb">{profile.blurb}</span>
              <span className="profile-store">
                {store?.area} &middot; {store?.pincode}
              </span>
            </span>
          </Link>
        );
      })}

      <div className="states">
        <h2>Jump straight to a state</h2>
        <p>The proof card has four states. Each of these links goes to one of them.</p>
        {DEMO_STATES.map((state) => (
          <Link key={state.label} href={state.href} className="state-link">
            <b>{state.label}</b>
            <span>{state.note}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
