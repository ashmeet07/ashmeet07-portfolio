"use client";

import { useEffect, useState } from "react";
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
  const [mounted, setMounted] = useState(false);
  const [enableCursor, setEnableCursor] = useState(false);

  useEffect(() => {
    // 1. Mark as mounted to ensure client-side rendering only
    setMounted(true);

    // 2. Check media query only on the client
    const media = window.matchMedia("(min-width: 1024px)");
    setEnableCursor(media.matches);

    const listener = () => setEnableCursor(media.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, []);

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased relative min-h-screen bg-white dark:bg-[#0d1117] transition-colors duration-500`}>
        {/* Only render SplashCursor if we are on the client (mounted) 
            AND the screen is large enough 
        */}
        {mounted && enableCursor && <SplashCursor />}
        
        {children}
        <Analytics />
      </body>
    </html>
  );
}