// src/components/ui/HeatMapChart.jsx
'use client';

import { useState, useEffect } from "react";
import Image from 'next/image'; 
// ... (Your other constants and useThemeFallback hook remain unchanged) ...

const LIGHT_PLACEHOLDER_URL = "https://placehold.co/1200x320/f1f5f9/1e293b?text=Error:+Activity+Graph+Not+Loading";
const DARK_PLACEHOLDER_URL = "https://placehold.co/1200x320/1e293b/ffffff?text=Error:+Activity+Graph+Not+Loading";

const useThemeFallback = () => {
    // ... (Keep this hook as is) ...
}

export default function HeatmapChart({ githubUsername, heatmapUrlTemplate }) {
    const fallbackSrc = useThemeFallback();
    
    const heatmapUrl = heatmapUrlTemplate.replace("{GITHUB_USERNAME}", githubUsername);
    const [imgSrc, setImgSrc] = useState(heatmapUrl);

    useEffect(() => {
        setImgSrc(heatmapUrl);
    }, [heatmapUrl]);

    return (
        <div className="flex w-full overflow-hidden mb-16 mt-12">
            <Image
                src={imgSrc} 
                alt="GitHub Contribution Activity Heatmap"
                width={1200} 
                height={320}
                sizes="(max-width: 768px) 100vw, 700px" 
                className="w-full h-auto max-w-full"
                // 💥 ADD THIS LINE TO ALLOW REMOTE SVG LOADING 💥
                unoptimized={true} 
                
                onError={() => {
                    setImgSrc(fallbackSrc); 
                    console.error("Error loading Heatmap image. Falling back to placeholder.");
                }}
            />
        </div>
    );
}