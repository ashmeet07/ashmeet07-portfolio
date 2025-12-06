// src/components/section/experience.jsx

"use client";
import React, { useState } from "react";
import {
  MapPin,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  Briefcase,
  BookOpen,
} from "lucide-react";

// --- MOCK DATA IMPORT ---
import timelineData from "@/lib/data.json";

// --- ICON MAP IMPORT ---
import { TechIconMap } from "@/lib/imagepath.js";

// 🛠️ FIX APPLIED HERE:
// Correctly extract the array. Assuming data.json exports { timelineItems: [...] }.
// If your file exports the array directly, change this to: const timelineItems = timelineData;
const timelineItems = timelineData.timelineItems;

// --------------------------------------------------------
// --- 1. Technology Icons (NO CHANGE) ---
// --------------------------------------------------------

const TechnologyIcon = ({ name, className }) => {
  const imagePath = TechIconMap[name];

  if (imagePath) {
    return <img src={imagePath} alt={`${name} Icon`} className={className} />;
  }
  return (
    <span
      className={`${className} font-bold text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center bg-gray-300`}
    >
      {name.substring(0, 2)}
    </span>
  );
};
// --- End Technology Icon Component ---

// ----------------------------------------------
// --- 2. Technologies Icon Tag Component (NO CHANGE) ---
// ----------------------------------------------
const TechStackIcon = ({ name, status }) => {
  const isCurrent = status === "current";

  const IconComponent = (
    <TechnologyIcon
      name={name}
      className={`w-3.5 h-3.5 mr-1 bg-transparent ${
        isCurrent ? "text-blue-500 " : "text-gray-500 dark:text-gray-400"
      }`}
    />
  );

  const classes = `text-xs font-mono px-2 py-0.5 rounded-sm text-shadow-lg   ${
    isCurrent
      ? "bg-green-50 text-black border border-dashed border-black shadow-inner-md"
      : "bg-gray-100 dark:bg-gray-300 text-black border border-dashed border-black"
  } flex items-center transition-colors`;

  return (
    <span className={classes}>
      {IconComponent}
      <span className="">{name}</span>
    </span>
  );
};
// --- End Technology Icon Component ---

const NavigationButton = ({ currentView, setView }) => {
  const isExperienceView = currentView === "experience";

  const label = isExperienceView ? "Education History" : "Professional History";

  const Icon = isExperienceView ? BookOpen : Briefcase;

  const targetView = isExperienceView ? "education" : "experience";

  const classes = `bg-transparent  hover:bg-gray-200 dark:bg-black  dark:hover-border-2 transition-colors rounded-sm inline-flex items-center justify-center h-10 px-6 font-medium tracking-wide 
    text-black
        transition duration-200 rounded-lg  
        dark:text-white`;

  return (
    <button
      onClick={() => setView(targetView)}
       className="px-6 py-3 rounded-md font-semibold text-sm sm:text-base bg-gray-200/30 dark:bg-gray-800/30 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 dark:hover:text-white backdrop-blur-md transition-all duration-300 shadow-inner text-shadow-lg "
      aria-label={`Switch to ${targetView} view`}
    >
      <Icon  />
    </button>
  );
};

