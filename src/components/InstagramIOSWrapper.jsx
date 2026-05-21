import { useEffect, useState } from 'react';
import { detectInstagramIOSBrowser } from '../utils/detectBrowser';

/**
 * Wrapper component to fix Instagram iOS in-app browser rendering issues
 * Handles:
 * - JavaScript execution in restricted sandbox
 * - DOM rendering and visibility issues
 * - Hydration problems
 * - Event handling delays
 */
const InstagramIOSWrapper = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [isInstagramIOS, setIsInstagramIOS] = useState(false);

  useEffect(() => {
    // 1. Detect Instagram iOS environment
    const detected = detectInstagramIOSBrowser();
    setIsInstagramIOS(detected);

    if (detected) {
      console.log('[InstagramIOS] Detected - applying compatibility fixes...');

      // 2. Mark window to help other components detect Instagram iOS
      window.isInstagramIOS = true;

      // 3. Use requestAnimationFrame for better timing
      const frameId = requestAnimationFrame(() => {
        try {
          // 4. Ensure HTML and body are fully visible
          const html = document.documentElement;
          const body = document.body;

          html.style.height = '100%';
          html.style.width = '100%';
          html.style.margin = '0';
          html.style.padding = '0';
          html.style.overflow = 'auto';

          body.style.height = '100%';
          body.style.width = '100%';
          body.style.margin = '0';
          body.style.padding = '0';
          body.style.opacity = '1';
          body.style.visibility = 'visible';
          body.style.display = 'block';

          // 5. Force layout recalculation (reflow)
          void body.offsetHeight;

          console.log('[InstagramIOS] DOM fixes applied');

          // 6. Set ready state
          setIsReady(true);
        } catch (error) {
          console.error('[InstagramIOS] Error applying fixes:', error);
          // Still mark as ready even if there's an error
          setIsReady(true);
        }
      });

      // 7. Fallback timer in case requestAnimationFrame doesn't work
      const timerId = setTimeout(() => {
        setIsReady(true);
        console.log('[InstagramIOS] Ready (fallback timer)');
      }, 2000);

      return () => {
        cancelAnimationFrame(frameId);
        clearTimeout(timerId);
      };
    } else {
      // For non-Instagram iOS browsers, mark as ready immediately
      setIsReady(true);
    }
  }, []);

  // 8. Show loading state only for Instagram iOS while fixing
  if (isInstagramIOS && !isReady) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          zIndex: 9999,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              border: '4px solid #e0e0e0',
              borderTop: '4px solid #007AFF',
              borderRadius: '50%',
              animation: 'instagramIOSSpinner 1s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ margin: 0, color: '#666', fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            Loading Campus Clip...
          </p>
        </div>
        <style>{`
          @keyframes instagramIOSSpinner {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 9. Render children normally
  return (
    <div
      style={{
        width: '100%',
        minHeight: isInstagramIOS ? '100vh' : 'auto',
      }}
    >
      {children}
    </div>
  );
};

export default InstagramIOSWrapper;
