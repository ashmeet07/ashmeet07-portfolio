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

    if (wrapperElement === null) {
        return null;
    }

    return createPortal(children, wrapperElement);
};

// ===============================================
// 2. SVG Icons
// ===============================================
const ChevronDownIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

const PhoneCallIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-3.67-2.94 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
);


// ===============================================
// 3. Sub-Component: QualifierModal 
// (Step 1: User Input - Aesthetic Refinements)
// ===============================================
const QualifierModal = ({ isOpen, onClose, role, setRole, intent, setIntent, onContinue }) => {
    
    const roleOptions = [
        { value: '', label: 'Select your primary role...' },
        { value: 'Hiring/HR', label: 'Hiring / HR / Talent Acquisition' },
        { value: 'Content/Consultant', label: 'Content Creation / Consultation / Agency' },
        { value: 'Founder/Other', label: 'Founder / CEO / Other Business Stakeholder' },
    ];

    const intentOptions = [
        { value: '', label: 'Select your call goal...' },
        { value: 'Job', label: 'Full-time / Part-time Job Opportunity' },
        { value: 'Freelancing', label: 'Freelancing / Project Basis' },
        { value: 'None', label: 'General Networking / Quick Discussion' },
    ];

    const isReadyToContinue = role && role !== '' && intent && intent !== '';

    return (
        <Portal>
            {isOpen ? (
                // Backdrop 
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 transition-opacity backdrop-blur-sm duration-300 animate-fade-in ">
                    
                    {/* MODAL WINDOW: Increased shadow and border thickness for premium feel */}
                    <div className="bg-white rounded-xl p-4 w-full max-w-sm border-1 border-black shadow-3xl transform scale-100 transition-all duration-300 hover:shadow-4xl "> 
                        
                        {/* Header Section */}
                        <div className="mb-6 flex justify-between items-start">
                            <span>
                                <h2 className="text-x font-semibold text-gray-900 tracking-tight mb-1">
                                    Tell me about yourself ?
                                </h2>
                            </span>
                            {/* UPDATED CLOSE BUTTON STYLE */}
                            <button 
                                type="button" 
                                onClick={onClose} 
                                // Added boxy shadow, changed to rounded-lg, and updated colors for theme adaptability
                                className="text-gray-700 bg-gray-50 border border-gray-200 shadow-md hover:shadow-lg hover:bg-gray-200 hover:text-gray-900 rounded-lg p-1 transition duration-150"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </div>

                        {/* Dropdowns Container */}
                        <div className="space-y-5"> {/* Increased vertical spacing */}
                            
                            {/* Role Dropdown */}
                            <div className="relative">
                                <label htmlFor="role-select" className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-widest">
                                    Your Role
                                </label>
                                <select
                                    id="role-select"
                                    required
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    // Refined focus ring and hover effect
                                    className="block w-full text-xs py-1 px-4 bg-gray-50 border border-gray-300 text-gray-800 rounded-sm shadow-sm
                                     focus:ring-2 focus:ring-gray-600 focus:border-gray-600 transition duration-150 appearance-none font-medium cursor-pointer outline-none hover:border-gray-400" 
                                >
                                    {roleOptions.map(option => (
                                        <option key={option.value} value={option.value} className='bg-white text-gray-900'>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDownIcon size={20} className="absolute right-3 top-[60%] transform -translate-y-1/2 text-black pointer-events-none"/>
                            </div>

                            {/* Intent Dropdown */}
                            <div className="relative">
                                <label htmlFor="intent-select" className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-widest">
                                    Goal for the Call
                                </label>
                                <select
                                    id="intent-select"
                                    required
                                    value={intent}
                                    onChange={(e) => setIntent(e.target.value)}
                                    // Refined focus ring and hover effect
                                    className="block w-full text-xs py-1 px-4 pr-10 bg-gray-50 border border-gray-300 text-gray-800 rounded-sm shadow-sm
                                     focus:ring-2 focus:ring-gray-600 focus:border-gray-600 transition duration-150 appearance-none font-medium cursor-pointer outline-none hover:border-gray-400" 
                                >
                                    {intentOptions.map(option => (
                                        <option key={option.value} value={option.value} className='bg-white text-gray-900 rounded-none'>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDownIcon size={20} className="absolute right-3 top-[60%] transform -translate-y-1/2 text-gray-500 pointer-events-none"/>
                            </div>
                            
                        </div>
                        
                        {/* Continue Button: Added subtle gradient for depth */}
                        <div className="">
                            <button
                                type="button"
                                onClick={onContinue}
                                disabled={!isReadyToContinue}
                                className="w-full flex items-center justify-center space-x-2 p-1 text-base font-bold text-white rounded-lg transition duration-300 shadow-xl 
                                bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99]" 
                            >
                                Continue to Schedule
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </Portal>
    );
};

// ===============================================
// 4. Sub-Component: CalEmbedModal 
// (Step 2: Cal.com Iframe Display - robust with fallback)
// ===============================================

const CAL_CDN = "https://cdn.cal.com/embed/embed.js";

const CalEmbedModal = ({ isOpen, onClose, calConfigData, CAL_LINK, NAMESPACE, isReady }) => {
    const embedRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [embedError, setEmbedError] = useState(null);

    // safe parse
    const safeParse = (str) => {
        try {
            return JSON.parse(str);
        } catch {
            return {};
        }
    };

    // helper to inject script (if needed)
    const injectScript = (src) => {
        return new Promise((resolve, reject) => {
            if (typeof window === 'undefined') return reject(new Error('Not in browser'));
            if (window.cal || document.querySelector(`script[src="${src}"]`)) {
                return resolve();
            }
            const s = document.createElement('script');
            s.src = src;
            s.async = true;
            s.onload = () => resolve();
            s.onerror = (e) => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(s);
        });
    };

    useEffect(() => {
        let mounted = true;
        let calInstance = null;

        async function initEmbed() {
            if (!isOpen) return;
            setEmbedError(null);
            setLoading(true);

            // clear previous content
            if (embedRef.current) embedRef.current.innerHTML = '';

            try {
                // 1) prefer getCalApi (react helper)
                try {
                    await getCalApi({ namespace: NAMESPACE });
                    if (!mounted) return;
                    // window.cal may exist after getCalApi
                    const cal = window.cal || (await getCalApi({ namespace: NAMESPACE }));
                    if (cal && typeof cal === 'function') {
                        cal("ui", { 
                            "cssVarsPerTheme": { "light": { "cal-brand": "#6b7280" }, "dark": { "cal-brand": "#9ca3af" } }, 
                            "hideEventTypeDetails": false, 
                            "layout": "month_view" 
                        });
                        cal("inline", {
                            elementOrSelector: embedRef.current,
                            calLink: CAL_LINK,
                            config: safeParse(calConfigData),
                        });
                        calInstance = cal;
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    // continue to fallback
                    console.warn("getCalApi failed, falling back to CDN script", e);
                }

                // 2) Fallback: inject CDN script
                await injectScript(CAL_CDN);
                if (!mounted) return;

                // wait a tick for global to appear
                const calGlobal = window.cal;
                if (!calGlobal || typeof calGlobal !== 'function') {
                    // try getCalApi one more time
                    try {
                        await getCalApi({ namespace: NAMESPACE });
                    } catch (_) {}
                }

                const cal = window.cal;
                if (!cal || typeof cal !== 'function') {
                    throw new Error('Cal embed is not available (global `cal` missing).');
                }

                cal("ui", { 
                    "cssVarsPerTheme": { "light": { "cal-brand": "#6b7280" }, "dark": { "cal-brand": "#9ca3af" } }, 
                    "hideEventTypeDetails": false, 
                    "layout": "month_view" 
                });
                cal("inline", {
                    elementOrSelector: embedRef.current,
                    calLink: CAL_LINK,
                    config: safeParse(calConfigData),
                });
                calInstance = cal;
                setLoading(false);
            } catch (err) {
                console.error("Cal embed error:", err);
                setEmbedError(err.message || String(err));
                setLoading(false);
            }
        }

        initEmbed();

        return () => {
            mounted = false;
            if (embedRef.current) embedRef.current.innerHTML = '';
            // NOTE: we intentionally do not remove injected script to avoid breaking other pages
        };
    }, [isOpen, NAMESPACE, isReady, calConfigData, CAL_LINK]);

    return (
        <Portal>
            {isOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 transition-opacity backdrop-blur-md duration-300 animate-fade-in ">
                    <div className="bg-transparent rounded-lg w-full max-w-4xl max-h-[95vh] shadow-3xl flex flex-col relative overflow-hidden transition-all duration-300">
                        <div className="p-1 border-b border-gray-200 flex justify-between items-center bg-white z-10">
                            <h2 className="text-xs font-extrabold text-gray-900 tracking-tight">Book Your 30-Minute Expert Session</h2>
                            <button type="button" onClick={onClose} className="text-gray-700 bg-gray-50 border border-gray-200 shadow-md hover:shadow-lg hover:bg-gray-200 hover:text-gray-900 rounded-lg p-1 transition duration-150" title="Close Scheduler">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </div>

                        <div className="flex-grow overflow-x-hidden w-full bg-transparent" style={{ minHeight: '400px' }}>
                            {loading && (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    Loading scheduler...
                                </div>
                            )}

                            {embedError && (
                                <div className="w-full h-full flex flex-col items-center justify-center text-center px-6">
                                    <div className="text-red-600 font-semibold mb-2">Scheduler failed to load</div>
                                    <div className="text-sm text-gray-600 mb-4">{embedError}</div>
                                    <div className="text-sm text-gray-500">Common causes: blocked script (CSP), network blocked to cdn.cal.com, or mixed-content (HTTP vs HTTPS). Check console for more details.</div>
                                </div>
                            )}

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
    
    // Initial setup of Cal.com API — robust
    useEffect(() => {
        let mounted = true;
        (async function () {
            try {
                await getCalApi({ "namespace": NAMESPACE });
                if (!mounted) return;
                setIsCalReady(true);
            } catch (e) {
                // If getCalApi fails, we don't consider the scheduler broken — we allow the modal to attempt CDN fallback
                console.warn("getCalApi init failed (will attempt CDN when opening modal)", e);
                if (!mounted) return;
                setIsCalReady(true); // still mark ready so user can open modal — embed will fallback to CDN
            }
        })();
        return () => { mounted = false; };
    }, [NAMESPACE]);

    // Reset function for closing modals
    const handleCloseModal = useCallback(() => { 
        setStep(null); 
        setRole('');
        setIntent('');
    }, []);
    
    const handleOpenModal = () => { setStep('qualifier'); }; 
    
    // Handler after step 1 is complete: opens the Cal.com Embed Modal
    const handleQualifierContinue = useCallback(() => {
        if (role && intent) { 
            setStep('cal_modal'); 
        } else { 
            console.error("Please select both your role and your intent before proceeding."); 
        }
    }, [role, intent]);
    
    // Custom data to pass to Cal.com
    const calConfigData = JSON.stringify({
        layout: "month_view",
        theme: "auto",
        custom: {
            role: role,
            intent: intent,
        },
    });


    return (
        // Main wrapper
        <div className="font-sans antialiased bg-transparent min-h-screen flex flex-col items-center justify-center">
            
            {/* Main Page Content */}
            <h1 className="text-2xl font-extrabold text-gray-300 dark:text-white mb-4 text-center leading-snug tracking-tight">
                Hi, you scrolled this far, let's have a talk.
            </h1>
            <p className="text-md text-gray-700 mb-12 text-center max-w-2xl font-medium">
                Book a focused 30-minute session to define objectives and outline strategic next steps.
            </p>
            
            <div className="relative group "> 
                <button
                    onClick={handleOpenModal} // Triggers the Qualification Modal
                    disabled={!isCalReady} // Disable if Cal API hasn't initialized
                    className="relative flex items-center space-x-2 px-8 py-3.5 hover:underline text-black dark:text-white rounded-xl transition duration-300 transform hover:scale-[1.03] font-bold text-lg " 
                >
                    <PhoneCallIcon size={24} className="text-white underline" />
                    <span>{isCalReady ? 'Lets Meet' : 'Loading Scheduler...'}</span>
                </button>
            </div>
            
            {/* --- STEP 1: Qualification Modal --- */}
            <QualifierModal 
                isOpen={step === 'qualifier'}
                onClose={handleCloseModal}
                role={role}
                setRole={setRole}
                intent={intent}
                setIntent={setIntent}
                onContinue={handleQualifierContinue} 
            />

            {/* --- STEP 2: Cal.com Embed Modal (Custom Wrapper) --- */}
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
