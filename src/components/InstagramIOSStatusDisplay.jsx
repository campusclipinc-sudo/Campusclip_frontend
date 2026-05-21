import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { detectInstagramIOSBrowser } from '../utils/detectBrowser';

/**
 * Shows status of all systems on Instagram iOS
 * Helps diagnose why nothing is rendering
 */
const InstagramIOSStatusDisplay = () => {
  const [isInstagramIOS, setIsInstagramIOS] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    jsLoaded: false,
    domReady: false,
    reduxLoaded: false,
    userLoaded: false,
    socketConnected: false,
  });

  // Try to get Redux state (will be null if Redux not working)
  let reduxState = null;
  let userData = null;
  try {
    reduxState = useSelector(state => state);
    userData = useSelector(state => state.user?.user);
  } catch (e) {
    console.log('[InstagramIOSStatus] Redux error:', e.message);
  }

  useEffect(() => {
    const isInsta = detectInstagramIOSBrowser();
    setIsInstagramIOS(isInsta);

    if (!isInsta) return;

    // Check system status
    setSystemStatus(prev => ({
      ...prev,
      jsLoaded: true,
      domReady: !!document.body,
    }));

    // Check Redux
    setTimeout(() => {
      setSystemStatus(prev => ({
        ...prev,
        reduxLoaded: !!reduxState,
        userLoaded: !!userData,
      }));
    }, 100);

    // Check Socket
    setTimeout(() => {
      const socketStatus = !!window.__socket?.connected;
      setSystemStatus(prev => ({
        ...prev,
        socketConnected: socketStatus,
      }));
    }, 500);
  }, [reduxState, userData]);

  if (!isInstagramIOS || (systemStatus.jsLoaded && systemStatus.domReady)) {
    return null;
  }

  const statusColor = (status) => status ? '#34C759' : '#FF6B6B';
  const statusText = (status) => status ? '✓' : '✗';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1a1a1a',
        color: '#fff',
        zIndex: 99998,
        padding: '15px',
        fontSize: '12px',
        fontFamily: 'monospace',
        borderTop: '2px solid #444',
      }}
    >
      <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
        📱 Instagram iOS System Status:
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div style={{ color: statusColor(systemStatus.jsLoaded) }}>
          {statusText(systemStatus.jsLoaded)} JavaScript: {systemStatus.jsLoaded ? 'Loaded' : 'Waiting...'}
        </div>

        <div style={{ color: statusColor(systemStatus.domReady) }}>
          {statusText(systemStatus.domReady)} DOM: {systemStatus.domReady ? 'Ready' : 'Waiting...'}
        </div>

        <div style={{ color: statusColor(systemStatus.reduxLoaded) }}>
          {statusText(systemStatus.reduxLoaded)} Redux: {systemStatus.reduxLoaded ? 'Loaded' : 'Waiting...'}
        </div>

        <div style={{ color: statusColor(systemStatus.userLoaded) }}>
          {statusText(systemStatus.userLoaded)} User: {systemStatus.userLoaded ? 'Loaded' : 'Waiting...'}
        </div>

        <div style={{ color: statusColor(systemStatus.socketConnected) }}>
          {statusText(systemStatus.socketConnected)} Socket: {systemStatus.socketConnected ? 'Connected' : 'Waiting...'}
        </div>

        <div style={{ color: '#FFA500' }}>
          ⏳ App: Initializing...
        </div>
      </div>

      <div style={{ marginTop: '10px', fontSize: '11px', color: '#888' }}>
        If all are ✓, app should render below. If not, there's a blocking issue.
      </div>

      {/* Debug info */}
      <div style={{ marginTop: '10px', fontSize: '10px', color: '#666', maxHeight: '100px', overflow: 'auto' }}>
        {userData && (
          <div>👤 User: {userData.full_name || userData.email}</div>
        )}
        {reduxState && (
          <div>🔴 Redux keys: {Object.keys(reduxState).join(', ')}</div>
        )}
      </div>
    </div>
  );
};

export default InstagramIOSStatusDisplay;
