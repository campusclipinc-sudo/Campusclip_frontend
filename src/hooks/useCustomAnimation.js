import { useState, useEffect } from 'react';

/**
 * Custom hook for staggered fade-in and slide-up animations
 * Replaces AOS library for better compatibility with dynamic content
 * @param {number} index - Item index for stagger delay calculation
 * @param {number} delay - Base delay in ms (default 80)
 * @returns {boolean} - Whether the item should be visible (animated in)
 */
export const useCustomAnimation = (index = 0, delay = 80) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * delay);

    return () => clearTimeout(timer);
  }, [index, delay]);

  return isVisible;
};

/**
 * Hook to initialize animations on page mount
 * Call this once per page for optimal performance
 */
export const useAnimationInit = () => {
  useEffect(() => {
    // Animation is handled via CSS transitions
    // This hook can be used for future animation-related setup
  }, []);
};
