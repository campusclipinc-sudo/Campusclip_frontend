import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// 🔧 Prevent React DevTools conflicts in production
if (typeof window !== 'undefined' && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__._AsyncMode = undefined;
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = () => {};
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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
