'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Home, User, Briefcase, Github, Mail, Moon, Sun } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Dock, DockIcon } from '@/components/ui/dock';
import { FaXTwitter } from 'react-icons/fa6';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  // Initialize from localStorage or system preference
  const getInitialIsDark = () => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem('theme'); // 'dark' | 'light' | null
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return false;
    }
  };

  const [isDark, setIsDark] = useState(getInitialIsDark);

  // Apply theme to html element and persist choice
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
    // Ensure theme is applied on mount
    applyTheme(isDark);

    // Listen to system preference changes and respect user's explicit saved setting
    let mql = null;
    try {
      if (window.matchMedia) {
        mql = window.matchMedia('(prefers-color-scheme: dark)');
        const sysPrefChangeHandler = (e) => {
          // Only update if user hasn't explicitly chosen (i.e., localStorage is empty)
          try {
            const saved = localStorage.getItem('theme');
            if (saved === null) {
              applyTheme(e.matches);
            }
          } catch (err) {
            // ignore
            applyTheme(e.matches);
          }
        };

        // modern API
        if (mql.addEventListener) {
          mql.addEventListener('change', sysPrefChangeHandler);
        } else if (mql.addListener) {
          mql.addListener(sysPrefChangeHandler);
        }
      }
    } catch (e) {
      // ignore
    }

    // Keep theme in sync across tabs (when localStorage changed elsewhere)
    const storageHandler = (ev) => {
      if (ev.key === 'theme') {
        if (ev.newValue === 'dark') applyTheme(true);
        else if (ev.newValue === 'light') applyTheme(false);
      }
    };
    window.addEventListener('storage', storageHandler);

    return () => {
      if (mql) {
        try {
          if (mql.removeEventListener) mql.removeEventListener('change', () => {});
          else if (mql.removeListener) mql.removeListener(() => {});
        } catch (e) {}
      }
      window.removeEventListener('storage', storageHandler);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTheme = () => {
    // Read current state from DOM so we never depend on stale `isDark`
    const html = document.documentElement;
    const currentlyDark = html.classList.contains('dark');
    applyTheme(!currentlyDark);
  };

  const handleScroll = (id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleHomeClick = () => {
    if (pathname === '/') {
      handleScroll('home');
    } else {
      router.push('/');
    }
  };

  const openExternalLink = (url) => {
    if (url && typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50">
      <Dock
        direction="middle"
        className="
          bg-gray-200/40 dark:bg-[#2b2b2bff]/40
          backdrop-blur-md border border-gray-400/20 dark:border-gray-700/30
          rounded-2xl px-3 py-2 
          flex gap-2 
          transition-all duration-300
        "
      >
        {/* Nav Items */}
        <DockIcon onClick={handleHomeClick} title="Home" role="button" aria-label="Home">
          <Home className="w-full h-full text-gray-900 dark:text-gray-100 cursor-pointer" />
        </DockIcon>

        <DockIcon onClick={() => handleScroll('about')} title="About" role="button" aria-label="About">
          <User className="w-full h-full text-gray-900 dark:text-gray-100 cursor-pointer" />
        </DockIcon>

        <DockIcon onClick={() => handleScroll('projects')} title="Projects" role="button" aria-label="Projects">
          <Briefcase className="w-full h-full text-gray-900 dark:text-gray-100 cursor-pointer" />
        </DockIcon>

        <span className="w-px h-5 bg-gray-400/30 dark:bg-gray-600/30 mx-1" aria-hidden />

        <DockIcon as="a" onClick={() => openExternalLink('https://x.com/ashmet07')} title="Twitter" role="link" aria-label="Twitter">
          <FaXTwitter className="w-5 h-6 text-gray-900 dark:text-gray-100 cursor-pointer" />
        </DockIcon>

        <DockIcon as="a" onClick={() => openExternalLink('https://github.com/ashmeet07')} title="GitHub" role="link" aria-label="GitHub">
          <Github className="w-full h-full text-gray-900 dark:text-gray-100 cursor-pointer" />
        </DockIcon>

        <span className="w-px h-5 bg-gray-400/30 dark:bg-gray-600/30 mx-1" aria-hidden />

        {/* Theme Toggle */}
        <DockIcon
          onClick={toggleTheme}
          title="Toggle Theme"
          role="button"
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleTheme();
            }
          }}
        >
          {isDark ? (
            <Sun className="w-full h-full text-gray-900 dark:text-gray-100 cursor-pointer" />
          ) : (
            <Moon className="w-full h-full text-gray-900 dark:text-gray-100 cursor-pointer" />
          )}
        </DockIcon>
      </Dock>
    </div>
  );
}
