/**
 * Detect browser and platform information
 * Especially for Instagram iOS in-app browser issues
 */

export const detectInstagramIOSBrowser = () => {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isInstagram = /Instagram/.test(ua);

  return isIOS && isInstagram;
};

export const detectIOSBrowser = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

export const getBrowserInfo = () => {
  if (typeof window === 'undefined') return null;

  const ua = navigator.userAgent;
  return {
    isIOS: /iPad|iPhone|iPod/.test(ua),
    isAndroid: /Android/.test(ua),
    isInstagram: /Instagram/.test(ua),
    isSafari: /Safari/.test(ua) && !/Chrome/.test(ua),
    isChrome: /Chrome/.test(ua),
    userAgent: ua,
  };
};

export const isInAppBrowser = () => {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent;
  return (
    /Instagram|FBAN|FBAV/.test(ua) || // Instagram, Facebook
    /TikTok/.test(ua) || // TikTok
    /WeChat/.test(ua) || // WeChat
    /Snapchat/.test(ua) // Snapchat
  );
};
