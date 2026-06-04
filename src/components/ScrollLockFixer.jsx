import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollLockFixer Component
 *
 * Fixes scroll-lock issues that occur during client-side navigation when modals
 * haven't properly cleaned up their overflow:hidden styles on body/html elements.
 *
 * Problem:
 * - React Bootstrap Modal adds overflow:hidden to body when opening
 * - If a page unmounts while a modal is open, cleanup might fail
 * - Returning to that page leaves overflow:hidden stuck on the body
 * - Result: page becomes unscrollable until hard refresh
 *
 * Solution:
 * - Monitor route changes
 * - On each route change, reset overflow styles to safe values
 * - Remove any leftover modal backdrops or modals from previous pages
 * - Force scroll position reset
 */
const ScrollLockFixer = () => {
  const location = useLocation();

  useEffect(() => {
    // Function to fix scroll lock
    const fixScrollLock = () => {
      const body = document.body;
      const html = document.documentElement;

      // 1. Reset body overflow to auto (safe default for scrollable pages)
      if (body.style.overflow === 'hidden') {
        console.log('🔧 Fixing scroll lock: resetting body.style.overflow from "hidden" to "auto"');
        body.style.overflow = 'auto';
      }

      // 2. Reset html overflow to auto (safe default)
      if (html.style.overflow === 'hidden') {
        console.log('🔧 Fixing scroll lock: resetting html.style.overflow from "hidden" to "auto"');
        html.style.overflow = 'auto';
      }

      // 3. Remove any leftover modal backdrops from previous pages
      const orphanedBackdrops = document.querySelectorAll('.modal-backdrop');
      if (orphanedBackdrops.length > 0) {
        console.log(`🔧 Removing ${orphanedBackdrops.length} orphaned modal backdrop(s)`);
        orphanedBackdrops.forEach((backdrop) => {
          backdrop.remove();
        });
      }

      // 4. Remove any open modals that aren't properly rendered
      const orphanedModals = document.querySelectorAll('.modal:not(.fade):not([class*="ReactModal"])');
      orphanedModals.forEach((modal) => {
        const isConnected = document.documentElement.contains(modal);
        if (!isConnected) {
          console.log('🔧 Removing disconnected modal element');
          modal.remove();
        }
      });

      // 5. Clear any padding added to account for scrollbar width
      if (body.style.paddingRight) {
        body.style.paddingRight = '';
      }

      // 6. Reset scroll position to top (optional, commented out to preserve user scroll)
      // window.scrollTo(0, 0);

      // 7. Log the final state for debugging
      const finalBodyStyle = window.getComputedStyle(body);
      const finalHtmlStyle = window.getComputedStyle(html);
      console.log('✅ Scroll lock check complete', {
        bodyOverflow: finalBodyStyle.overflow,
        htmlOverflow: finalHtmlStyle.overflow,
        canScroll: body.scrollHeight > body.clientHeight,
      });
    };

    // Run the fix immediately
    fixScrollLock();

    // Also run it after a short delay to catch any async modal mounts
    const timeoutId = setTimeout(fixScrollLock, 50);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  return null; // This component doesn't render anything
};

export default ScrollLockFixer;
