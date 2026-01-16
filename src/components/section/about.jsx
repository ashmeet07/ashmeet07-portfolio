"use client";
import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import data from "@/lib/data.json";
// Assuming these are the correct paths for the imports mentioned in the original snippet
import LogoLoop from "@/components/ui/LogoLoop";
import { TechIconMap } from "@/lib/imagepath";

const WAKATIME_API_BASE_URL = "https://working-time.vercel.app";
const INACTIVITY_BUFFER_MINUTES = 5; // 5-minute buffer
const POLL_INTERVAL_MS = 60000; // 60s

const { profile, external, skills } = data;
const GITHUB_USERNAME = profile.githubUsername;

// Helper: bold text renderer
const renderIntroText = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.substring(2, part.length - 2)}</strong>;
    }
    return part;
  });
};

function secondsToHuman(totalSec) {
  if (!Number.isFinite(totalSec) || totalSec <= 0) return "0s";
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = Math.floor(totalSec % 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

const toLocalTimeString = (epochSec) => {
  try {
    const d = new Date(Number(epochSec) * 1000);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const buildEndpoint = (base, path) => {
  const b = (base || "").replace(/\/+$/, "");
  const p = (path || "").replace(/^\/+/, "");
  return `${b}/${p}`;
};

// date helpers
const parseISO = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d)) {
    const parts = iso.split("T")[0].split("-").map(Number);
    if (parts.length >= 3) return new Date(parts[0], parts[1] - 1, parts[2]);
    return new Date(iso);
  }
  return d;
};

const monthKeyFromDate = (dateStr) => {
  const d = parseISO(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const formatMonthLabel = (yyyymm) => {
  const [y, m] = yyyymm.split("-").map(Number);
  try {
    const d = new Date(y, m - 1, 1);
    return d.toLocaleString(undefined, { month: "short" }); // Only show month name
  } catch {
    return yyyymm;
  }
};

const dayKey = (iso) => iso.split("T")[0];

// color fallback for GitHub contributions
const colorForCount = (count) => {
  if (count <= 0) return "#ebedf0";
  if (count <= 3) return "#c6e48b";
  if (count <= 7) return "#7bc96f";
  if (count <= 15) return "#239a3b";
  return "#196127";
};

// Custom color palette for the project block chart
const BLOCK_COLORS = [
  "bg-indigo-600",
  "bg-cyan-500",
  "bg-rose-500",
  "bg-emerald-500",
  "bg-yellow-500",
];

// Helper for generating gradient colors for the detailed list
const GRADIENT_COLORS = [
  "from-indigo-400 to-cyan-400",
  "from-pink-400 to-rose-400",
  "from-emerald-400 to-lime-400",
  "from-yellow-400 to-orange-400",
  "from-sky-400 to-indigo-400",
];

export default function About() {
  const [totalTimeToday, setTotalTimeToday] = useState("Loading...");
  const [cursorStatus, setCursorStatus] = useState("Loading...");
  const [timeToOffline, setTimeToOffline] = useState(null);
  const [currentProject, setCurrentProject] = useState("—");
  const [lastRequestedDate, setLastRequestedDate] = useState(null);
  const [lastActivityAt, setLastActivityAt] = useState(null);
  const [dayItems, setDayItems] = useState([]);
  const [showProjectDetails, setShowProjectDetails] = useState(false);

  // contributions state
  const [contribDays, setContribDays] = useState([]);
  const [contribTotal, setContribTotal] = useState(null);
  const [contribLoading, setContribLoading] = useState(false);

  const pollRef = useRef(null);
  const countdownRef = useRef(null);
  const abortControllerRef = useRef(null);
  
  // ----------------------------------------------------
  // MINIFICATION & STYLE CONSTANTS
  // ----------------------------------------------------
  const cellSize = 10; // px (Mini size)
  const cellGap = 2; // px (Mini size)
  const weekdayLabelLineHeight = `${cellSize + cellGap}px`;

  // ----------------------------------------------------
  // CALLBACKS (Declaration before Effects to fix initialization error)
  // ----------------------------------------------------
  const getTodayDate = useCallback(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const fetchWakaTimeData = useCallback(async () => {
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (e) {
        /* ignore */
      }
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const today = getTodayDate();
    setLastRequestedDate(today);

    const apiEndpoint =
      buildEndpoint(WAKATIME_API_BASE_URL, `/api/durations`) + `?date=${today}`;

    try {
      const res = await fetch(apiEndpoint, { signal: controller.signal });
      if (!res.ok) {
        setCursorStatus("Offline");
        setTotalTimeToday("N/A (API Error)");
        setTimeToOffline(0);
        setCurrentProject("—");
        setDayItems([]);
        setLastActivityAt(null);
        return;
      }
      const payload = await res.json();

      const serverHuman = payload?.total_duration_human;
      if (serverHuman) {
        setTotalTimeToday(serverHuman);
      } else {
        const arr = Array.isArray(payload?.data) ? payload.data : [];
        const totalSec = arr.reduce(
          (acc, it) => acc + (Number(it.duration) || 0),
          0
        );
        setTotalTimeToday(secondsToHuman(totalSec));
      }

      const items = Array.isArray(payload?.data) ? payload.data : [];
      setDayItems(items);

      const lastRecord = items.length ? items[items.length - 1] : null;
      if (lastRecord && Number.isFinite(Number(lastRecord.time))) {
        const lastTimeMs = Number(lastRecord.time) * 1000;
        setLastActivityAt(lastTimeMs);

        const offlineThresholdMs =
          lastTimeMs + INACTIVITY_BUFFER_MINUTES * 60 * 1000;
        const nowMs = Date.now();
        const remainingMs = offlineThresholdMs - nowMs;
        const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

        setCurrentProject(lastRecord.project || "—");

        if (remainingSec > 0) {
          setCursorStatus("Online");
          setTimeToOffline(remainingSec);
        } else {
          setCursorStatus("Offline");
          setTimeToOffline(0);
        }
      } else {
        setCursorStatus("Offline");
        setTimeToOffline(0);
        setCurrentProject("—");
        setLastActivityAt(null);
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      console.error("Error fetching WakaTime data:", err);
      setCursorStatus("Error");
      setTotalTimeToday("N/A");
      setTimeToOffline(0);
      setCurrentProject("—");
      setDayItems([]);
      setLastActivityAt(null);
    } finally {
      if (abortControllerRef.current === controller)
        abortControllerRef.current = null;
    }
  }, [getTodayDate]);

  const fetchContributions = useCallback(async (username) => {
    if (!username) return;
    setContribLoading(true);
    try {
      const res = await fetch(
        `/api/contribs?username=${encodeURIComponent(username)}`
      );
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      const days = Array.isArray(json.days) ? json.days : [];
      const normalized = days.map((d) => ({
        date: dayKey(d.date),
        contributionCount: Number(d.contributionCount || 0),
        color: d.color || null,
      }));
      normalized.sort((a, b) => new Date(a.date) - new Date(b.date));
      setContribDays(normalized);
      setContribTotal(
        json.total ?? normalized.reduce((s, d) => s + d.contributionCount, 0)
      );
    } catch (err) {
      console.error("Error fetching contributions:", err);
      setContribDays([]);
      setContribTotal(null);
    } finally {
      setContribLoading(false);
    }
  }, []);
  // ----------------------------------------------------

  // EFFECTS
  useEffect(() => {
    fetchWakaTimeData();
    pollRef.current = setInterval(fetchWakaTimeData, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort();
        } catch (e) {
          /* ignore */
        }
      }
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [fetchWakaTimeData]);

  useEffect(() => {
    if (GITHUB_USERNAME) fetchContributions(GITHUB_USERNAME);
  }, [fetchContributions]);

  useEffect(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (
      cursorStatus === "Online" &&
      timeToOffline !== null &&
      timeToOffline > 0
    ) {
      countdownRef.current = setInterval(() => {
        setTimeToOffline((prev) => {
          const next = (Number(prev) || 0) - 1;
          if (next <= 0) {
            if (countdownRef.current) {
              clearInterval(countdownRef.current);
              countdownRef.current = null;
            }
            setCursorStatus("Offline");
            fetchWakaTimeData();
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [cursorStatus, timeToOffline, fetchWakaTimeData]);

  // MEMOIZED VALUES
  const techLogos = useMemo(() => {
    return skills.techLogos.map((item) => {
      const logoUrl = TechIconMap[item.icon];
      const logoNode =
        logoUrl && item.name ? (
          <img
            key={item.name}
            src={logoUrl}
            alt={item.name}
            className="w-full h-full object-contain"
          />
        ) : null;
      return { ...item, node: logoNode };
    });
  }, [skills.techLogos]);

  const formatCountdown = (seconds) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const topProjects = useMemo(() => {
    if (!Array.isArray(dayItems) || dayItems.length === 0) return [];
    const map = {};
    for (const it of dayItems) {
      const p = it.project || "unknown";
      map[p] = (map[p] || 0) + (Number(it.duration) || 0);
    }
    const arr = Object.entries(map).map(([project, duration]) => ({
      project,
      duration,
    }));
    arr.sort((a, b) => b.duration - a.duration);
    return arr.slice(0, 5);
  }, [dayItems]);

  const totalDuration = useMemo(() => {
    return topProjects.reduce((sum, p) => sum + p.duration, 0) || 1;
  }, [topProjects]);

  const graphData = useMemo(() => {
    if (!contribDays || contribDays.length === 0) return { months: [], weeks: [] };

    const today = new Date();
    // Start 364 days ago (1 year)
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);

    const dataMap = new Map(contribDays.map(d => [d.date, d]));
    const weeks = [];
    let currentWeek = [];
    let currentDate = startDate;
    let currentMonth = null;
    let monthLabels = [];
    let weekIndex = 0;

    // Iterate through a full year
    while (currentDate <= today) {
      const dateKey = dayKey(currentDate.toISOString());
      const dayData = dataMap.get(dateKey) || { date: dateKey, contributionCount: 0, color: null };

      const dayOfWeek = currentDate.getDay(); // 0 (Sun) to 6 (Sat)

      // Check for month change for labels
      const monthKey = monthKeyFromDate(currentDate.toISOString());
      if (monthKey !== currentMonth) {
          monthLabels.push({
              label: formatMonthLabel(monthKey),
              weekIndex: weekIndex
          });
          currentMonth = monthKey;
      }

      currentWeek[dayOfWeek] = dayData;

      if (dayOfWeek === 6 || currentDate.getTime() === today.getTime()) {
        weeks.push(currentWeek);
        currentWeek = [];
        weekIndex++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (currentWeek.length > 0) {
        while(currentWeek.length < 7) {
            currentWeek.push(null);
        }
        weeks.push(currentWeek);
    }

    // Filter month labels for positioning
    const finalMonthLabels = [];
    let lastWeekIndex = -1;
    monthLabels.forEach(label => {
        if (label.weekIndex > lastWeekIndex) {
            finalMonthLabels.push(label);
            lastWeekIndex = label.weekIndex;
        }
    });

    const uniqueMonthLabels = [];
    if (finalMonthLabels.length > 0) {
        uniqueMonthLabels.push(finalMonthLabels[0]);
        for (let i = 1; i < finalMonthLabels.length; i++) {
            if (finalMonthLabels[i].weekIndex > finalMonthLabels[i-1].weekIndex) {
                uniqueMonthLabels.push(finalMonthLabels[i]);
            }
        }
    }

    return { months: uniqueMonthLabels, weeks };
  }, [contribDays]);


  return (
    <div
      className={`font-sans antialiased transition-colors duration-500 text-gray-900 dark:text-white`}
      
    >
      <div className="w-full relative">
        {/* Header */}
        <div className="mb-8 text-left pt-2">
          <p className="text-xs uppercase tracking-widest text-gray-400">
            About
          </p>
          <h1 className="text-3xl sm:text-6xl font-extrabold mt-1 text-gray-900 dark:text-white">
            Me
          </h1>
        </div>

        {/* Grid container: left intro, right live activity */}
        <div className="grid gap-6 md:grid-cols-2 items-start">
          <div className="rounded-2xl backdrop-blur-md transition-transform transform">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-700 dark:text-gray-300">
                  Introduction
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {renderIntroText(profile.introduction)}
                </p>
              </div>
            </div>
          </div>

          {/* 🛑 RIGHT COLUMN FIX: Added overflow-hidden to prevent horizontal scroll 🛑 */}
          <div className="rounded-2xl p-6 md:-mt-35 backdrop-blur-md bg-transparent overflow-hidden">
            
            {/* Skills / Logo loop - Wrapper */}
            <div className="w-full mb-8 pt-3">
              <h4 className="text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                Skills
              </h4>
              <a href="https://www.upwork.com/freelancers/~01d2f1984d528e04dc?viewMode=1"
               className="text-xs pb-3 font-bold text-blue-600 hover:underline">
                Upwork Profile...
              </a>
              <div 
                className="w-full h-16 md:h-16 overflow-hidden relative border-y border-transparent py-1"
              >
                <LogoLoop
                  logos={techLogos}
                  speed={80}
                  direction="left"
                  logoHeight={48} 
                  gap={80}
                  pauseOnHover
                />
              </div>
            </div>
            {/* End of Logo Loop Fix */}
            
            {/* Cursor Status (Adjusted margin top for spacing) */}
            <div className="flex items-center gap-3 mt-4">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-sm text-xs font-medium ${
                  cursorStatus === "Online"
                    ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : cursorStatus === "Offline"
                    ? "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300"
                    : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-sm ${
                    cursorStatus === "Online"
                      ? "bg-green-500 animate-pulse"
                      : cursorStatus === "Offline"
                      ? "bg-gray-500"
                      : "bg-red-500"
                  }`}
                />
                {cursorStatus}
              </div>
            </div>
            

            {/* stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-center md:text-left">
              <div className="rounded-lg p-3 bg-none border border-white/5">
                <div className="text-xs text-gray-500 uppercase">TCT</div>
                <div className="mt-2 text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-300">
                  {totalTimeToday}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  {lastRequestedDate}
                </div>
              </div>

              <div className="rounded-lg p-3 bg-transparent dark:bg-none border border-white/5">
                <div className="text-xs text-gray-500 uppercase">Current</div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-[10px]  text-wrap  text-center justify-center text-break-words">
                        {currentProject}
                      </div>
                      <div className="text-[10px] text-gray-500 text-wrap">
                        {lastActivityAt
                          ? toLocalTimeString(lastActivityAt / 1000)
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>
                {cursorStatus === "Online" && timeToOffline > 0 && (
                  <div className="mt-2 text-[11px] text-rose-500 font-mono">
                    Inactivity: {formatCountdown(timeToOffline)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- Block Chart & Details Section --- */}
        <div className="pt-3 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Project Breakdown
            </h4>
            <button
              onClick={() => setShowProjectDetails((prev) => !prev)}
              className="text-xs text-indigo-500 hover:text-indigo-400 transition-colors"
            >
              {showProjectDetails ? "Hide Details" : "Show Details"}
            </button>
          </div>

          {topProjects.length === 0 ? (
            <div className="text-xs text-gray-500">No activity recorded today</div>
          ) : (
            <>
              {/* Block Chart */}
              <div className="flex w-full h-8 rounded-lg overflow-hidden border border-white/10 shadow-lg">
                {topProjects.map((p, idx) => {
                  const widthPct = (p.duration / totalDuration) * 100;
                  const color = BLOCK_COLORS[idx % BLOCK_COLORS.length];
                  const label = `${p.project} (${secondsToHuman(Math.round(p.duration))})`;

                  return (
                    <div
                      key={p.project}
                      className={`h-full ${color} transition-all duration-500 ease-out flex items-center justify-center relative group`}
                      style={{ width: `${widthPct}%`, minWidth: '10px' }}
                      title={label}
                    >
                      <span
                        className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/90 overflow-hidden px-1 pointer-events-none"
                        style={{ opacity: widthPct > 15 ? 1 : 0, transition: 'opacity 300ms' }}
                      >
                        {p.project}
                      </span>
                      <div className='absolute bottom-full mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10'>
                          {label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detailed Project List (Conditional Display) */}
              {showProjectDetails && (
                <div className="mt-4 space-y-2 p-3 border border-white/10 rounded-lg bg-white/5 dark:bg-black/10">
                  {topProjects.map((p, idx) => {
                    const widthPct = Math.max(
                      6,
                      Math.round((p.duration / totalDuration) * 100)
                    );
                    const color = GRADIENT_COLORS[idx % GRADIENT_COLORS.length];

                    return (
                      <div key={p.project} className="flex items-center gap-3">
                        <div className="w-28 text-xs text-gray-600 dark:text-gray-400 truncate">
                          {p.project}
                        </div>
                        <div className="flex-1 bg-white/5 rounded-sm h-3 overflow-hidden relative">
                          <div
                            className={`absolute left-0 top-0 h-3 rounded-sm bg-gradient-to-r ${color}`}
                            style={{
                              width: `${widthPct}%`,
                              transition: "width 600ms ease",
                            }}
                            title={`${secondsToHuman(Math.round(p.duration))}`}
                          />
                        </div>
                        <div className="w-16 text-xs text-right font-semibold text-gray-500 dark:text-gray-300">
                          {secondsToHuman(Math.round(p.duration))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
        {/* --- End of Block Chart & Details Section --- */}

    {/* --- Full Teal Criss-Cross Heatmap Section --- */}
<div className="pt-3 mb-10 rounded-2xl backdrop-blur-md bg-none">
  <div className="flex items-center justify-between mb-3">
    <h4 className="text-sm font-bold text-teal-600 dark:text-teal-400">
      GitHub Activity
    </h4>
    <div className="text-xs text-gray-500">
      {contribLoading ? "Loading..." : `${contribTotal || 0} contributions`}
    </div>
  </div>

  {!contribLoading && graphData.weeks.length > 0 && (
    <div className="p-3 rounded-lg bg-black/5 dark:bg-black/20 border border-teal-500/10">
      {/* Scrollable Container */}
      <div className="flex overflow-x-auto pb-1 relative hide-scrollbar-graph">
        
        {/* Month Labels */}
        <div className="flex absolute top-0 left-0 right-0 h-4">
          {graphData.months.map((month, index) => (
            <div
              key={month.label + index}
              className="absolute text-[10px] font-medium text-teal-700/60 dark:text-teal-300/40"
              style={{
                left: `${month.weekIndex * (cellSize + cellGap)}px`,
              }}
            >
              {month.label}
            </div>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="flex mt-5">
          {/* Vertical Weekday Labels */}
          <div className="flex flex-col items-center flex-shrink-0 mr-2">
            {["", "Mon", "", "Wed", "", "Fri", ""].map((day, i) => (
              <div 
                key={i} 
                className="text-[9px] font-bold text-teal-800/50 dark:text-teal-200/30" 
                style={{ height: weekdayLabelLineHeight, lineHeight: weekdayLabelLineHeight }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Columns (Weeks) */}
          <div className="flex flex-shrink-0" style={{ gap: `${cellGap}px` }}>
            {graphData.weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col" style={{ gap: `${cellGap}px` }}>
                {week.map((slot, dIdx) => {
                  if (!slot) return (
                    <div key={dIdx} style={{ width: cellSize, height: cellSize }} className="opacity-0" />
                  );
                  
                  const count = Number(slot.contributionCount || 0);
                  let cellColor;

                  if (count <= 0) {
                    // Criss-cross pattern for empty days
                    const isAlt = (wIdx + dIdx) % 2 === 0;
                    cellColor = isAlt 
                      ? "rgba(20, 184, 166, 0.05)" // Very faint teal
                      : "rgba(20, 184, 166, 0.15)"; // Slightly darker teal
                  } else {
                    // Teal scale for active days
                    if (count <= 3) cellColor = "#2dd4bf"; // Teal 400
                    else if (count <= 7) cellColor = "#14b8a6"; // Teal 500
                    else if (count <= 15) cellColor = "#0d9488"; // Teal 600
                    else cellColor = "#0f766e"; // Teal 700
                  }

                  return (
                    <div
                      key={dIdx}
                      title={`${slot.date}: ${count} contributions`}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: cellColor,
                      }}
                      className="rounded-[1px] transition-transform duration-200 hover:scale-150 hover:z-10 cursor-crosshair"
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Teal Legend */}
      <div className="flex items-center justify-end gap-1 mt-3">
        <span className="text-[10px] text-gray-500 mr-1">Less</span>
        <div style={{ width: cellSize, height: cellSize }} className="bg-teal-900/10 rounded-sm" />
        <div style={{ width: cellSize, height: cellSize }} className="bg-teal-400 rounded-sm" />
        <div style={{ width: cellSize, height: cellSize }} className="bg-teal-600 rounded-sm" />
        <div style={{ width: cellSize, height: cellSize }} className="bg-teal-800 rounded-sm" />
        <span className="text-[10px] text-gray-500 ml-1">More</span>
      </div>
    </div>
  )}
</div>
        {/* --- End of Updated Contributions Heatmap Section --- */}
      </div>
    </div>
  );
}