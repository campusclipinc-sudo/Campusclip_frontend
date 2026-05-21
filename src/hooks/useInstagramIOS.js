import { useEffect, useState } from 'react';
import { detectInstagramIOSBrowser, getBrowserInfo } from '../utils/detectBrowser';

/**
 * Hook to detect and handle Instagram iOS specific behavior
 * @returns {object} Browser info and detection state
 */
export const useInstagramIOS = () => {
  const [isInstagramIOS, setIsInstagramIOS] = useState(false);
  const [browserInfo, setBrowserInfo] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const detected = detectInstagramIOSBrowser();
    setIsInstagramIOS(detected);
    setBrowserInfo(getBrowserInfo());
    setIsReady(true);

    if (detected) {
      console.log('[useInstagramIOS] Instagram iOS detected');

      // Add event delegation for better event handling in Instagram iOS
      const handleClick = (e) => {
        const link = e.target.closest('a');
        if (link && link.href && !link.target) {
          // Allow normal link handling
          return;
        }
      };

      document.addEventListener('click', handleClick, true);
      return () => {
        document.removeEventListener('click', handleClick, true);
      };
    }
  }, []);

  return {
    isInstagramIOS,
    browserInfo,
    isReady,
  };
};

export default useInstagramIOS;
