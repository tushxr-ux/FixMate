import { useState, useEffect, useRef } from 'react';

/**
 * LazySection
 * Uses IntersectionObserver for smooth entrance and browser content-visibility
 * for off-screen rendering optimization WITHOUT layout shifts or breaking anchor navigation.
 */
export default function LazySection({ children, className = '', style = {} }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

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
      { rootMargin: '200px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: '1px 600px',
        width: '100%',
        opacity: isVisible ? 1 : 0.9,
        transition: 'opacity 0.3s ease',
        ...style
      }}
    >
      {children}
    </div>
  );
}
