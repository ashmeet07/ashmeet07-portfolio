// src/components/ui/GhostCursor.jsx

"use client";

import { useEffect, useState } from "react"; // 👈 Added useState
import { ghostCursor } from "cursor-effects";

// Define the breakpoint for 'large' vs 'small' devices
const MIN_WIDTH_FOR_GHOST_CURSOR = 768; 

export default function GhostCursorEffect() {
  const [isLargeDevice, setIsLargeDevice] = useState(false); // 👈 New state

  useEffect(() => {
    // Check initial screen size and listen for resizes
    const checkScreenSize = () => {
      if (typeof window !== 'undefined') {
        setIsLargeDevice(window.innerWidth >= MIN_WIDTH_FOR_GHOST_CURSOR);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []); // Run only once on mount to set up the listener

  useEffect(() => {
    // This useEffect handles the cursor initialization/destruction
    if (isLargeDevice) {
      // Initialize the ghost cursor ONLY IF it's a large device
      const cursor = new ghostCursor();
      
      // Clean up on unmount or if device size changes to small
      return () => cursor.destroy();
    }
    
    // If it's a small device (isLargeDevice is false), do nothing
    return undefined; 

  }, [isLargeDevice]); // 👈 Run this whenever the device size state changes

  return null; // It doesn’t render anything visible
}