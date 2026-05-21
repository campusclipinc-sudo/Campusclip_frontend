import { useEffect } from 'react';
import { detectInstagramIOSBrowser, getBrowserInfo } from '../utils/detectBrowser';

/**
 * Debug component for Instagram iOS WebView issues
 * Only renders in development mode with Instagram iOS detected
 * Shows diagnostic information in browser console
 */
const InstagramIOSDebugger = () => {
  useEffect(() => {
    // Only run in development
    if (import.meta.env.MODE !== 'development') return;

    const isInstagramIOS = detectInstagramIOSBrowser();

    if (isInstagramIOS) {
      console.clear();
      console.log('%c🔍 Instagram iOS WebView Diagnostic Report', 'color: #007AFF; font-size: 14px; font-weight: bold;');
      console.log('%c==========================================', 'color: #007AFF; font-size: 12px;');

      const browserInfo = getBrowserInfo();

      // 1. Browser Detection
      console.log('%c📱 Browser Detection:', 'font-weight: bold; color: #333;');
      console.table({
        'iOS': browserInfo.isIOS,
        'Android': browserInfo.isAndroid,
        'Instagram': browserInfo.isInstagram,
        'Safari': browserInfo.isSafari,
        'Chrome': browserInfo.isChrome,
      });

      // 2. DOM Check
      console.log('%c📄 DOM Status:', 'font-weight: bold; color: #333;');
      const bodyStyles = window.getComputedStyle(document.body);
      console.table({
        'HTML Element': document.documentElement ? '✓' : '❌',
        'Body Element': document.body ? '✓' : '❌',
        'Body Content': document.body?.innerHTML?.length || 0,
        'Visibility': bodyStyles.visibility,
        'Opacity': bodyStyles.opacity,
        'Display': bodyStyles.display,
        'Root Element': document.querySelector('#root') ? '✓' : '❌',
      });

      // 3. Storage Check
      console.log('%c💾 Storage Status:', 'font-weight: bold; color: #333;');
      try {
        localStorage.setItem('__debug_test', 'test');
        localStorage.removeItem('__debug_test');
        console.log('localStorage: ✓ Available');
      } catch (e) {
        console.error('localStorage: ❌ Error -', e.message);
      }
      console.log('Cookies Enabled:', navigator.cookieEnabled);

      // 4. JavaScript Execution
      console.log('%c⚙️ JavaScript Execution:', 'font-weight: bold; color: #333;');
      console.table({
        'Window': typeof window,
        'Document': typeof document,
        'InstagramIOS Flag': window.isInstagramIOS ? '✓' : '❌',
        'React': window.__REACT_DEVTOOLS_GLOBAL_HOOK__ ? '✓' : '❌',
      });

      // 5. Performance
      console.log('%c⚡ Performance:', 'font-weight: bold; color: #333;');
      if (performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        const domTime = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
        console.table({
          'Page Load': `${loadTime}ms`,
          'DOM Ready': `${domTime}ms`,
        });
      }

      // 6. User Agent
      console.log('%c📋 User Agent:', 'font-weight: bold; color: #333;');
      console.log(browserInfo.userAgent);

      console.log('%c✓ Diagnostic report complete', 'color: #34C759; font-size: 12px; font-weight: bold;');
      console.log('%c💡 Tip: Share this output with your developer team if issues occur', 'color: #666; font-size: 12px; font-style: italic;');
    }
  }, []);

  return null; // This component doesn't render anything
};

export default InstagramIOSDebugger;
