import React, { useState, useEffect, useRef } from 'react';

// Reusable SVG Leaf Component with Teal Fill (Shadow added back ONLY for the SVG element)
const LeafIcon = ({ color, style }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="50" 
    height="50" 
    viewBox="0 0 24 24" 
    style={{ ...style, transition: 'transform 1s ease-out, opacity 1s ease-out' }} 
  >
    {/* SVG Filter Definition for Drop Shadow (only affects elements that reference it) */}
    <defs>
      <filter id="leafShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow 
          dx="2" 
          dy="2" 
          stdDeviation="2" 
          floodColor="#065F46" // Darker teal shadow color
          floodOpacity="0.7" 
        />
      </filter>
    </defs>

    {/* Using solid teal fill and dark teal stroke */}
    <path 
        d="M11 20a7 7 0 0 1-7-7c0-1.07.24-2.14.71-3.11l.79-1.57A7 7 0 0 1 14 4a7 7 0 0 1 7 7c0 1.07-.24 2.14-.71 3.11l-.79 1.57a7 7 0 0 1-6.5 4.32z" 
        fill="#14B8A6" // Teal color fill
        stroke="#065F46" // Darker teal stroke strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#leafShadow)" // Apply the shadow filter here
    />
    {/* Veins - applying the filter here too for consistency */}
    <path d="M7 13c0 1.66 1.34 3 3 3" stroke="#065F46" strokeWidth="1.5" filter="url(#leafShadow)" />
    <path d="M12 21L12 12" stroke="#065F46" strokeWidth="1.5" filter="url(#leafShadow)" />
  </svg>
);


