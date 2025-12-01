'use client';
import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import data from "@/lib/data.json";
import LogoLoop from "@/components/ui/LogoLoop";
import { TechIconMap } from '@/lib/imagepath';
// HeatmapChart removed as requested

const WAKATIME_API_BASE_URL = "https://working-time.vercel.app";
const INACTIVITY_BUFFER_MINUTES = 5; // 5-minute buffer
const POLL_INTERVAL_MS = 60000; // 60s

const { profile, external, skills } = data;
const GITHUB_USERNAME = profile.githubUsername;
const heatmapUrlTemplate = external.heatmapUrlTemplate;

// Helper: bold text renderer (unchanged)
const renderIntroText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.substring(2, part.length - 2)}</strong>;
        }
        return part;
    });
};

function secondsToHuman(totalSec) {
    if (!Number.isFinite(totalSec) || totalSec <= 0) return '0s';
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
        return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
        return '';
    }
};

const buildEndpoint = (base, path) => {
    const b = (base || '').replace(/\/+$/, '');
    const p = (path || '').replace(/^\/+/, '');
    return `${b}/${p}`;
};

// date helpers
const parseISO = (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d)) {
        const parts = iso.split('T')[0].split('-').map(Number);
        if (parts.length >= 3) return new Date(parts[0], parts[1] - 1, parts[2]);
        return new Date(iso);
    }
    return d;
};

const daysInMonth = (year, monthZeroBased) => {
    return new Date(year, monthZeroBased + 1, 0).getDate();
};

