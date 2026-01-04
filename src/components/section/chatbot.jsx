"use client";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Send, Clock, MessageSquare, Loader2, X, Sparkles } from "lucide-react";
import Head from "next/head";
import ShinyText from "@/components/ui/ShinyText";
import Aurora from "@/components/ui/Aurora";
import SplitText from "@/components/ui/SplitText";

// 🌟 MARKDOWN IMPORTS 🌟
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// ----------------------

// --- CONSTANTS ---
const ASHMEET_CHAT_API_URL = `https://chat-with-me-seven-sandy.vercel.app/api/chat`;
const ASHMEET_ASSISTANT_IMAGE_URL = "/ashmeetprofile.png";
const ASHMEET_USER_IMAGE_URL = "https://placehold.co/40x40/60a5fa/ffffff?text=U";
const ASHMEET_ASSISTANT_NAME = "Singh AI";
const ASHMEET_MAX_INPUT_WORDS = 500;
const TYPING_INDICATOR_MESSAGE_ID = "typing-indicator"; 
const ANIMATION_INTERVAL = 5000; 

// --- SUGGESTED QUESTIONS ---
const ASHMEET_SUGGESTED_QUESTIONS = [
  "What skills do Ashmeet have?",
  "Tell me about his background",
  "How can he help my business?",
  "What is his tech stack?"
];

// --- UTILITY FUNCTIONS ---
const getAshmeetWordCount = (text) => {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
};  

const formatAshmeetTime = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime()))
    return "Time N/A";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const generateAshmeetId = () =>
  Date.now().toString(36) + Math.random().toString(36).substring(2, 9); 

const ashmeetInitialMessages = [
  {
    id: generateAshmeetId(),
    text: `Hello, I'm **${ASHMEET_ASSISTANT_NAME}**. I'm an advanced AI designed to assist you with deep insights. Please **ask me about my work, professional background, finance, or current market trends.**`,
    isBot: true,
    timestamp: new Date(),
  },
];

