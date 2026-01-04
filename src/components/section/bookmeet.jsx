"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getCalApi } from "@calcom/embed-react"; 

// ===============================================
// 1. Core Component: Portal 
// ===============================================
const Portal = ({ children, wrapperId = "react-portal-wrapper" }) => {
    const [wrapperElement, setWrapperElement] = useState(null);

    useEffect(() => {
        let element = document.getElementById(wrapperId);
        let systemCreated = false;

        if (!element) {
            systemCreated = true;
            element = document.createElement('div');
            element.setAttribute('id', wrapperId);
            document.body.appendChild(element);
        }
        setWrapperElement(element);

        return () => {
            if (systemCreated && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        };
    }, [wrapperId]);

    if (wrapperElement === null) return null;
    return createPortal(children, wrapperElement);
};

// ===============================================
// 2. SVG Icons
// ===============================================
const ChevronDownIcon = ({ size = 14, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const PhoneCallIcon = ({ size = 18, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-3.67-2.94 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// ===============================================
// 3. Sub-Component: QualifierModal 
// ===============================================
const QualifierModal = ({ isOpen, onClose, role, setRole, intent, setIntent, onContinue }) => {
    const roleOptions = [
        { value: '', label: 'Identify your organization...' },
        { value: 'Hiring/HR', label: 'Talent Acquisition / HR Leadership' },
        { value: 'Content/Consultant', label: 'Agency / Creative Partnership' },
        { value: 'Founder/Other', label: 'Founder / Executive Stakeholder' },
    ];

    const intentOptions = [
        { value: '', label: 'Define our primary objective...' },
        { value: 'Job', label: 'Strategic Full-time Placement' },
        { value: 'Freelancing', label: 'Project-based Consultation' },
        { value: 'None', label: 'General Technical Networking' },
    ];

    if (!isOpen) return null;

    return (
        <Portal>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 w-full max-w-[340px] shadow-2xl transition-all"> 
                    <div className="mb-5 flex justify-between items-start">
                        <div>
                            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Consultation Context</h2>
                            <p className="text-[10px] text-zinc-500 mt-1">Help me prepare for our session.</p>
                        </div>
                        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition p-1">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mb-1.5 uppercase tracking-tighter">Your Role</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full text-xs py-2 px-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded focus:ring-1 focus:ring-zinc-400 outline-none appearance-none cursor-pointer"
                            >
                                {roleOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-white dark:bg-zinc-900">{opt.label}</option>)}
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-[68%] text-zinc-400 pointer-events-none"/>
                        </div>

                        <div className="relative">
                            <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mb-1.5 uppercase tracking-tighter">Objective</label>
                            <select
                                value={intent}
                                onChange={(e) => setIntent(e.target.value)}
                                className="w-full text-xs py-2 px-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded focus:ring-1 focus:ring-zinc-400 outline-none appearance-none cursor-pointer"
                            >
                                {intentOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-white dark:bg-zinc-900">{opt.label}</option>)}
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-[68%] text-zinc-400 pointer-events-none"/>
                        </div>
                    </div>
                    
                    <button
                        onClick={onContinue}
                        disabled={!role || !intent}
                        className="w-full mt-6 py-2.5 text-[11px] font-bold text-white dark:text-zinc-900 rounded bg-zinc-900 dark:bg-white hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-widest shadow-lg"
                    >
                        Proceed to Calendar
                    </button>
                </div>
            </div>
        </Portal>
    );
};

// ===============================================
// 4. Sub-Component: CalEmbedModal 
// ===============================================
const CAL_CDN = "https://cdn.cal.com/embed/embed.js";

const CalEmbedModal = ({ isOpen, onClose, calConfigData, CAL_LINK, NAMESPACE, isReady }) => {
    const embedRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [embedError, setEmbedError] = useState(null);

    const safeParse = (str) => { try { return JSON.parse(str); } catch { return {}; } };

    const injectScript = (src) => {
        return new Promise((resolve, reject) => {
            if (typeof window === 'undefined') return reject(new Error('Not in browser'));
            if (window.cal || document.querySelector(`script[src="${src}"]`)) return resolve();
            const s = document.createElement('script');
            s.src = src; s.async = true;
            s.onload = () => resolve();
            s.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(s);
        });
    };

    useEffect(() => {
        let mounted = true;
        async function initEmbed() {
            if (!isOpen) return;
            setEmbedError(null);
            setLoading(true);
            if (embedRef.current) embedRef.current.innerHTML = '';

            try {
                try {
                    await getCalApi({ namespace: NAMESPACE });
                    if (!mounted) return;
                    const cal = window.cal || (await getCalApi({ namespace: NAMESPACE }));
                    if (cal && typeof cal === 'function') {
                        cal("ui", { "cssVarsPerTheme": { "light": { "cal-brand": "#111827" }, "dark": { "cal-brand": "#ffffff" } }, "layout": "month_view" });
                        cal("inline", { elementOrSelector: embedRef.current, calLink: CAL_LINK, config: safeParse(calConfigData) });
                        setLoading(false);
                        return;
                    }
                } catch (e) { console.warn("Fallback to CDN", e); }

                await injectScript(CAL_CDN);
                if (!mounted) return;
                const cal = window.cal;
                if (!cal) throw new Error('Global cal missing');
                cal("inline", { elementOrSelector: embedRef.current, calLink: CAL_LINK, config: safeParse(calConfigData) });
                setLoading(false);
            } catch (err) {
                setEmbedError(err.message);
                setLoading(false);
            }
        }
        initEmbed();
        return () => { mounted = false; };
    }, [isOpen, NAMESPACE, isReady, calConfigData, CAL_LINK]);

    return (
        <Portal>
            {isOpen ? (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
                <div className="bg-transparent rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                    <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900">
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Secure Session Terminal</span>
                            <button onClick={onClose} className="text-gray-500 hover:text-black transition p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </div>
                        <div className="flex-grow overflow-y-auto bg-transparent" style={{ minHeight: '500px' }}>
                            {loading && <div className="flex items-center justify-center h-full text-gray-400 font-medium">Loading secure interface...</div>}
                            <div ref={embedRef} className="cal-embed-container w-full h-full" style={{ display: embedError ? 'none' : 'block' }} />
                        </div>
                    </div>
                </div>
            ) : null}
        </Portal>
    );
};

// ===============================================
// 5. Main Component (BookingApp)
// ===============================================
export default function BookingApp() {
    const [role, setRole] = useState('');
    const [intent, setIntent] = useState('');
    const [step, setStep] = useState(null); 
    const [isCalReady, setIsCalReady] = useState(false);

    const CAL_LINK = "ashmeet07/30min"; 
    const NAMESPACE = "30min";
    
    useEffect(() => {
        let mounted = true;
        (async function () {
            try {
                await getCalApi({ "namespace": NAMESPACE });
                if (mounted) setIsCalReady(true);
            } catch (e) {
                if (mounted) setIsCalReady(true);
            }
        })();
        return () => { mounted = false; };
    }, [NAMESPACE]);

    const handleCloseModal = useCallback(() => { 
        setStep(null); 
        setRole('');
        setIntent('');
    }, []);
    
    const handleOpenModal = () => { setStep('qualifier'); }; 
    const handleQualifierContinue = useCallback(() => {
        if (role && intent) setStep('cal_modal');
    }, [role, intent]);
    
    const calConfigData = JSON.stringify({
        layout: "month_view",
        theme: "auto",
        custom: { role, intent },
    });

    return (
        <div className="flex flex-col items-center justify-center py-12 px-6 bg-transparent dark:text-white" id="Hire-Me">
            <div className="max-w-[540px] w-full text-center space-y-6">
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
                    Let’s build something <span className="text-zinc-400 dark:text-zinc-500 italic">meaningful</span> together.
                </h1>
                
                <div className="space-y-3 px-4">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        I partner with founders and startups to design modern, high-performance web products. 
                        Let's align on project scope and strategic technical decisions.
                    </p>
                    <p className="text-[12px] text-zinc-500 dark:text-zinc-500 italic leading-relaxed">
                        "High-bandwidth strategy session. Roadmap clarity. No pressure."
                    </p>
                </div>
                
                <div className="flex flex-col items-center space-y-5 pt-4">
                    <button
                        onClick={() => setStep('qualifier')}
                        disabled={!isCalReady}
                        className="group flex items-center space-x-2.5 px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 font-bold text-sm disabled:opacity-50" 
                    >
                        <PhoneCallIcon />
                        <span>Initiate Discovery Call</span>
                    </button>

                    <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-600">
                        <span>30m Strategy</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-800" />
                        <span>Remote</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-800" />
                        <span>Zero Commitment</span>
                    </div>
                </div>
            </div>

            <div className="mt-16 text-center opacity-30 group hover:opacity-100 transition-opacity">
                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-500">Ashmeet Singh — Solutions Architect</p>
            </div>
            
            <QualifierModal 
                isOpen={step === 'qualifier'}
                onClose={() => setStep(null)}
                role={role} setRole={setRole}
                intent={intent} setIntent={setIntent}
                onContinue={handleQualifierContinue} 
            />

          <CalEmbedModal
                isOpen={step === 'cal_modal'}
                onClose={handleCloseModal}
                calConfigData={calConfigData}
                CAL_LINK={CAL_LINK}
                NAMESPACE={NAMESPACE}
                isReady={isCalReady}
            />
        </div>
    );
}