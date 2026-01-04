"use client";
import { useState, useRef, useEffect } from "react";
// Import motion components for animation
import { motion, AnimatePresence } from "framer-motion"; 
import { useInView } from "react-intersection-observer"; 

// Using a placeholder for Link. In a real project, this would be 'next/link' or 'react-router-dom/Link'.
const Link = ({ to, children, className }) => <a href={to} className={className}>{children}</a>; 

import { Dot, Github, Link as LinkIcon, ChevronRight, X } from 'lucide-react'; 
import Image from "next/image"; // Next.js Image component

// 1. IMPORT DATA
import { projects } from '@/lib/data.json'; 
const projectsData = projects

// --- ICON MAP IMPORT ---
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


// --------------------------------------------------------
// --- Image/Video Modal Component (Lightbox) ---
// --------------------------------------------------------
const ImageModal = ({ src, alt, onClose }) => {
    if (!src) return null;

    const isVideo = src.endsWith('.mp4');

    // Handle keyboard escape press
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
            {/* Background Overlay with Blur */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-lg cursor-pointer"
                onClick={onClose}
                aria-label="Close modal"
            />
            
            {/* Modal Content */}
            <motion.div
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                // ⭐ CHANGE: Reduced max-w and removed bg-white/dark:bg-[#1f1f1f] for less visual obstruction
                className="relative max-w-5xl w-full max-h-[95vh] rounded-lg shadow-2xl overflow-hidden" 
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    aria-label="Close"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Media Content */}
                {/* ⭐ CHANGE: Removed "p-4" from the container to maximize space */}
                <div className="w-full h-full flex items-center justify-center  dark:bg-[#1f1f1f] rounded-lg">
                    {isVideo ? (
                        <video
                            src={src}
                            title={alt}
                            // ⭐ CHANGE: Maximize dimensions for clarity
                            className="object-contain w-full h-full max-h-[90vh] rounded-md"
                            autoPlay
                            loop
                            muted={false} 
                            controls 
                            playsInline
                        />
                    ) : (
                        <Image
                            src={src}
                            alt={alt}
                            width={1600} // Increase max width
                            height={900} // Increase max height
                            // ⭐ CHANGE: Maximize dimensions for clarity
                            className="object-contain max-w-full max-h-[90vh] rounded-md" 
                        />
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};


// --------------------------------------------------------
// --- Projects Component (State for Modal) ---
// --------------------------------------------------------
export default function Projects({ limit }) {
    const [modalData, setModalData] = useState({ isOpen: false, src: '', alt: '' });
    
    const openModal = (src, alt) => setModalData({ isOpen: true, src, alt });
    const closeModal = () => setModalData({ isOpen: false, src: '', alt: '' });

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
                    <ProjectCard key={project.id} project={project} onMediaClick={openModal} />
                ))}
            </div>

            {/* View All Projects Link */}
            {limit && visibleProjects.length < allProjects.length && (
                <div className="flex justify-center mt-8" id="about">
                    <Link
                        to="/projects"
                        className="px-6 py-3 rounded-md font-semibold text-sm sm:text-base bg-gray-200/30 dark:bg-gray-800/30 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:text-white backdrop-blur-md transition-all duration-300 shadow-inner text-shadow-lg "
                        
                    >
                        View All Projects
                    </Link>
                </div>
            )}
            
            {/* RENDER THE MODAL */}
            <AnimatePresence>
                {modalData.isOpen && (
                    <ImageModal 
                        src={modalData.src} 
                        alt={modalData.alt} 
                        onClose={closeModal} 
                    />
                )}
            </AnimatePresence>

        </section>
    );
}

// --------------------------------------------------------
// --- ProjectCard Component ---
// --------------------------------------------------------
const ProjectCard = ({ project, onMediaClick }) => { 
    const [ref, inView] = useInView({
        triggerOnce: false, 
        threshold: 0.1, 
    });

    const hoverTransform = { y: -8, scale: 1.01 };
    const initialTransform = { y: 0, scale: 1 };
    
    const isVideo = project.image && project.image.endsWith('.mp4');

    const handleMediaClick = () => {
        onMediaClick(project.image, project.title);
    };

    // Helper component for Media rendering (Image or Video)
    const ProjectMedia = () => {
        if (isVideo) {
            return (
                <video
                    src={project.image}
                    title={project.title}
                    className="object-cover max-w-[85%] max-h-[90%] w-auto h-auto rounded-t-sm"
                    autoPlay
                    loop
                    muted
                    playsInline
                />
            );
        }
        
        // Use Next.js Image for non-video sources
        return (
            <Image
                src={project.image}
                alt={project.title}
                width={600} 
                height={300}
                className="object-cover max-w-[85%] max-h-[90%] w-auto h-auto rounded-t-sm" 
            />
        );
    };

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
                    className={`overflow-hidden bg-white dark:bg-[#1f1f1f] rounded-tl-[100px] rounded-br-[100px]  flex flex-col`}
                    style={{
                        boxShadow: `0 1px 2px rgba(2,6,23,0.18), 0 5px 0px rgba(92, 92, 92, 1), inset 0 2px 8px rgba(255,255,255,0.02)`,
                    }}
                >
                    {/* subtle inner border accent */}
                    <div className="absolute inset-0 pointer-events-none rounded-tl-[100px] rounded-br-[100px] " style={{
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03), inset 0 -1px 0 rgba(0,0,0,0.03)'
                    }} />

                    {/* Project Image/Video Container */}
                    <div 
                        className="aspect-video overflow-hidden p-4 relative bg-transparent dark:backdrop-blur-lg"
                        onClick={handleMediaClick}
                        style={{ cursor: 'pointer' }}
                    >
                        {/* Image/Video Wrapper for Bottom Alignment and Animation */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }} 
                            animate={inView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }} 
                            transition={{ duration: 0.5, ease: "easeOut" }} 
                            className="w-full h-full absolute bottom-0 left-0 flex items-end justify-center" 
                        >
                            <ProjectMedia />
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
                                            className="p-1 rounded bg-transparent"
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