const monthKeyFromDate = (dateStr) => {
    const d = parseISO(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const formatMonthLabel = (yyyymm) => {
    const [y, m] = yyyymm.split('-').map(Number);
    try {
        const d = new Date(y, m - 1, 1);
        return d.toLocaleString(undefined, { month: 'short', year: 'numeric' });
    } catch {
        return yyyymm;
    }
};

const dayKey = (iso) => iso.split('T')[0];

// weekday labels (Sunday..Saturday)
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function About() {
    const [totalTimeToday, setTotalTimeToday] = useState("Loading...");
    const [cursorStatus, setCursorStatus] = useState("Loading...");
    const [timeToOffline, setTimeToOffline] = useState(null); // seconds
    const [currentProject, setCurrentProject] = useState("—");
    const [lastRequestedDate, setLastRequestedDate] = useState(null);
    const [lastActivityAt, setLastActivityAt] = useState(null);
    const [dayItems, setDayItems] = useState([]); // raw payload items for timeline

    // contributions state
    const [contribDays, setContribDays] = useState([]); // array of { date, contributionCount, color }
    const [contribTotal, setContribTotal] = useState(null);
    const [contribLoading, setContribLoading] = useState(false);

    const pollRef = useRef(null);
    const countdownRef = useRef(null);
    const abortControllerRef = useRef(null);

    const getTodayDate = useCallback(() => {
        return new Date().toISOString().split('T')[0];
    }, []);

    const fetchWakaTimeData = useCallback(async () => {
        if (abortControllerRef.current) {
            try { abortControllerRef.current.abort(); } catch (e) { /* ignore */ }
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const today = getTodayDate();
        setLastRequestedDate(today);

        const apiEndpoint = buildEndpoint(WAKATIME_API_BASE_URL, `/api/durations`) + `?date=${today}`;

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
                const totalSec = arr.reduce((acc, it) => acc + (Number(it.duration) || 0), 0);
                setTotalTimeToday(secondsToHuman(totalSec));
            }

            const items = Array.isArray(payload?.data) ? payload.data : [];
            setDayItems(items);

            const lastRecord = items.length ? items[items.length - 1] : null;
            if (lastRecord && Number.isFinite(Number(lastRecord.time))) {
                const lastTimeMs = Number(lastRecord.time) * 1000;
                setLastActivityAt(lastTimeMs);

                const offlineThresholdMs = lastTimeMs + INACTIVITY_BUFFER_MINUTES * 60 * 1000;
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
            if (err?.name === 'AbortError') return;
            console.error("Error fetching WakaTime data:", err);
            setCursorStatus("Error");
            setTotalTimeToday("N/A");
            setTimeToOffline(0);
            setCurrentProject("—");
            setDayItems([]);
            setLastActivityAt(null);
        } finally {
            if (abortControllerRef.current === controller) abortControllerRef.current = null;
        }
    }, [getTodayDate]);

    const fetchContributions = useCallback(async (username) => {
        if (!username) return;
        setContribLoading(true);
        try {
            const res = await fetch(`/api/contribs?username=${encodeURIComponent(username)}`);
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const json = await res.json();
            const days = Array.isArray(json.days) ? json.days : [];
            const normalized = days.map(d => ({
                date: dayKey(d.date),
                contributionCount: Number(d.contributionCount || 0),
                color: d.color || null,
            }));
            normalized.sort((a, b) => new Date(a.date) - new Date(b.date));
            setContribDays(normalized);
            setContribTotal(json.total ?? normalized.reduce((s, d) => s + d.contributionCount, 0));
        } catch (err) {
            console.error("Error fetching contributions:", err);
            setContribDays([]);
            setContribTotal(null);
        } finally {
            setContribLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWakaTimeData();
        pollRef.current = setInterval(fetchWakaTimeData, POLL_INTERVAL_MS);
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
            if (abortControllerRef.current) {
                try { abortControllerRef.current.abort(); } catch (e) { /* ignore */ }
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
        if (cursorStatus === "Online" && timeToOffline !== null && timeToOffline > 0) {
            countdownRef.current = setInterval(() => {
                setTimeToOffline(prev => {
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
            if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
        };
    }, [cursorStatus, timeToOffline, fetchWakaTimeData]);

    // memo logos
    const techLogos = useMemo(() => {
        return skills.techLogos.map(item => {
            const logoUrl = TechIconMap[item.icon];
            const logoNode = (logoUrl && item.name) ? (
                <img key={item.name} src={logoUrl} alt={item.name} className="w-full h-full object-contain" />
            ) : null;
            return { ...item, node: logoNode };
        });
    }, [skills.techLogos]);

    const formatCountdown = (seconds) => {
        if (!Number.isFinite(seconds) || seconds <= 0) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // top projects
    const topProjects = useMemo(() => {
        if (!Array.isArray(dayItems) || dayItems.length === 0) return [];
        const map = {};
        for (const it of dayItems) {
            const p = it.project || 'unknown';
            map[p] = (map[p] || 0) + (Number(it.duration) || 0);
        }
        const arr = Object.entries(map).map(([project, duration]) => ({ project, duration }));
        arr.sort((a, b) => b.duration - a.duration);
        return arr.slice(0, 5);
    }, [dayItems]);

    const maxDuration = useMemo(() => {
        if (!topProjects.length) return 1;
        return Math.max(...topProjects.map(p => p.duration), 1);
    }, [topProjects]);

    // Build months data properly: for each month found in contribDays create full calendar grid
    const months = useMemo(() => {
        if (!contribDays || contribDays.length === 0) return [];
        const map = {};
        for (const d of contribDays) {
            const key = monthKeyFromDate(d.date);
            if (!map[key]) map[key] = {};
            map[key][d.date] = d; // store by exact date string
        }

        const order = Object.keys(map).sort((a, b) => {
            const [ay, am] = a.split('-').map(Number);
            const [by, bm] = b.split('-').map(Number);
            if (ay === by) return am - bm;
            return ay - by;
        });

        const out = order.map((mKey) => {
            const [y, m] = mKey.split('-').map(Number);
            const year = y;
            const monthIndex = m - 1;
            const dim = daysInMonth(year, monthIndex);
            const firstDay = new Date(year, monthIndex, 1);
            const firstWeekday = firstDay.getDay(); // 0 (Sun) .. 6 (Sat)
            const totalSlots = firstWeekday + dim;
            const weeksCount = Math.ceil(totalSlots / 7);

            // weeksCount columns, each column has 7 rows (Sun..Sat)
            const weeks = Array.from({ length: weeksCount }, () => Array(7).fill(null));

            for (let day = 1; day <= dim; day++) {
                const date = new Date(year, monthIndex, day);
                const weekday = date.getDay(); // 0..6
                const absoluteIndex = firstWeekday + (day - 1);
                const weekIndex = Math.floor(absoluteIndex / 7);
                const iso = date.toISOString().split('T')[0];
                const entry = map[mKey][iso] || null;
                weeks[weekIndex][weekday] = entry ? { ...entry } : { date: iso, contributionCount: 0, color: null };
            }

            return {
                key: mKey,
                label: formatMonthLabel(mKey),
                year,
                monthIndex,
                weeks,
            };
        });

        return out;
    }, [contribDays]);

    // color fallback
    const colorForCount = (count) => {
        if (count <= 0) return '#ebedf0';
        if (count <= 3) return '#c6e48b';
        if (count <= 7) return '#7bc96f';
        if (count <= 15) return '#239a3b';
        return '#196127';
    };

    // day cell size (tweak if needed)
    const cellSize = 14; // px

    return (
        <div className={`font-sans antialiased transition-colors duration-500 text-gray-900 dark:text-white`}>
            <div className="w-full relative">

                {/* Header */}
                <div className="mb-8 text-left pt-2" id="about">
                    <p className="text-xs  uppercase tracking-widest text-gray-400">
                        About
                    </p>
                    <h1 className="text-3xl sm:text-6xl font-extrabold mt-1 text-gray-900 dark:text-white">
                        Me
                    </h1>
                </div>

                {/* Grid container: left intro, right live activity (unchanged) */}
                <div className="grid gap-6 md:grid-cols-2 items-start">
                    <div className="rounded-2xl  backdrop-blur-md   transition-transform transform ">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold mb-2 text-gray-700 dark:text-gray-300">Introduction</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {renderIntroText(profile.introduction)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl p-6 backdrop-blur-md bg-gradient-to-b from-white/10 to-white/5 dark:from-black/20 dark:to-black/10 ">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">Dash</h3>
                            <div className="flex items-center gap-3">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-sm text-xs font-medium ${cursorStatus === 'Online' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' : cursorStatus === 'Offline' ? 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                                    <span className={`w-2 h-2 rounded-sm ${cursorStatus === 'Online' ? 'bg-green-500 animate-pulse' : cursorStatus === 'Offline' ? 'bg-gray-500' : 'bg-red-500'}`} />
                                    {cursorStatus}
                                </div>
                            </div>
                        </div>

                        {/* stats grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-center md:text-left">
                            <div className="rounded-lg p-3 bg-white/6 dark:bg-white/4 border border-white/5">
                                <div className="text-xs text-gray-500 uppercase">TCT</div>
                                <div className="mt-2 text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-300">
                                    {totalTimeToday}
                                </div>
                                <div className="text-[10px] text-gray-500 mt-1">{lastRequestedDate}</div>
                            </div>

                            <div className="rounded-lg p-3 bg-white/6 dark:bg-white/4 border border-white/5">
                                <div className="text-xs text-gray-500 uppercase">Current</div>
                                <div className="mt-2 flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-block w-3 h-3 rounded-sm ${cursorStatus === 'Online' ? 'bg-green-500' : cursorStatus === 'Offline' ? 'bg-gray-500' : 'bg-red-500'}`} />
                                        <div>
                                            <div className="text-xs  font-semibold">{currentProject}</div>
                                            <div className="text-[11px] text-gray-500">{lastActivityAt ? toLocalTimeString(lastActivityAt / 1000) : '—'}</div>
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

                        {/* Projects mini-timeline */}
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-xs text-gray-500">Top {topProjectsLength(topProjects => topProjects.length)}</div>
                            </div>

                            <div className="space-y-2 ">
                                {topProjects.length === 0 ? (
                                    <div className="text-xs text-gray-500">No activity recorded</div>
                                ) : (
                                    topProjects.map((p, idx) => {
                                        const widthPct = Math.max(6, Math.round((p.duration / maxDuration) * 100));
                                        const colors = ['from-indigo-400 to-cyan-400', 'from-pink-400 to-rose-400', 'from-emerald-400 to-lime-400', 'from-yellow-400 to-orange-400', 'from-sky-400 to-indigo-400'];
                                        const color = colors[idx % colors.length];
                                        return (
                                            <div key={p.project} className="flex items-center gap-3">
                                                <div className="w-28 text-xs text-gray-600 dark:text-gray-400">{p.project}</div>
                                                <div className="flex-1 bg-white/5 rounded-sm h-3 overflow-hidden relative">
                                                    <div
                                                        className={`absolute left-0 top-0 h-3 rounded-sm bg-gradient-to-r ${color}`}
                                                        style={{ width: `${widthPct}%`, transition: 'width 600ms ease' }}
                                                        title={`${secondsToHuman(Math.round(p.duration))}`}
                                                    />
                                                </div>
                                                <div className="w-16 text-xs text-right text-gray-500">{secondsToHuman(Math.round(p.duration))}</div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full mt-6">
                    {/* Skills / Logo loop */}
                    <div className="mt-6">
                        <h4 className="text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">Skills</h4>
                        <div style={{ height: "64px", overflow: "hidden" }}>
                            <LogoLoop logos={techLogos} speed={80} direction="left" logoHeight={48} gap={80} pauseOnHover />
                        </div>
                    </div>
                </div>

                {/* Contributions summary */}
                <div className="mb-10 rounded-2xl backdrop-blur-md bg-white/8 dark:bg-black/10 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">GitHub Activity</h4>
                            <div className="text-xs text-gray-500">Contributions  :  {contribLoading ? 'Loading...' : (contribTotal !== null ? `${contribTotal} total` : '—')}</div>
                        </div>
                    </div>

                    {contribLoading && <div className="text-xs text-gray-500">Loading contributions…</div>}

                    {!contribLoading && (!contribDays || contribDays.length === 0) && (
                        <div className="text-xs text-gray-500">No contribution data available</div>
                    )}

                    {!contribLoading && months.length > 0 && (
                        <>
                            {/* Horizontal months container */}
                            <div className="overflow-x-auto py-2">
                                <div className="flex  items-start">
                                    {months.map((month) => (
                                        <div key={month.key} className="flex-none w-auto p-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="text-xs font-medium text-gray-600 dark:text-gray-300">{month.label}</div>
                                            </div>

                                            <div className="p-3 rounded-lg bg-gradient-to-b from-white/3 to-white/5 dark:from-black/20 dark:to-black/10">
                                                <div className="flex gap-1">
                                                    {/* Left: vertical weekday labels (y-axis) */}
                                                    <div className="flex flex-col items-center">
                                                        {WEEKDAY_LABELS.map((lbl, i) => (
                                                            <div key={i} className="text-[10px] text-gray-400 h-[14px] leading-[14px]">{lbl}</div>
                                                        ))}
                                                    </div>

                                                    {/* Right: week columns */}
                                                    <div className="flex gap-1 items-start">
                                                        {month.weeks.map((week, wIdx) => (
                                                            <div key={wIdx} className="flex flex-col gap-1">
                                                                {week.map((slot, dow) => {
                                                                    if (!slot) {
                                                                        return <div key={dow} style={{ width: cellSize, height: cellSize }} className="rounded-xs opacity-0" />;
                                                                    }
                                                                    const count = Number(slot.contributionCount || 0);
                                                                    const color = slot.color || colorForCount(count);
                                                                    return (
                                                                        <div
                                                                            key={dow}
                                                                            title={`${slot.date}: ${count} contribution${count !== 1 ? 's' : ''}`}
                                                                            style={{ width: cellSize, height: cellSize, backgroundColor: color }}
                                                                            className="rounded-sm transform transition-all duration-150 hover:scale-110 shadow-sm"
                                                                        />
                                                                    );
                                                                })}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

/* Helper that returns topProjects length inside JSX where you might need it.
   (Small local helper to avoid adding additional state just for the small header text) */
function topProjectsLength(fn) {
    try {
        return fn();
    } catch {
        return '';
    }
}