// =========================================================================
// 1. MESSAGE COMPONENT (AshmeetChatMessage) - OPTIMIZED FOR RENDERING
// =========================================================================
const AshmeetChatMessage = React.memo(({
  message,
  isBot,
  isAssistantOnline,
  assistantImageUrl,
  userImageUrl,
}) => {
  const text = message?.text || "";
  const timestamp = message?.timestamp;

  const botAvatarClasses = "w-full h-full rounded-full overflow-hidden  ";
  const botBubbleClasses = "bg-gray-100 text-gray-800 dark:bg-[#5D4B4B] dark:text-gray-100 p-1 pl-10 rounded-xl rounded-tl-[50px] shadow-lg text-sm";
  const userAvatarClasses = "w-full h-full rounded-full overflow-hidden ";
  const userBubbleClasses = "bg-white text-black p-2 pr-10 rounded-xl rounded-tr-[50px] shadow-lg";

  const AvatarWrapper = ({ imageUrl, name, isBot, isOnline }) => (
    <div
      className={`absolute top-1 w-8 h-8 ${isBot ? "left-1" : "right-1"}`}
      title={name}
    >
      <div className="relative w-full h-full">
        <div className={isBot ? botAvatarClasses : userAvatarClasses}>
          <img
            src={imageUrl}
            alt={`${name} Avatar`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = isBot
                ? "https://placehold.co/40x40/000000/ffffff?text=AS"
                : "https://placehold.co/40x40/60a5fa/ffffff?text=U";
            }}
          />
        </div>
        <div
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ${
            isBot
              ? isOnline
                ? "bg-green-500 ring-white"
                : "bg-red-500 ring-white"
              : "bg-green-400 "
          }`}
          title={isBot ? (isOnline ? "Online" : "Offline") : "Active"}
        />
      </div>
    </div>
  );

  const markdownComponents = useMemo(() => ({
    a: ({ node, ...props }) => (
      <a
        {...props}
        className={`underline transition duration-200 ${
          isBot
            ? "text-blue-500 dark:text-blue-400 hover:text-blue-700"
            : "text-blue-200 hover:text-blue-50"
        }`}
      />
    ),
    p: ({ node, ...props }) => <p {...props} className="mb-1" />,
    h1: ({ node, ...props }) => (
      <h1
        {...props}
        className={`text-md font-bold mt-3 mb-1 ${
          isBot ? "text-gray-900 dark:text-gray-100" : "text-white"
        }`}
      />
    ),
    h2: ({ node, ...props }) => (
      <h2
        {...props}
        className={`text-base font-semibold mt-2 mb-1 ${
          isBot ? "text-gray-800 dark:text-gray-200" : "text-white"
        }`}
      />
    ),
    h3: ({ node, ...props }) => (
      <h3
        {...props}
        className={`text-sm font-semibold mt-1 mb-0.5 ${
          isBot ? "text-gray-700 dark:text-gray-300" : "text-blue-100"
        }`}
      />
    ),
    ul: ({ node, ...props }) => (
      <ul
        {...props}
        className="list-disc list-inside ml-2 my-1 space-y-0.5"
      />
    ),
    ol: ({ node, ...props }) => (
      <ol
        {...props}
        className="list-decimal list-inside ml-2 my-1 space-y-0.5"
      />
    ),
    li: ({ node, ...props }) => <li {...props} className="mt-0.5" />,
    code: ({ node, inline, ...props }) => {
      if (inline) {
        return (
          <code
            {...props}
            className={`px-1 py-0.5 rounded ${
              isBot
                ? "bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-red-400 font-mono text-sm" 
                : "bg-blue-700 text-yellow-300 font-mono text-sm" 
            }`}
          />
        );
      }
      return (
        <pre
          className={`p-2 rounded-lg mt-2 mb-1 overflow-x-auto text-xs ${
            isBot
              ? "bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
              : "bg-blue-700 border border-blue-800"
          }`}
        >
          <code
            {...props}
            className={`text-xs ${
              isBot
                ? "text-gray-900 dark:text-gray-100"
                : "text-white"
            }`}
          />
        </pre>
      );
    },
    blockquote: ({ node, ...props }) => (
      <blockquote
        {...props}
        className={`border-l-4 pl-3 py-1 italic mt-2 mb-1 ${
          isBot
            ? "border-gray-500 text-gray-700 dark:text-gray-300"
            : "border-blue-300 text-blue-100"
        }`}
      />
    ),
    table: ({ node, ...props }) => (
      <table
        {...props}
        className={`min-w-full divide-y divide-gray-300 dark:divide-gray-600 my-2 text-sm ${
          isBot ? "text-gray-800 dark:text-gray-200" : "text-white"
        }`}
      />
    ),
    thead: ({ node, ...props }) => (
      <thead
        {...props}
        className={`${
          isBot ? "bg-gray-200 dark:bg-gray-700" : "bg-blue-700"
        }`}
      />
    ),
    th: ({ node, ...props }) => (
      <th
        {...props}
        className={`px-2 py-1 text-left font-semibold ${
          isBot ? "text-gray-900 dark:text-gray-100" : "text-white"
        }`}
      />
    ),
    td: ({ node, ...props }) => (
      <td
        {...props}
        className={`px-2 py-1 whitespace-normal border-t ${
          isBot
            ? "border-gray-300 dark:border-gray-600"
            : "border-blue-700"
        }`}
      />
    ),
  }), [isBot]);


  return (
    <div
      className={`relative z-10 flex w-full my-2 ${
        isBot ? "justify-start" : "justify-end"
      }`}
    >
      <div
        className={`relative max-w-[70%] transition-all duration-300 ${
          isBot ? botBubbleClasses : userBubbleClasses
        }`}
      >
        {isBot && (
          <AvatarWrapper
            imageUrl={assistantImageUrl}
            name={ASHMEET_ASSISTANT_NAME}
            isBot={true}
            isOnline={isAssistantOnline}
          />
        )}

        <div className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {String(text).trim().replace(/^,|,$/g, '')}
          </ReactMarkdown>
        </div>

        <div
          className={`flex items-center mt-1 text-xs opacity-75 ${
            isBot
              ? "justify-end text-gray-500 dark:text-gray-400"
              : "justify-start text-white/70"
          }`}
        >
          <Clock
            className={`w-2 h-2 mr-1 ${
              isBot ? "text-gray-500 dark:text-gray-400" : "text-white/70"
            }`}
          />
          <span
            className={`${
              isBot ? "text-gray-500 dark:text-gray-400" : "text-white/70"
            }`}
          >
            {formatAshmeetTime(timestamp)}
          </span>
        </div>

        {!isBot && (
          <AvatarWrapper
            imageUrl={userImageUrl}
            name={"You"}
            isBot={false}
            isOnline={true}
          />
        )}
      </div>
    </div>
  );
});

AshmeetChatMessage.displayName = 'AshmeetChatMessage';

// =========================================================================
// 2. CORE CHATBOT LOGIC & INTERFACE (AshmeetChatInterface)
// =========================================================================

const AshmeetChatInterface = ({ onClose, isDarkMode }) => {
  const [messages, setMessages] = useState(ashmeetInitialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [animationKey, setAnimationKey] = useState(0); 
  const [showSuggestions, setShowSuggestions] = useState(true); // Control bubble visibility
  const messagesEndRef = useRef(null);
  const textAreaRef = useRef(null);

  const wordCount = getAshmeetWordCount(input);
  const isInputTooLong = wordCount > ASHMEET_MAX_INPUT_WORDS;
  const isAssistantOnline = true; 

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);
  
  const autoResizeTextarea = useCallback(() => {
    const textarea = textAreaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; 
      const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 24; 
      const maxHeight = lineHeight * 5; 
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
    autoResizeTextarea();
  }, [messages, autoResizeTextarea, scrollToBottom]); 
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey((prevKey) => prevKey + 1);
    }, ANIMATION_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // --- API LOGIC ---
  const handleChatApiRequest = async (queryText) => {
    setIsLoading(true);
    setShowSuggestions(false); // Hide bubbles immediately on first interaction
    
    try {
      const response = await fetch(ASHMEET_CHAT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText }),
      });

      const result = await response.json();
      const botResponse = result?.reply || "I'm having trouble connecting right now.";

      setMessages((prev) => [
        ...prev,
        {
          id: generateAshmeetId(),
          text: botResponse,
          isBot: true,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: generateAshmeetId(),
          text: "Connection error. Please try again.",
          isBot: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAshmeetSend = async (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading || isInputTooLong) return;

    setMessages((prev) => [
      ...prev,
      { id: generateAshmeetId(), text: trimmedInput, isBot: false, timestamp: new Date() }
    ]);
    setInput("");
    await handleChatApiRequest(trimmedInput);
  };

  // --- HANDLE BUBBLE CLICK ---
  const handleSuggestionClick = (question) => {
    if (isLoading) return;
    setMessages((prev) => [
      ...prev,
      { id: generateAshmeetId(), text: question, isBot: false, timestamp: new Date() }
    ]);
    handleChatApiRequest(question);
  };

  const statusText = isAssistantOnline ? "Online" : "Offline";
  const statusColorClasses = isAssistantOnline
    ? "text-green-500 dark:text-green-400"
    : "text-red-500 dark:text-red-400";

  return (
    <div className="flex flex-col h-full antialiased pb-4 md:pb-0"> 
      {/* HEADER */}
      <header className="sticky top-0 z-50 flex items-center justify-between py-4 px-3 bg-white/70 dark:bg-[#3D4B4B]/80 backdrop-blur-md transition duration-300 ">
        <div className="flex items-center space-x-2 pl-1">
          <div className="relative">
            <img
              src={ASHMEET_ASSISTANT_IMAGE_URL}
              alt="Avatar"
              className="w-7 h-7 rounded-full object-cover"
            />
            <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${isAssistantOnline ? "bg-green-500" : "bg-red-500"}`} />
          </div>

          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">
              {ASHMEET_ASSISTANT_NAME}
            </h3>
            <p className={`text-xs ${statusColorClasses} -ml-8`}>
              <SplitText
                text={statusText}
                delay={100}
                duration={0.6}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                textAlign="center"
                key={animationKey} 
              />
            </p>
          </div>
        </div>

        <button onClick={onClose} className="p-1 rounded-full text-gray-800 dark:text-gray-100 hover:bg-red-100 dark:hover:bg-red-900 transition">
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Message Display Area */}
      <div className="flex-grow flex flex-col min-h-0 overflow-hidden bg-transparent">
        <div className="flex-grow p-3 space-y-4 overflow-y-auto injected-scrollbar">
          {messages.map((msg) => (
            <AshmeetChatMessage
              key={msg.id}
              message={msg}
              isBot={msg.isBot}
              isAssistantOnline={isAssistantOnline}
              assistantImageUrl={ASHMEET_ASSISTANT_IMAGE_URL}
              userImageUrl={ASHMEET_USER_IMAGE_URL}
            />
          ))}

          {isLoading && (
            <div className="relative z-10 flex w-full my-2 justify-start">
              <div className="relative max-w-[60%] rounded-xl rounded-tl-md bg-gray-800 text-gray-100 p-2 pl-10 shadow-lg">
                <div className="absolute left-1 top-1 w-8 h-8">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <img src={ASHMEET_ASSISTANT_IMAGE_URL} alt="Bot" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="flex space-x-1 items-center ml-4">
                  <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
                  <span className="text-sm">Typing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form & Suggestions */}
      <div className="sticky bottom-0 z-50 p-1 mx-3 mb-20 md:mb-0">
        
        {/* 🌟 SUGGESTION BUBBLES (Disappear on click/interaction) 🌟 */}
        {showSuggestions && !isLoading && (
          <div className="flex flex-wrap gap-2 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {ASHMEET_SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(q)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-white/80 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all group"
              >
                <Sparkles className="w-3 h-3 text-yellow-500 group-hover:animate-pulse" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{q}</span>
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={handleAshmeetSend}
          className={`relative flex items-center border-t-2 border-l-2 border-r-2 space-x-2 bg-white dark:bg-white/40 p-1 rounded-xl shadow-lg transition-all ${
            isInputTooLong ? "border-red-500" : "border-gray-200 dark:border-gray-800"
          }`}
        >
          <textarea
              ref={textAreaRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResizeTextarea();
              }}
              onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAshmeetSend(e);
                  }
              }}
              placeholder="Ask me about my work..."
              className="flex-grow py-1.5 px-3 border-none focus:outline-none bg-transparent dark:text-gray-100 text-gray-800 transition duration-150 rounded-lg resize-none overflow-y-hidden"
              disabled={isLoading}
          />

          <button
            type="submit"
            className="ashmeet-wow-send-button p-1 rounded-xl transition duration-150 disabled:opacity-50 flex items-center justify-center w-8 h-8 flex-shrink-0"
            disabled={!input.trim() || isLoading || isInputTooLong}
          > 
            <ShinyText
              text={<Send className="w-4 h-4 text-white transform -translate-x-px" />}
              disabled={!input.trim() || isLoading || isInputTooLong}
              speed={3}
              className="!bg-transparent text-white"
            />
          </button>
        </form>
        <div className="absolute right-1 text-[10px] text-gray-500 dark:text-gray-400 mt-1">
          {wordCount}/{ASHMEET_MAX_INPUT_WORDS} words
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 3. MAIN EXPORTED COMPONENT (AshmeetChatbotWidget)
// =========================================================================

