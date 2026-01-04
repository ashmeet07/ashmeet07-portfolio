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

export const metadata = {
  title: "Singh Ashmeet | Portfolio",
  description: "Data Science Enth",
  viewport: "width=device-width, initial-scale=1, shrink-to-fit=no",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${poppins.variable} font-sans antialiased`}>
        {children}

        {/* Cursor effect */}
        <GhostCursorEffect />

        {/* Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  );
}