// src/app/projects/page.js
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

// Lazy-load the full Projects component (no limit)
const ProjectsFull = dynamic(() => import('@/components/section/project'), {
  loading: () => (
    <div className="w-full h-64 rounded-lg animate-pulse" />
  ),
  ssr: false, // keep client-only to avoid SSR issues (safe for framer-motion / useInView)
});

export default function ProjectsPage() {
  return (
    <div className=" w-full min-h-screen  bg-white dark:bg-black transition-colors duration-700">
      {/* Navbar is part of your layout — if you prefer Navbar here, keep it */}
      {/* If Navbar is rendered by a layout above, remove the next block */}
      <div className=" sticky top-0 z-30 backdrop-blur-md bg-white/30 dark:bg-black/30 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {/* This Link component is correctly updated for Next.js 13+ */}
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium bg-gray-100/40 dark:bg-gray-900/30 hover:opacity-95 transition hover:underline"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Link>
              {/* --- END FIX --- */}

            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="hidden sm:inline">Selected works & case studies</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 -my-10 ">

        {/* Motion container for project list */}
        <motion.section
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06 } }
          }}
        >
          <ProjectsFull />
        </motion.section>

        {/* Small footer CTA */}
    
      </main>
    </div>
  );
}