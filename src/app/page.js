// src/app/page.js (or .tsx)

'use client';

// 1. CRITICAL IMPORTS (Loaded immediately)
import Hero from '@/components/section/hero';
import { Navbar } from "@/components/section/navbar";
import dynamic from 'next/dynamic'; // 👈 Import Next.js dynamic for lazy loading

// --- 2. LAZY LOADED COMPONENTS (Will be loaded in separate bundles) ---

// Projects is likely below the fold
const LazyProjects = dynamic(() => import('@/components/section/project'), { 
    loading: () => <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg" />, // Placeholder for smooth loading
    // ssr: false, // Use this if the component relies heavily on browser APIs
});

// About is often below the fold
const LazyAbout = dynamic(() => import('@/components/section/about'));

// Timeline/Experience is usually far down the page
const LazyTimeline = dynamic(() => import('@/components/section/experience'));

// BookACall is non-critical for the initial view
const LazyBookACall = dynamic(() => import('@/components/section/bookmeet'));

// Chatbox is a non-critical overlay/widget
const LazyChatbox = dynamic(() => import('@/components/section/chatbot'));
const LazyQuote = dynamic(() => import('@/components/section/Quote'));


// --- 3. PAGE CONTENT COMPONENT (Uses the lazy loaded components) ---

const HomePageContent = () => (
    <>
        {/* Hero component remains a direct import for immediate display */}
        <Hero /> 
        
        {/* Lazy loaded sections */}
        <LazyProjects limit={2} />
        <LazyAbout />
        <LazyTimeline/>
        <LazyBookACall/>
        <LazyQuote/>
    </>
);

// --- 4. EXPORTED HOME PAGE ---

export default function Home() {
    return (
        // The surrounding structure is kept, but the components are now dynamic imports
        <div className="min-h-screen bg-white dark:bg-[#232323ff] transition-colors duration-1000">
            {/* Navbar is critical and remains a direct import */}
            <Navbar /> 
            
            <main className="max-w-3xl mx-auto px-4 py-12 sm:px-6 z-1">
                <HomePageContent />
            </main>
            
            {/* Lazy load the Chatbox widget */}
            <LazyChatbox /> 
        </div>
    );
}