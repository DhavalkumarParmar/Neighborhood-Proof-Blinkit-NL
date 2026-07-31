import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neighborhood Proof",
  description:
    "What households near your dark store actually did with this product, instead of star ratings.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <div className="page">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
