/**
 * Screen 4 - cart. Deliberately a stub; checkout is out of scope for the
 * concept and pretending otherwise would only invite questions about it.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { BackIcon, CartIcon } from "@/components/icons";
import { getProfile } from "@/lib/retrieval";

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const { p } = await searchParams;
  const profile = getProfile(p ?? "");
  if (!profile) redirect("/");

  return (
    <>
      <div className="topbar">
        <Link href={`/browse?p=${profile.id}`} className="roundbtn" aria-label="Back">
          <BackIcon />
        </Link>
        <div className="topbar-title">
          <b>Your cart</b>
          <span>Delivering to Home</span>
        </div>
      </div>

      <div className="empty">
        <div className="empty-icon">
          <CartIcon size={24} />
        </div>
        <h2>Cart is empty</h2>
        <p>
          Checkout is not part of this demo. The concept being shown is the proof card on the
          product page.
        </p>
        <Link href={`/browse?p=${profile.id}`} className="cta" data-block="true">
          Back to browsing
        </Link>
      </div>

      <BottomNav profileId={profile.id} active="cart" />
    </>
  );
}
