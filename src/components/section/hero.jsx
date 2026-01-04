"use client";
import Image from "next/image";
import ShinyText from "../ui/ShinyText";
import ElectricBorder from "../ui/ElectricBorder";

// Import all necessary icons from lucide-react
import { Download, RocketIcon } from "lucide-react";

// 1. IMPORT DATA
import { hero } from "@/lib/data.json";

// 2. IMPORT TECHNOLOGY ICON MAP
// This imports the map containing all static SVG file paths (strings)
import { TechIconMap } from "@/lib/imagepath";

// 3. CONSTRUCT COMPLETE ICON MAP
// Merge static paths from TechIconMap with the React components
const IconMap = {
  // Merge all technology SVG paths (strings)
  ...TechIconMap,

  // Add Lucide React Components (functions)
  Download: Download,
  RocketIcon: RocketIcon,
};

export default function Hero() {
  const {
    greeting,
    name_and_title,
    description,
    technologies,
    image_card,
    call_to_actions, // This array must contain an 'href' property for each action
  } = hero;

  // Helper function to render the description (omitted for brevity, assume it's correct)
  const renderDescription = () => {
    // ... (Your existing renderDescription function) ...
    const techListJSX = technologies.map((tech) => {
        const IconComponentOrPath = IconMap[tech.icon_name];
        if (!IconComponentOrPath) return null;
  
        const isSvgPath = typeof IconComponentOrPath === "string";
  
        const IconJsx = isSvgPath ? (
          <Image
            src={IconComponentOrPath}
            alt={`${tech.name} icon`}
            width={16}
            height={16}
            className="w-4 h-4 mr-1 opacity-75"
          />
        ) : (
          <IconComponentOrPath className="w-4 h-4 mr-1 opacity-75" />
        );
  
        return (
          <span
            key={tech.name}
            className="inline-flex items-center bg-gray-100 dark:bg-gray-100 text-gray-900 dark:text-gray-900 px-1 rounded text-sm font-semibold mx-1 border border-dashed border-gray-400 text-shadow-lg"
          >
            {IconJsx}
            {tech.name}
          </span>
        );
      });
  
      const techListWithSeparators = techListJSX.flatMap((item, i) => {
        if (i === 0) return [item];
        if (i === techListJSX.length - 1)
          return [<span key="and-sep">{" and "}</span>, item];
        return [<span key={`comma-sep-${i}`}>{", "}</span>, item];
      });
  
      const parts = description.split("[TECH_LIST]");
      const output = [parts[0], ...techListWithSeparators, parts[1]];
  
      const finalOutput = output.flatMap((item, index) => {
        if (typeof item === "string") {
          return item.split("**UI**").flatMap((sub) =>
            sub
              .split("**SAAS**")
              .flatMap((final, fIndex) => {
                if (fIndex > 0)
                  return [
                    <strong
                      key={`saas-${index}-${fIndex}`}
                      className="text-gray-900 dark:text-white"
                    >
                      SAAS
                    </strong>,
                    final,
                  ];
                return final;
              })
              .map((item, sIndex) => {
                if (sIndex > 0)
                  return [
                    <strong
                      key={`ui-${index}-${sIndex}`}
                      className="text-gray-900 dark:text-white"
                    >
                      UI
                    </strong>,
                    item,
                  ];
                return item;
              })
          );
        }
        return item;
      });
  
      return finalOutput;
  };


  return (
    <section id="home" >
      {/* Greeting */}
      <h1 className="text-2xl sm:text-3xl md:pt-20 lg:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight ">
        <ShinyText
          text={greeting}
          disabled={false}
          speed={3}
          className="custom-class"
        />
      </h1>
      {/* Name and Title */}
      <h1 className="text-xl mb-10 sm:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
       {name_and_title}
      </h1>

      <div className="flex flex-col-reverse md:flex-col lg:flex-row items-center lg:items-stretch justify-between gap-10 lg:gap-16">
        {/* RIGHT SECTION — Image Card and Links */}
        <div className="flex flex-col items-center lg:items-end gap-4 w-full lg:w-auto">
          <ElectricBorder
            color={image_card.electric_border.color}
            speed={image_card.electric_border.speed}
            chaos={image_card.electric_border.chaos}
            thickness={image_card.electric_border.thickness}
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
              <Image
                src={image_card.src}
                alt={image_card.alt}
                height={image_card.height}
                width={image_card.width}
                className="object-cover shadow-inner z-[-1]"
              />
            </div>
          </ElectricBorder>

          {/* Buttons below image */}
          <div className="flex flex-wrap justify-center lg:justify-end w-full gap-4 mt-4">
            {call_to_actions.map((action) => {
              // action must contain: { label: string, icon_name: string, href: string }
              const IconComponent = IconMap[action.icon_name];
              if (!IconComponent) return null;

              const iconClass = action.label === "Community" ? "ml-2" : "mr-2";
              
              // Determine if the link should open in a new tab (e.g., for external sites or files)
              const isExternal = action.href && (
                action.href.startsWith('http') || action.href.includes('.') // Simple check for external link or file
              );

              return (
                <a
                  key={action.label}
                  href={action.href} // ⬅️ CRITICAL: Use the action's href
                  target={isExternal ? "_blank" : undefined} // Open in new tab if external
                  rel={isExternal ? "noopener noreferrer" : undefined} // Security for new tabs
                  // The button classes now apply to the <a> tag
                  className="px-6 py-3 rounded-xl text-sm sm:text-base font-semibold backdrop-blur-md bg-gray-300/30 dark:bg-gray-800/30 text-gray-900 dark:text-gray-100 hover:bg-gray-300/40 dark:hover:bg-gray-700/40 transition-all duration-300 shadow-inner text-shadow-md inline-flex items-center"
                >
                  {/* Place icon before text for 'Download CV', after for 'Connect' */}
                  {action.label !== "Community" && (
                    <IconComponent className={`inline w-4 h-4  ${iconClass}`} />
                  )}
                  {action.label}
                  {action.label === "Community" && (
                    <IconComponent className={`inline w-4 h-4 ${iconClass}`} />
                  )}
                </a>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col justify-center items-start flex-1 text-left ">
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 leading-loose mb-8 max-w-2xl">
            {renderDescription()}
          </p>
        </div>
      </div>
    </section>
  );
}