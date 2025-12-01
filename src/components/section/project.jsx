"use client";
import { useState, useRef, useEffect } from "react";
// Import motion components for animation
import { motion } from "framer-motion"; 
import { useInView } from "react-intersection-observer"; 

// Using a placeholder for Link. In a real project, this would be 'next/link' or 'react-router-dom/Link'.
const Link = ({ to, children, className }) => <a href={to} className={className}>{children}</a>; 

import { Dot, Github, Link as LinkIcon, ChevronRight } from 'lucide-react'; 
import Image from "next/image";

// 1. IMPORT DATA
import { projects } from '@/lib/data.json'; 
const projectsData = projects

// --- ICON MAP IMPORT ---
// Ensure this path is correct for your project structure
import { TechIconMap } from '@/lib/imagepath.js'; 


// --------------------------------------------------------
// --- GENERIC ICON COMPONENT ---
// --------------------------------------------------------
const ProjectTechnologyIcon = ({ name, className }) => {
    const imagePath = TechIconMap[name]; 
    
    if (imagePath) {
        return (
            <img 
                src={imagePath} 
                alt={`${name} Icon`} 
                className={className} 
            />
        );
    }
    return null;
};
// --- End ProjectTechnologyIcon ---


// --- ICON MAP (Placeholder for usage) ---
const IconMap = TechIconMap;
// --- End Icon Map ---

// --- Helper Component: Status Badge ---
const StatusBadge = ({ status }) => {
    let dotColor = 'bg-gray-500';
    let textColor = 'text-gray-700 dark:text-gray-400';
    let statusText = status;

    if (status === 'Operational') {
        dotColor = 'bg-green-500';
        textColor = 'text-green-700 dark:text-green-400';
    } else if (status === 'Under Development') {
        dotColor = 'bg-red-500';
        textColor = 'text-red-700 dark:text-red-400';
        statusText = 'WIP'; 
    } else if (status === 'Archived') {
        dotColor = 'bg-gray-500';
        textColor = 'text-gray-700 dark:text-gray-400';
    }

    return (
        <span className={`inline-flex items-center text-xs font-semibold ${textColor}`}>
            <Dot className={`w-6 h-6 -ml-2 ${dotColor} rounded-full`} style={{ width: '8px', height: '8px' }} />
            {statusText}
        </span>
    );
};
// --- End Status Badge ---


export default function Projects({ limit }) {
    const allProjects = projectsData; 
    const visibleProjects = limit ? allProjects.slice(0, limit) : allProjects;
    const gridClasses = "grid-cols-1 md:grid-cols-2"; 

    return (
        <section id="projects" className="py-6 max-w-6xl mt-[100px]">
            <p className="text-sm text-gray-400 leading-relaxed flex-1 -mb-2">Featured</p>

            <h2 className="text-3xl font-extrabold mb-2 text-gray-900 dark:text-white">
                {limit ? "Projects" : "My Work"}
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed flex-1 mb-5">My project registry to showcase my work on different domains(Do sponsor our projects).</p>
            
            <div className={`grid gap-4 ${gridClasses}`}>
                {visibleProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>

            {/* View All Projects Link */}
            {limit && visibleProjects.length < allProjects.length && (
                <div className="flex justify-center mt-8">
                    <Link
                        to="/projects"
                        // ✅ FIX 3: Consolidated multi-line className for Link component
                        className="px-6 py-3 rounded-md font-semibold text-sm sm:text-base bg-gray-200/30 dark:bg-gray-800/30 text-gray-900 dark:text-gray-100 hover:bg-gray-300/40 dark:hover:bg-gray-700/40 backdrop-blur-md transition-all duration-300 shadow-inner text-shadow-md "
                    >
                        View All Projects
                    </Link>
                </div>
            )}
        </section>
    );
}

// --- ProjectCard Component with Scroll Animation ---
const ProjectCard = ({ project }) => {
    // Reruns animation every time the card enters the viewport
    const [ref, inView] = useInView({
        triggerOnce: false, 
        threshold: 0.1, 
    });

    // subtle elevation and shadow config
    const hoverTransform = { y: -8, scale: 1.01 };
    const initialTransform = { y: 0, scale: 1 };

    return (
        <div className="relative">
            {/* decorative glow / blurred background (behind card) */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-1 rounded-tl-[100px] rounded-br-[100px] transform-gpu blur-3xl"
                style={{
                    background:
                        'radial-gradient(600px 200px at 10% 10%, rgba(99,102,241,0.12), transparent 15%), radial-gradient(400px 160px at 90% 90%, rgba(16,185,129,0.06), transparent 15%)'
                }}
            />

            <motion.div
                ref={ref}
                initial={initialTransform}
                animate={inView ? hoverTransform : initialTransform}
                whileHover={{ y: -10, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                className="relative"
            >
                {/* card */}
                <div
                    // ✅ KEEP the exact cutout shape classes
                    className={`overflow-hidden bg-white dark:bg-[#1f1f1f] rounded-tl-[100px] rounded-br-[100px]  flex flex-col`}
                    // premium layered shadows using Tailwind arbitrary shadows
                    style={{
                        boxShadow: `0 1px 2px rgba(2,6,23,0.18), 0 30px 60px rgba(2,6,23,0.12), inset 0 2px 8px rgba(255,255,255,0.02)`,
                    }}
                >
                    {/* subtle inner border accent */}
                    <div className="absolute inset-0 pointer-events-none rounded-tl-[100px] rounded-br-[100px] " style={{
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03), inset 0 -1px 0 rgba(0,0,0,0.03)'
                    }} />

                    {/* Project Image Container */}
                    <div 
                        className="aspect-video overflow-hidden p-4 relative bg-gradient-to-br from-white to-blue-200 dark:from-black dark:via-black dark:to-indigo-200 dark:backdrop-blur-lg"
                    >
                        {/* Image Wrapper for Bottom Alignment and Animation */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }} 
                            animate={inView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }} 
                            transition={{ duration: 0.5, ease: "easeOut" }} 
                            className="w-full h-full absolute bottom-0 left-0 flex items-end justify-center" 
                        >
                            <Image
                                src={project.image}
                                alt={project.title}
                                width={600}
                                height={300}
                                className="object-cover max-w-[85%] max-h-[90%] w-auto h-auto rounded-t-sm" 
                            />
                        </motion.div>
                    </div>

                    {/* --- Content Area --- */}
                    <div className="flex flex-col flex-1 p-4 md:p-5 relative z-10">
                        
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {project.title}
                            </h3>
                            
                            <div className="flex items-center gap-2">
                                <a
                                    href={project.liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Live Link"
                                    className="text-gray-500 dark:text-gray-400 hover:text-sky-500 transition"
                                >
                                    <LinkIcon className="w-4 h-4" />
                                </a>

                                <a
                                    href={project.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="GitHub Repository"
                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-300 transition"
                                >
                                    <Github className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                        
                        <div className="mb-2 ml-4">
                            <StatusBadge status={project.status} />
                        </div>

                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed flex-1 mb-4">
                            {project.description}
                        </p>
                        
                        <div className="mt-auto pb-2 ">
                            <div className="flex flex-wrap gap-2">
                                {project.technologies.map((tech) => {
                                    if (!IconMap[tech]) return null;

                                    return (
                                        <div 
                                            key={tech}
                                            title={tech}
                                            className="p-1 rounded bg-white/5 dark:bg-white/3"
                                        >
                                            <ProjectTechnologyIcon name={tech} className="w-5 h-5 opacity-90" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