// The QuoteComponent showcases enthusiasm for data analysis
const QuoteComponent = () => {
  
  const quoteRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);
  
  // State for sequential typing
  const [typedQuote, setTypedQuote] = useState('');
  const [typedAuthor, setTypedAuthor] = useState('');
  const [isQuoteComplete, setIsQuoteComplete] = useState(false); // Flag to start author typing

  const FULL_QUOTE_TEXT = 'If you torture the data long enough, will confess to anything.';
  const AUTHOR_TEXT = '- Ronald Coase';

  // Timing Constants
  // The actual typing speed will now be random (30ms - 90ms)
  const ROLL_ANIMATION_DURATION_MS = 1200; // From innerBoxStyle transition
  const TYPING_START_DELAY_MS = ROLL_ANIMATION_DURATION_MS + 100;
  
  // Utility function for natural typing speed (random delay between 30ms and 90ms)
  const getNaturalSpeed = (min = 30, max = 90) => Math.floor(Math.random() * (max - min + 1)) + min;


  // Intersection Observer for Scroll Reveal (Remains the same)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.unobserve(entry.target);
        }
      },
      {
        root: null, 
        rootMargin: '0px',
        threshold: 0.1, 
      }
    );

    if (quoteRef.current) {
      observer.observe(quoteRef.current);
    }

    return () => {
      if (quoteRef.current) {
        // eslint-disable-next-line
        observer.unobserve(quoteRef.current);
      }
    };
  }, []);

  // 1. Quote Typewriter Effect Logic (Starts after roll with natural speed)
  useEffect(() => {
    if (isRevealed) {
      const typeStartTimer = setTimeout(() => {
        let i = 0;
        
        const typeNextCharacter = () => {
            if (i < FULL_QUOTE_TEXT.length) {
                setTypedQuote(prev => prev + FULL_QUOTE_TEXT.charAt(i));
                i++;
                // Use variable delay for the next character
                setTimeout(typeNextCharacter, getNaturalSpeed()); 
            } else {
                setIsQuoteComplete(true); // Quote finished, start author sequence
            }
        };

        typeNextCharacter(); // Start the typing recursion

      }, TYPING_START_DELAY_MS);
      
      return () => clearTimeout(typeStartTimer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRevealed]); // Runs once when revealed

  // 2. Author Typewriter Effect Logic (Starts when quote finishes with natural speed)
  useEffect(() => {
    if (isQuoteComplete) {
        let j = 0;

        const typeNextAuthorCharacter = () => {
            if (j < AUTHOR_TEXT.length) {
                setTypedAuthor(prev => prev + AUTHOR_TEXT.charAt(j));
                j++;
                // Use variable delay for the next author character (slightly faster range)
                setTimeout(typeNextAuthorCharacter, getNaturalSpeed(20, 60));
            }
        };

        // Small delay after quote finishes before author starts typing
        const authorStartDelay = setTimeout(typeNextAuthorCharacter, 500);
        return () => clearTimeout(authorStartDelay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQuoteComplete]); // Runs once when quote is complete


  const tealColor = '#14B8A6'; 
  const accentColor = '#F59E0B'; 
  const borderColor = '#1F2937'; 
  
  // Helper function to apply styling to parts of the typed quote
  const renderQuote = (text) => {
    // Regex to split by the accent words, keeping the delimiters in the array
    const parts = text.split(/(\btorture\b|\bdata\b|\bconfess\b)/g);
    
    return parts.map((part, index) => {
        const isAccent = ['torture', 'data', 'confess'].includes(part);
        if (isAccent) {
            return <span key={index} style={accentTextStyle}>{part}</span>;
        }
        return part;
    });
  };

  // Outer container style to set up perspective for 3D rotation and general positioning
  const perspectiveContainerStyle = {
    // Ultra-Thinner profile positioning
    margin: '40px auto',
    maxWidth: '850px', 
    
    position: 'relative',
    
    // Set perspective for 3D effect on the wrapper
    perspective: '1000px', 
    
    // Outer shadow removed as requested earlier
    boxShadow: 'none', 
    
    // Initial fade-in of the box container
    opacity: isRevealed ? 1 : 0,
    transition: 'opacity 0.2s ease 0s',
  }

  // Styles for the inner box, which handles the rotation
  const innerBoxStyle = {
    // LIGHT/ADAPTABLE THEME COLORS
    backgroundColor: 'transparent', 
    color: '#ffdd00ff', 
    
    // Increased curves for maximum softness
    borderTopLeftRadius: '80px', 
    borderBottomRightRadius: '80px', 
    borderTopRightRadius: '40px', 
    borderBottomLeftRadius: '40px', 
    
    // KEY CHANGE: Thin black dashed border
    border: '2px dashed ' + borderColor, 
    textAlign: 'center',
    fontFamily: 'Inter, sans-serif',
    
    // Inner padding to make room for content
    padding: '12px 60px', 
    
    // Transform origin set to left for "unroll" animation
    transformOrigin: 'left center', 
    
    // Smoother transition for natural feel (Non-bouncy curve)
    transition: `transform ${ROLL_ANIMATION_DURATION_MS / 1000}s cubic-bezier(0.4, 0, 0.2, 1)`,
    
    // Pure 3D Rotation for a non-static, natural roll effect
    transform: isRevealed 
        ? 'rotateY(0deg)' // End state: fully visible, no rotation
        : 'rotateY(90deg)', // Start state: rotated 90 degrees (invisible edge)
  };


  // Text style for content
  const textStyle = {
    fontSize: '1em', 
    fontWeight: '600', 
    marginBottom: '10px', 
    lineHeight: '1.4',
    fontStyle: 'italic',
    color: '#969413ff', 
    // Opacity is 1 by default, content revealed by typing, not fading
  };
  
  const accentTextStyle = {
      color: accentColor, 
  };

  // Author style for content
  const authorStyle = {
    fontSize: '1.1em', 
    color: tealColor, 
    marginTop: '10px', 
    display: 'flex',
    justifyContent: 'flex-end', 
    fontWeight: '500', 
    paddingRight: '0px', 
    
    // Fade in instantly once the author typing starts
    opacity: typedAuthor.length > 0 ? 1 : 0, 
    transition: 'opacity 0.2s ease', 
  };
  
  // Leaf Animation: Subtle move to final position and slight scale change
  const leafTopRightStyle = {
    position: 'absolute',
    top: isRevealed ? '-25px' : '-5px', 
    right: isRevealed ? '-25px' : '-5px', 
    opacity: isRevealed ? 1 : 0,
    // Start leaf animation slightly after the roll begins
    transition: 'transform 1s ease-out 0.5s, opacity 0.5s ease 0.5s', 
    transform: isRevealed 
      ? 'rotate(90deg) scale(1)' 
      : 'rotate(90deg) scale(0.8)', 
  };
  
  const leafBottomLeftStyle = {
    position: 'absolute',
    bottom: isRevealed ? '-25px' : '-5px', 
    left: isRevealed ? '-25px' : '-5px', 
    opacity: isRevealed ? 1 : 0,
    // Start leaf animation slightly after the roll begins
    transition: 'transform 1s ease-out 0.5s, opacity 0.5s ease 0.5s', 
    transform: isRevealed 
      ? 'rotate(-90deg) scale(1)' 
      : 'rotate(-90deg) scale(0.8)', 
  };

  return (
    <div style={perspectiveContainerStyle} ref={quoteRef}>
      <div style={innerBoxStyle}>
          {/* Leaf Icons (teal) - Rendered outside the animating inner box for better positioning control */}
          <LeafIcon color={tealColor} style={leafTopRightStyle} />
          <LeafIcon color={tealColor} style={leafBottomLeftStyle} />

          <p style={textStyle}>
            "
            {renderQuote(typedQuote)}
            {typedQuote.length === FULL_QUOTE_TEXT.length ? '"' : ''}
          </p>
          
          <div style={authorStyle}>
            <cite>
              {/* Backticks are Yellow/Gold */}
              <span style={accentTextStyle}>``</span>
              {typedAuthor}
              <span style={accentTextStyle}>``</span>
            </cite>
          </div>
      </div>
    </div>
  );
};

// The main App component to render the quote for display
const App = () => {
    // Basic wrapper to center the content
    const appWrapperStyle = {
        minHeight: 'auto', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent', 
        padding: '20px', 
    };

    return (
        <div style={appWrapperStyle}>
            <QuoteComponent />
        </div>
    );
}

export default App;