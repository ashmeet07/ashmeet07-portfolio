import { Poppins } from "next/font/google";
import "./globals.css";

import GhostCursorEffect from "@/components/ui/GhostCursor";
import { Analytics } from "@vercel/analytics/next";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-poppins",
  display: "swap",
});

// ✔ Server-side metadata (valid in App Router)
export const metadata = {
  title: "Singh Ashmeet | Portfolio",
  description: "Data Science Enth",
  viewport: "width=device-width, initial-scale=1, shrink-to-fit=no",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* No <head> tag — handled automatically by Next.js */}
      <body className={`${poppins.variable} font-sans antialiased`}>
        {children}

        {/* Cursor effect (client component handled in its own file) */}
        <GhostCursorEffect />

        {/* ✔ Correct placement for Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  );
}
