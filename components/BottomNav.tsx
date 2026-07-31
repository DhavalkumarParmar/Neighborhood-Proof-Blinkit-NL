import Link from "next/link";
import { BagIcon, CartIcon, CategoriesIcon, HomeIcon } from "./icons";

/**
 * The app's four-tab bottom bar. Not shown on the product page, which puts the
 * add-to-cart bar in the same place, same as the real app.
 */
export function BottomNav({
  profileId,
  active,
}: {
  profileId: string;
  active: "home" | "orders" | "categories" | "cart";
}) {
  const items = [
    { key: "home", label: "Home", href: `/browse?p=${profileId}`, icon: <HomeIcon /> },
    { key: "orders", label: "Order Again", href: `/cart?p=${profileId}`, icon: <BagIcon /> },
    {
      key: "categories",
      label: "Categories",
      href: `/browse?p=${profileId}`,
      icon: <CategoriesIcon />,
    },
    { key: "cart", label: "Cart", href: `/cart?p=${profileId}`, icon: <CartIcon size={22} /> },
  ] as const;

  return (
    <nav className="bottomnav">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className="bottomnav-item"
          data-active={active === item.key}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
