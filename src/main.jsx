import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// 🔧 Prevent React 19 + DevTools compatibility issues
if (typeof window !== 'undefined') {
  // Handle React DevTools hook
  const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (hook) {
    hook.onCommitFiberRoot = () => {};
    hook.onCommitFiberUnmount = () => {};
    hook.onPostCommitFiberRoot = () => {};
    // Remove properties that don't exist in React 19
    delete hook._AsyncMode;
    delete hook._ConcurrentMode;
    delete hook._ProfileMode;
    delete hook._StrictMode;
  }

  // Prevent React from trying to set undefined properties
  if (window.React) {
    window.React.AsyncMode = null;
    window.React.ConcurrentMode = null;
    window.React.ProfileMode = null;
  }
}

// 🔧 Instagram iOS Fix: Clean URL parameters before React renders
// Instagram injects fbclid and other tracking params that break React Router
const ua = navigator.userAgent || navigator.vendor || window.opera;
const isInstagramIOS = /Instagram/i.test(ua) && /iPhone|iPad|iPod/i.test(ua);

if (isInstagramIOS && window.location.search) {
  // Get the clean URL without any query parameters
  const cleanUrl = window.location.origin + window.location.pathname;

  // Replace the URL in history without reloading
  // This prevents React Router from getting confused by Instagram's tracking params
  window.history.replaceState({}, '', cleanUrl);

  console.log('[InstagramIOS] URL cleaned - removed tracking parameters');
}

try {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (error) {
  console.error('React initialization error:', error);
  // Fallback: render without StrictMode
  try {
    createRoot(document.getElementById('root')).render(<App />);
  } catch (fallbackError) {
    console.error('Fallback render failed:', fallbackError);
  }
}
