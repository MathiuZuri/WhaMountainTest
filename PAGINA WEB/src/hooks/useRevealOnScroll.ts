import { useEffect, useRef, useState } from 'react';

/**
 * Hook ligero de entrada progresiva usando IntersectionObserver.
 * Respeta automáticamente `prefers-reduced-motion: reduce`.
 */
export function useRevealOnScroll<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.08,
): { ref: React.RefObject<T>; isRevealed: boolean } {
  const ref = useRef<T>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    return Boolean(reduced || !('IntersectionObserver' in window));
  });

  useEffect(() => {
    if (isRevealed) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isRevealed, threshold]);

  return { ref, isRevealed };
}
