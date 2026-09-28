import { useState, useEffect, useRef } from 'react';

/**
 * LazySection
 * Uses the native browser IntersectionObserver API to defer mounting
 * heavy offscreen content until the user scrolls within `rootMargin` of it.
 */
export default function LazySection({ children, minHeight = 350, rootMargin = '250px' }) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={sectionRef} style={{ minHeight: isVisible ? undefined : minHeight, width: '100%' }}>
      {isVisible ? children : null}
    </div>
  );
}