// ----------------------------------------------------
// --- 4. Timeline Item Component (Logo and Name Blurred) ---
// ----------------------------------------------------
const TimelineItem = ({ item }) => {
  const isExperience = item.type === "experience";
  // Checks for "Present" in the date field
  const isCurrent = isExperience && item.date.includes("Present");

  const [isExpanded, setIsExpanded] = useState(isCurrent);

  // BLUR LOGIC: Blurs if it's the current experience item.
  const isBlurred = isExperience && isCurrent;

  // Classes for the company/institution name header
  const companyClasses = `text-lg font-semibold flex items-center ${
    isBlurred
      ? // Apply blur and prevent selection/copying for the name
        "text-gray-900 dark:text-white filter blur-md select-none"
      : "text-gray-900 dark:text-white"
  }`;

  // Classes for the icon container
  const iconContainerClasses = `
        w-8 h-8 flex items-center justify-center text-xl flex-shrink-0 mr-4 rounded-sm 
        ${
          isExperience
            ? `${item.color} bg-gray-50 dark:bg-gray-900`
            : "text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700"
        }
    `;

  const renderDescriptionBullets = (description) => {
    const lines = description.split("\n").filter((line) => line.trim() !== "");
    if (lines.length === 0) return null;

    return (
      <ul className="list-disc ml-5 space-y-1 pt-2">
        {lines.map((line, index) => (
          <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
            {line.trim()}
          </li>
        ))}
      </ul>
    );
  };

  // --- LOGIC TO RENDER ICON/LOGO OR BLURRED PLACEHOLDER ---
  const isLogoUrl =
    isExperience &&
    item.icon &&
    (item.icon.startsWith("http") || item.icon.startsWith("/"));

  const iconContent = isBlurred ? (
    // Blurred placeholder box for the icon/logo
    <span
      className="block w-full h-full bg-gray-200 dark:bg-gray-700 rounded-sm filter blur-md select-none"
      aria-hidden="true"
    />
  ) : isLogoUrl ? (
    // Actual image logo
    <img
      src={item.icon}
      alt={`${isExperience ? item.company : item.institution} Logo`}
      className="w-full h-full object-contain p-0.5 rounded-sm"
    />
  ) : (
    // Default icon/emoji
    item.icon
  );

  return (
    <div className="w-full">
      <div className="flex w-full">
        {/* ICON/LOGO CONTAINER - Conditional Content */}
        <div className={iconContainerClasses}>{iconContent}</div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              {/* Company or Institution Name - Blurred if current */}
              <h4 className={companyClasses}>
                {isExperience ? item.company : item.institution}
              </h4>

              {/* Current Role Tag */}
              {isCurrent && (
                <span className="ml-3 text-xs px-2 py-0.5 rounded  text-blue-600  dark:text-blue-200 uppercase tracking-widest font-medium relative flex items-center">
                  <span className="relative flex h-2 w-2 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                </span>
              )}

              {/* Social URL Link - Hidden if blurred */}
              {isExperience && item.socialUrl && !isBlurred && (
                <a
                  href={item.socialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Visit ${
                    isExperience ? item.company : item.institution
                  }`}
                  className="ml-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition"
                >
                  <LinkIcon className="w-3 h-3" />
                </a>
              )}

              {/* Expand/Collapse Button */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition p-1 rounded-full"
                title={isExpanded ? "Collapse Details" : "Expand Details"}
              >
                {isExpanded ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Position or Degree - ALWAYS RENDERED NORMALLY */}
            <p className="text-x text-gray-900 dark:text-gray-300 text-right font-bold">
              {isExperience ? item.position : item.degree}
            </p>
          </div>

          {/* Location and Date */}
          <div className="flex justify-between items-end mt-0.5 mb-1">
            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              {item.location}
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {item.date}
            </p>
          </div>
        </div>
      </div>

      {/* --- EXPANDABLE DETAILS CONTENT - ALWAYS VISIBLE IF EXPANDED --- */}
      {isExpanded && (
        <div className="mt-3 pt-2">
          {/* Tech Stack (Only for Experience) */}
          {isExperience && item.technologies && (
            <>
              {/* 1. CURRENTLY WORKING ON TECH */}
              {item.technologies.workingOn &&
                item.technologies.workingOn.length > 0 && (
                  <div className="">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.technologies.workingOn.map((tech) => (
                        <TechStackIcon
                          key={tech}
                          name={tech}
                          status="current"
                        />
                      ))}
                    </div>
                  </div>
                )}

              {/* 2. WORKED ON TECH */}
              {item.technologies.workedOn &&
                item.technologies.workedOn.length > 0 && (
                  <div className="">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.technologies.workedOn.map((tech) => (
                        <TechStackIcon key={tech} name={tech} status="past" />
                      ))}
                    </div>
                  </div>
                )}
            </>
          )}

          {/* Full Description - WITH BULLET POINTS (For both) */}
          <div className="pt-2">
            {renderDescriptionBullets(item.description)}
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------
// --- 5. Main Timeline Component (Default Export) ---
// ----------------------------------------------------
export default function Timeline() {
  // These lines are safe now that timelineItems is correctly defined.
  const allExperiences = timelineItems.filter(
    (item) => item.type === "experience"
  );
  const education = timelineItems.filter((item) => item.type === "education");

  const [currentView, setCurrentView] = useState("experience");

  const visibleItems =
    currentView === "experience" ? allExperiences : education;
  const isExperienceView = currentView === "experience";

  return (
    <div className="w-full font-sans pb-10">
      <section id={currentView} className="mb-16">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">
          {isExperienceView ? "Professional" : "Academics"}
        </p>

        <h3 className="text-3xl mb-8 text-gray-900 dark:text-white font-bold">
          {isExperienceView ? "Experience" : "Education"}
        </h3>

        {visibleItems.map((item, idx) => (
          <div
            key={idx}
            className={
              idx < visibleItems.length - 1
                ? "pb-6 mb-6  border-gray-200 dark:border-gray-700"
                : "mb-6"
            }
          >
            <TimelineItem item={item} />
          </div>
        ))}

        <div className="mt-8 w-full flex justify-center">
          <NavigationButton
            currentView={currentView}
            setView={setCurrentView}
          />
        </div>
      </section>
    </div>
  );
}
