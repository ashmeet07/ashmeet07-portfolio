"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { Poppins } from "next/font/google";
import "./globals.css";
import SplashCursor from "@/components/ui/SplashCursor";
import { Analytics } from "@vercel/analytics/next";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export default function RootLayout({ children }) {
  const [enableCursor, setEnableCursor] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 1024px)").matches;
  });

  useLayoutEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");

    const listener = () => setEnableCursor(media.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, []);

  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${poppins.variable} font-sans antialiased relative`}>
        {enableCursor && <SplashCursor />}
        {children}
        <Analytics />
      </body>
    </html>
  );
}
