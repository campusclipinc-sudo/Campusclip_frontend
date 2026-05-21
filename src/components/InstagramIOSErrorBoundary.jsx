import React from 'react';
import { detectInstagramIOSBrowser } from '../utils/detectBrowser';

/**
 * Error boundary specifically for Instagram iOS
 * Catches rendering errors and displays diagnostics
 */
class InstagramIOSErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isInstagramIOS: false,
    };
  }

  componentDidMount() {
    this.setState({ isInstagramIOS: detectInstagramIOSBrowser() });

    // Log all console errors to help debugging
    const originalError = console.error;
    console.error = (...args) => {
      console.log('[InstagramIOS Error Caught]', ...args);
      originalError(...args);
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Error caught:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Log to window for Instagram iOS debugging
    window.__instagramIOSError = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '20px',
            backgroundColor: '#fee',
            color: '#c33',
            fontFamily: 'monospace',
            fontSize: '12px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            minHeight: '100vh',
          }}
        >
          <h2 style={{ margin: '0 0 10px 0' }}>App Error Detected</h2>

          {this.state.isInstagramIOS && (
            <div style={{
              backgroundColor: '#ffd',
              color: '#000',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '4px'
            }}>
              <strong>⚠️ Instagram iOS Detected</strong>
              <p>Error occurred in Instagram iOS WebView. Check console for details.</p>
            </div>
          )}

          <div style={{ marginBottom: '10px' }}>
            <strong>Error Message:</strong>
            {this.state.error?.message}
          </div>

          {this.state.errorInfo && (
            <div>
              <strong>Component Stack:</strong>
              {this.state.errorInfo.componentStack}
            </div>
          )}

          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default InstagramIOSErrorBoundary;