export default function AshmeetChatbotWidget() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const toggleChat = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    setMounted(true); 
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      if (isDarkMode) root.classList.add("dark");
    }
  }, [isDarkMode]); 

  const modalClasses = useMemo(() => {
      const isVisible = isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none";
      const mobileSlide = isOpen ? "translate-x-0" : "translate-x-full";
      const desktopSlide = isOpen ? "md:translate-y-0" : "md:translate-y-full";

      return `
        fixed z-[99] transition-all duration-500 ease-in-out
        bg-white/90 dark:bg-[#3D4B4B]  backdrop-blur-xl flex flex-col overflow-hidden
        ${isVisible} inset-0 w-full h-screen rounded-none
        ${mobileSlide}
        md:inset-auto md:bottom-0 md:right-4 md:w-full md:max-w-lg md:h-[550px] md:rounded-t-xl md:translate-x-0
        ${desktopSlide}
      `;
  }, [isOpen]);

  const triggerClasses = useMemo(() => `
    fixed z-50 flex items-center transition-all duration-500 ease-in-out hover:scale-[1.03] shadow-lg cursor-pointer
    bg-[#525151] dark:bg-transparent text-white
    ${isOpen ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"}
  `, [isOpen]);

  if (!mounted) return null;

  return (
    <div className={`bg-white dark:bg-[#4D4B4B] transition-colors duration-500 font-inter ${isOpen ? "overflow-hidden" : ""}`}>
      <Head><title>Ashmeet's Chatbot</title></Head>

      {/* Mobile Trigger */}
      <button onClick={toggleChat} className={`${triggerClasses} md:hidden right-0 top-1/2 -translate-y-1/2 p-2 rounded-l-xl flex-col space-y-1`}>
        <ShinyText text={<span className="font-semibold whitespace-nowrap [writing-mode:vertical-rl] rotate-180">Let's Chat</span>} speed={5} className="text-white" />
        <MessageSquare className="w-5 h-5" />
      </button>

      {/* Desktop Trigger */}
      <button onClick={toggleChat} className={`${triggerClasses} hidden md:flex bottom-0 right-4 px-4 py-2 rounded-t-lg`}>
        <MessageSquare className="w-5 h-5 mr-2" />
        <ShinyText text={<span className="text-base font-semibold">Let's Chat</span>} speed={3} className="text-white" />
      </button>

      {/* Modal */}
      <div className={modalClasses}>
        {isDarkMode && (
          <div className="absolute inset-0 z-0 opacity-70">
            <Aurora lineColor="#0ca6bbff" backgroundColor="transparent" />
          </div>
        )}
        <div className="relative z-10 w-full h-full">
          <AshmeetChatInterface onClose={toggleChat} isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
}