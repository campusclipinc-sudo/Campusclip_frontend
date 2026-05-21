import { useEffect, useState } from 'react';
import { detectInstagramIOSBrowser } from '../utils/detectBrowser';

/**
 * Displays errors visibly on screen for Instagram iOS debugging
 * Since Safari DevTools is hard to access, this shows errors directly in the app
 */
const InstagramIOSVisibleErrors = () => {
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [isInstagramIOS, setIsInstagramIOS] = useState(false);

  useEffect(() => {
    const isInsta = detectInstagramIOSBrowser();
    setIsInstagramIOS(isInsta);

    if (!isInsta) return; // Only show on Instagram iOS

    // Capture all console errors
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;

    console.error = (...args) => {
      const errorMsg = args.map(a =>
        typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
      ).join(' ');

      setErrors(prev => [...prev, errorMsg]);
      originalError(...args);
    };

    console.warn = (...args) => {
      const warnMsg = args.map(a =>
        typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
      ).join(' ');

      setWarnings(prev => [...prev, warnMsg]);
      originalWarn(...args);
    };

    // Capture uncaught errors
    const handleError = (event) => {
      setErrors(prev => [...prev, `${event.error?.message || event.message}`]);
    };

    const handleUnhandledRejection = (event) => {
      setErrors(prev => [...prev, `Unhandled Promise Rejection: ${event.reason}`]);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      console.log = originalLog;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (!isInstagramIOS || (errors.length === 0 && warnings.length === 0)) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#1a1a1a',
        color: '#fff',
        zIndex: 99999,
        overflow: 'auto',
        fontFamily: 'monospace',
        fontSize: '11px',
        padding: '10px',
      }}
    >
      <div style={{ padding: '10px 0', backgroundColor: '#ff6b6b', color: '#000', marginBottom: '10px' }}>
        <strong>⚠️ INSTAGRAM iOS ERRORS DETECTED</strong>
      </div>

      {errors.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ color: '#ff6b6b', fontWeight: 'bold', marginBottom: '10px' }}>
            🔴 ERRORS ({errors.length}):
          </div>
          {errors.map((error, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#2a1a1a',
                padding: '10px',
                marginBottom: '5px',
                borderLeft: '3px solid #ff6b6b',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {error}
            </div>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <div>
          <div style={{ color: '#ffd93d', fontWeight: 'bold', marginBottom: '10px' }}>
            🟡 WARNINGS ({warnings.length}):
          </div>
          {warnings.map((warning, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#2a2a1a',
                padding: '10px',
                marginBottom: '5px',
                borderLeft: '3px solid #ffd93d',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {warning}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '10px', color: '#888' }}>
        <p>📱 Instagram iOS detected - showing errors for debugging</p>
        <p>Take a screenshot and share with developer</p>
        <button
          onClick={() => {
            setErrors([]);
            setWarnings([]);
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007AFF',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px',
          }}
        >
          Clear Errors
        </button>
      </div>
    </div>
  );
};

export default InstagramIOSVisibleErrors;
