'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Home, User, Briefcase, Github, Mail, Moon, Sun, MapPin, Link as LinkIcon, Calendar } from 'lucide-react'; 
import { usePathname, useRouter } from 'next/navigation';
import { FaXTwitter } from 'react-icons/fa6';
import { Dock, DockIcon } from '@/components/ui/dock'; 
import Lenis from '@studio-freight/lenis';

// --- HIRE ME BADGE COMPONENT ---
const HireBadge = ({ onClick }) => (
  <div className="fixed top-12 md:top-10 right-6 md:left-12 pointer-events-auto z-[60]">
    <button 
      onClick={() => onClick('home')} 
      className="relative flex items-center justify-center w-15 h-15 md:w-18 md:h-18 group bg-transparent border-none cursor-pointer"
    >
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
      <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white dark:text-black">
          <path d="M5 12h14m-7-7 7 7-7 7"/>
        </svg>
      </div>
    </button>
  </div>
);

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'about', label: 'About', icon: User },
  { id: 'projects', label: 'Projects', icon: Briefcase },
];

const UTILITY_ITEMS = [
  { 
    id: 'twitter', 
    label: 'X', 
    icon: FaXTwitter, 
    url: 'https://x.com/ashmet07',
    username: '@ashmet07',
    displayName: '$ῗἧḡḥ𝐀丂𝓱м𝑒𝑒𝐓',
    bio: 'Python Developer || Freelancer || Crazy Coder',
    location: 'IND',
    link: 'ashmeet.techquanta.tech',
    banner: 'https://pbs.twimg.com/profile_banners/1991855105537372160/1768074853/1500x500', 
    avatar: 'https://unavatar.io/twitter/ashmet07',
    joined: 'Joined November 2025'
  },
  { 
    id: 'github', 
    label: 'GitHub', 
    icon: Github, 
    url: 'https://github.com/ashmeet07',
    username: 'ashmeet07'
  },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const lenisRef = useRef(null);
  const [githubData, setGithubData] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // --- GITHUB API FETCH ---
  useEffect(() => {
    fetch('https://api.github.com/users/ashmeet07')
      .then(res => res.json())
      .then(data => {
        setGithubData({
          name: data.name || 'Ashmeet',
          avatar: data.avatar_url,
          bio: data.bio || 'Python Developer',
          followers: data.followers,
          repos: data.public_repos
        });
      })
      .catch(() => console.log("GitHub fetch failed"));
  }, []);

  // --- LENIS SCROLL ---
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  // --- THEME LOGIC & HYDRATION FIX ---
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
  };

  const handleNavClick = (id) => {
    if (id === 'home' && pathname !== '/') {
      router.push('/');
      return;
    }
    const section = document.getElementById(id);
    if (section && lenisRef.current) {
      lenisRef.current.scrollTo(section, { offset: 0, duration: 1.5 });
    }
  };

  if (!mounted) return null;

  return (
    <>
      <HireBadge onClick={handleNavClick} />
      
      {/* 1. DESKTOP NAVIGATION */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-full">
          <div className="flex items-center space-x-8 mx-auto"> 
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="flex items-center space-x-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-teal-500 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span> 
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-5 absolute right-10">
            {UTILITY_ITEMS.map((item) => (
              <div key={item.id} className="relative group">
                <button 
                  onClick={() => window.open(item.url, '_blank')} 
                  className="text-gray-600 dark:text-gray-400 hover:text-teal-500 transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                </button>

                {/* X (TWITTER) HOVER CARD WITH BANNER */}
                {item.id === 'twitter' && (
                  <div className="absolute top-full right-0 mt-3 w-[300px] bg-white dark:bg-[#3D4B4B] border border-gray-200 dark:border-[#333] rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] overflow-hidden text-left">
                    <div className="h-20 w-full bg-teal-900">
                      <img src={item.banner}  className="w-full h-full object-cover" />
                    </div>
                    <div className="px-4 pb-4">
                      <div className="relative flex justify-between items-end -mt-8 mb-2">
                        <img src={item.avatar} className="w-16 h-16 rounded-full border-4 border-white dark:border-black" alt="pfp" />
                      </div>
                      <h4 className="font-extrabold text-[17px] dark:text-white leading-tight">{item.displayName}</h4>
                      <p className="text-sm  mb-2">{item.username}</p>
                      <p className="text-[13px] dark:text-[#eff3f4] mb-3 leading-normal">{item.bio}</p>
                      <div className="space-y-1">
                        <div className="flex items-center text-[12px] "><MapPin className="w-3.5 h-3.5 mr-1" />{item.location}</div>
                        <div className="flex items-center text-[12px] text-teal-500 font-medium hover:underline cursor-pointer"><LinkIcon className="w-3.5 h-3.5 mr-1" />{item.link}</div>
                        <div className="flex items-center text-[12px] "><Calendar className="w-3.5 h-3.5 mr-1" />{item.joined}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* GITHUB HOVER CARD (CLEAN UI) */}
                {item.id === 'github' && githubData && (
                  <div className="absolute top-full right-0 mt-3 w-[280px] p-5 bg-white dark:bg-[#3D4B4B]  border-[#d0d7de] dark:border-[#30363d]   opacity-0
                  rounded-md invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] text-left">
                    <div className="flex items-center gap-4 mb-4">
                      <img src={githubData.avatar} className="w-14 h-14 rounded-full border dark:border-[#30363d]" alt="avatar" />
                      <div>
                        <h4 className="font-bold text-[16px] text-[#24292f] dark:text-[#f0f6fc] leading-tight">{githubData.name}</h4>
                        <p className="text-[14px] text-[#636c76] dark:text-[#8b949e]">{item.username}</p>
                      </div>
                    </div>
                    <p className="text-[13px] text-[#24292f] dark:text-[#e6edf3] mb-4 leading-relaxed">{githubData.bio}</p>
                    <div className="flex items-center gap-4 text-[12px] text-[#636c76] dark:text-[#8b949e] border-t dark:border-[#30363d] pt-3">
                      <div><span className="font-bold text-[#24292f] dark:text-[#f0f6fc]">{githubData.followers}</span> followers</div>
                      <div><span className="font-bold text-[#24292f] dark:text-[#f0f6fc]">{githubData.repos}</span> repositories</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button onClick={toggleTheme} className="text-gray-600 dark:text-gray-400 hover:text-teal-500 transition-colors">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
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