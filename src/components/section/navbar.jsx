'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image'; 
import { Home, User, Briefcase, Github, Mail, Moon, Sun } from 'lucide-react'; 
import { usePathname, useRouter } from 'next/navigation';
import { FaXTwitter } from 'react-icons/fa6';
import { Dock, DockIcon } from '@/components/ui/dock'; 
// Import Lenis for the locomotive effect
import Lenis from '@studio-freight/lenis';

// --- HIRE ME BADGE COMPONENT ---
// Updated to accept an onClick handler so it can trigger smooth scroll
const HireBadge = ({ onClick }) => (
  <div className="fixed top-12 md:top-10 right-6 md:left-12 pointer-events-auto z-[60]">
    <button 
      onClick={() => onClick('Hire-Me')}
      className="relative flex items-center justify-center w-15 h-15 md:w-18 md:h-18 group bg-transparent border-none cursor-pointer"
    >
      {/* Rotating Text Layer */}
      <div className="absolute inset-0 animate-[spin_8s_linear_infinite]">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <path id="circlePath" d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
          </defs>
          <text className="fill-black dark:fill-white text-[9px] font-bold uppercase tracking-[0.2em]">
            <textPath href="#circlePath">
              • HIRE ME •    • HIRE ME • • HIRE ME • • HIRE ME • 
            </textPath>
          </text>
        </svg>
      </div>
      
      {/* Center Circle Button */}
      <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-white dark:text-black"
        >
          <path d="M5 12h14m-7-7 7 7-7 7"/>
        </svg>
      </div>
    </button>
  </div>
);

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home, type: 'nav' },
  { id: 'about', label: 'About', icon: User, type: 'nav' },
  { id: 'projects', label: 'Projects', icon: Briefcase, type: 'nav' },
];

const UTILITY_ITEMS = [
  { id: 'twitter', label: 'Twitter', icon: FaXTwitter, type: 'external', url: 'https://x.com/ashmet07' },
  { id: 'github', label: 'GitHub', icon: Github, type: 'external', url: 'https://github.com/ashmeet07' },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const lenisRef = useRef(null);

  // --- LOCOMOTIVE/LENIS SCROLL LOGIC ---
  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2, // Time of scroll
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // High-end "Locomotive" easing
      smoothWheel: true,
      wheelMultiplier: 1,
      lerp: 0.1, // Linear interpolation (smoothness factor)
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // --- THEME LOGIC ---
  const getInitialIsDark = () => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) { return false; }
  };

  const [isDark, setIsDark] = useState(getInitialIsDark);

  const applyTheme = useCallback((dark) => {
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
      try { localStorage.setItem('theme', 'dark'); } catch (e) {}
    } else {
      html.classList.remove('dark');
      try { localStorage.setItem('theme', 'light'); } catch (e) {}
    }
    setIsDark(dark);
  }, []);

  useEffect(() => {
    applyTheme(isDark);
    // (Existing storage/system theme listeners code stays here...)
  }, [isDark, applyTheme]);

  const toggleTheme = () => applyTheme(!isDark);

  // --- Updated Navigation Handlers for Smooth Scroll ---
  const handleNavClick = (id) => {
    if (id === 'home' && pathname !== '/') {
      router.push('/');
      return;
    }

    const section = document.getElementById(id);
    if (section && lenisRef.current) {
      // Use Lenis scroll for that eased Locomotive effect
      lenisRef.current.scrollTo(section, {
        offset: 0,
        duration: 1.5,
      });
    }
  };

  const openExternalLink = (url) => {
    if (url && typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <HireBadge onClick={handleNavClick} />
      
      {/* 1. DESKTOP/TABLET NAVIGATION */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 w-full bg-transparent backdrop-blur-md p-4 pr">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-full">
          <div className="flex items-center space-x-6 mx-auto"> 
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="flex items-center space-x-2 text-lg font-medium text-gray-700 dark:text-gray-300 transition-colors hover:text-black dark:hover:text-white"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span> 
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-6 absolute right-10">
            {UTILITY_ITEMS.map((item) => (
              <button key={item.id} onClick={() => openExternalLink(item.url)} className="text-gray-700 dark:text-gray-300 transition-colors hover:text-black dark:hover:text-white">
                <item.icon className="w-6 h-6" />
              </button>
            ))}
            <span className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
            <button onClick={toggleTheme} className="text-gray-700 dark:text-gray-300">
              {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* 2. MOBILE DOCK NAVIGATION */}
      <div className="md:hidden fixed bottom-4 left-0 right-0 flex justify-center z-50">
        <Dock direction="middle" className="bg-gray-200/40 dark:bg-[#373636ff]/70 backdrop-blur-md border border-gray-400/20 dark:border-gray-700/30 rounded-lg px-3 py-2 flex gap-2">
          {NAV_ITEMS.map((item) => (
            <DockIcon key={item.id} onClick={() => handleNavClick(item.id)}>
              <item.icon className="w-full h-full text-gray-900 dark:text-gray-100" />
            </DockIcon>
          ))}
          <span className="w-px h-5 bg-gray-400/30 dark:bg-gray-600/30 mx-1" />
          {UTILITY_ITEMS.map((item) => (
            <DockIcon key={item.id} onClick={() => openExternalLink(item.url)}>
              <item.icon className="w-5 h-6 text-gray-900 dark:text-gray-100" />
            </DockIcon>
          ))}
          <span className="w-px h-5 bg-gray-400/30 dark:bg-gray-600/30 mx-1" />
          <DockIcon onClick={toggleTheme}>
            {isDark ? <Sun className="w-full h-full" /> : <Moon className="w-full h-full" />}
          </DockIcon>
        </Dock>
      </div>
    </>
  );
}