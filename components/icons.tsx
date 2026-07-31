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

export function MicIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0013 0M12 18v3" />
    </svg>
  );
}

export function BackIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export function ChevronDown({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function ChevronRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M9 5l7 7-7 7" />
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

export function HomeIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M4 10.5L12 4l8 6.5V20H4z" />
    </svg>
  );
}

export function BagIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M5 8h14l-1 12H6z" />
      <path d="M9 8V6.5a3 3 0 016 0V8" />
    </svg>
  );
}

/** The four-dot Categories glyph from the tab bar. */
export function CategoriesIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="8.5" cy="8.5" r="3.4" />
      <circle cx="15.5" cy="8.5" r="3.4" />
      <circle cx="8.5" cy="15.5" r="3.4" />
      <circle cx="15.5" cy="15.5" r="3.4" />
    </svg>
  );
}

export function PrintIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M7 9V4h10v5" />
      <rect x="4" y="9" width="16" height="7" rx="1.6" />
      <path d="M7 16h10v4H7z" />
    </svg>
  );
}

export function ClockIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  );
}

export function HeartIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M12 20s-7-4.4-7-9a4 4 0 017-2.6A4 4 0 0119 11c0 4.6-7 9-7 9z" />
    </svg>
  );
}

export function ShareIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M12 15V4M8.5 7.5L12 4l3.5 3.5" />
      <path d="M6 12v7.5h12V12" />
    </svg>
  );
}

export function TagIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M12.5 3H20v7.5L10.5 20 4 13.5z" />
      <circle cx="16.3" cy="7.2" r="1.3" />
    </svg>
  );
}

export function WalletIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <rect x="3" y="6" width="18" height="12" rx="2.5" />
      <path d="M3 10h18" />
    </svg>
  );
}

export function PersonIcon({ size = 19 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="8.4" r="3.9" />
      <path d="M4.6 20c0-4 3.3-6.2 7.4-6.2S19.4 16 19.4 20z" />
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

/* ------------------------------------------- category rail glyphs -------- */

export function AllIcon({ size = 21 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M5 8h14l-1.2 11H6.2z" />
      <path d="M9.5 8V6a2.5 2.5 0 015 0v2" />
    </svg>
  );
}

export function BeautyIcon({ size = 21 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <rect x="9" y="10" width="6" height="11" rx="1.4" />
      <path d="M10.5 10V5.5a1.5 1.5 0 013 0V10" />
    </svg>
  );
}

export function PawIcon({ size = 21 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <ellipse cx="8" cy="8.5" rx="1.8" ry="2.4" />
      <ellipse cx="16" cy="8.5" rx="1.8" ry="2.4" />
      <ellipse cx="5" cy="13.5" rx="1.7" ry="2.1" />
      <ellipse cx="19" cy="13.5" rx="1.7" ry="2.1" />
      <path d="M12 12.5c3 0 4.5 2.2 4.5 4.2S14.6 20 12 20s-4.5-1.3-4.5-3.3S9 12.5 12 12.5z" />
    </svg>
  );
}

export function BottleIcon({ size = 21 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M9 9h6v10.5a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 019 19.5z" />
      <path d="M10.5 9V6h3v3M11 3h2" />
    </svg>
  );
}

export function SprayIcon({ size = 21 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M8 10h6v11H8z" />
      <path d="M9.5 10V6.5h3V10M12.5 5h4M12.5 7.5h3" />
    </svg>
  );
}

export function HeadphoneIcon({ size = 21 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M5 14v-2a7 7 0 0114 0v2" />
      <rect x="3" y="13.5" width="4" height="6.5" rx="1.6" />
      <rect x="17" y="13.5" width="4" height="6.5" rx="1.6" />
    </svg>
  );
}
