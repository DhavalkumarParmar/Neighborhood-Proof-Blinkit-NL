/** Small inline icons so the app never waits on a network request for chrome. */

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.6-3.6" />
    </svg>
  );
}

export function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export function ChevronDown() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function CartIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M3 5h2.2l2.3 10.5h10.2L20 8H6" />
      <circle cx="9.5" cy="19" r="1.4" />
      <circle cx="17" cy="19" r="1.4" />
    </svg>
  );
}

export function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M4 10.5L12 4l8 6.5V20H4z" />
    </svg>
  );
}

export function ShieldIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6z" />
      <path d="M9 12.2l2.2 2.2L15.2 10" />
    </svg>
  );
}
