import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const AUTO_SCROLL_PX_PER_SEC = 34;
const RESUME_RAMP_MS = 420;
const DECEL_DURATION_MS = 240;

interface UseStableCarouselOptions {
  trackKey: string;
  itemCount: number;
}

export function useStableCarousel({
  trackKey,
  itemCount,
}: UseStableCarouselOptions) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackLeftRef = useRef<HTMLDivElement>(null);
  const trackMainRef = useRef<HTMLDivElement>(null);
  const trackRightRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);
  const [isTouchActive, setIsTouchActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const [isDecelerating, setIsDecelerating] = useState(false);

  // Mutable refs keep sub-pixel scroll & velocity completely out of React state
  const floatScrollRef = useRef<number | null>(null);
  const velocityFactorRef = useRef<number>(0);
  const touchIdRef = useRef<number | null>(null);
  const touchEndTimerRef = useRef<number | null>(null);
  const scrollSettleTimerRef = useRef<number | null>(null);
  const manualScrollUntilRef = useRef<number>(0);
  const initializedSignatureRef = useRef<string | null>(null);

  const dragStateRef = useRef<{
    active: boolean;
    pointerId: number | null;
    startX: number;
    startScroll: number;
    moved: boolean;
  }>({ active: false, pointerId: null, startX: 0, startScroll: 0, moved: false });

  const enableInfiniteLoop = itemCount >= 2;
  const trackSignature = useMemo(
    () => `${trackKey}::${itemCount}`,
    [trackKey, itemCount]
  );

  const shouldAutoAdvance =
    enableInfiniteLoop &&
    isInViewport &&
    !isUserPaused &&
    !isHovered &&
    !isFocusedWithin &&
    !isTouchActive &&
    !isDragging &&
    !prefersReducedMotion;

  const updateProgressBar = useCallback((ratio: number) => {
    const bar = progressBarRef.current;
    if (!bar) return;
    const clamped = Math.min(1, Math.max(0.06, ratio));
    bar.style.transform = `scaleX(${clamped.toFixed(4)})`;
  }, []);

  const getLoopMetrics = useCallback(() => {
    const leftEl = trackLeftRef.current;
    const mainEl = trackMainRef.current;
    const rightEl = trackRightRef.current;
    if (!leftEl || !mainEl || !rightEl) {
      return { mainStart: 0, span: 0 };
    }
    const mainStart = mainEl.offsetLeft;
    const span = Math.max(0, rightEl.offsetLeft - mainEl.offsetLeft);
    return { mainStart, span };
  }, []);

  const wrapIntoCenterTrack = useCallback(
    (forceAlways: boolean) => {
      const el = scrollRef.current;
      if (!el) return;

      const { mainStart, span } = getLoopMetrics();
      if (!enableInfiniteLoop || span <= 0) {
        const maxScroll = Math.max(1, el.scrollWidth - el.clientWidth);
        updateProgressBar(el.scrollLeft / maxScroll);
        return;
      }

      const rightBoundary = mainStart + span;
      const safetyEdge = Math.max(24, span * 0.15);

      if (forceAlways) {
        if (el.scrollLeft >= rightBoundary) {
          el.scrollLeft -= span;
        } else if (el.scrollLeft < mainStart) {
          el.scrollLeft += span;
        }
      } else {
        if (el.scrollLeft >= mainStart + span * 2 - el.clientWidth - safetyEdge) {
          el.scrollLeft -= span;
        } else if (el.scrollLeft <= safetyEdge) {
          el.scrollLeft += span;
        }
      }

      floatScrollRef.current = el.scrollLeft;
      const relativeOffset = (((el.scrollLeft - mainStart) % span) + span) % span;
      updateProgressBar(relativeOffset / span);
    },
    [enableInfiniteLoop, getLoopMetrics, updateProgressBar]
  );

  // Respect prefers-reduced-motion dynamically
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  // Mark lateral clones as inert so screen readers & keyboard only traverse main track
  useEffect(() => {
    if (trackLeftRef.current) trackLeftRef.current.setAttribute('inert', '');
    if (trackRightRef.current) trackRightRef.current.setAttribute('inert', '');
  }, [trackSignature, enableInfiniteLoop]);

  // Only run rAF loop when carousel is visible in viewport
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !('IntersectionObserver' in window)) {
      setIsInViewport(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setIsInViewport(entry.isIntersecting);
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Initialize center track position ONLY when trackSignature (tab/dataset) changes, NEVER on hover/click/modal
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const placeAtCenterTrackIfNeeded = () => {
      if (initializedSignatureRef.current === trackSignature) return;
      const { mainStart, span } = getLoopMetrics();
      if (enableInfiniteLoop && span > 0) {
        el.scrollLeft = mainStart;
        floatScrollRef.current = mainStart;
        initializedSignatureRef.current = trackSignature;
        updateProgressBar(0.1);
      } else if (!enableInfiniteLoop) {
        el.scrollLeft = 0;
        floatScrollRef.current = 0;
        initializedSignatureRef.current = trackSignature;
        updateProgressBar(1);
      }
    };

    placeAtCenterTrackIfNeeded();

    if (typeof ResizeObserver !== 'undefined' && trackMainRef.current) {
      const ro = new ResizeObserver(() => {
        placeAtCenterTrackIfNeeded();
      });
      ro.observe(trackMainRef.current);
      return () => ro.disconnect();
    }
  }, [trackSignature, enableInfiniteLoop, getLoopMetrics, updateProgressBar]);

  // Clear timers and stuck drag state on unmount or window blur
  useEffect(() => {
    const handleWindowBlur = () => {
      dragStateRef.current.active = false;
      dragStateRef.current.pointerId = null;
      touchIdRef.current = null;
      setIsDragging(false);
      setIsTouchActive(false);
    };
    window.addEventListener('blur', handleWindowBlur);
    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      if (touchEndTimerRef.current) window.clearTimeout(touchEndTimerRef.current);
      if (scrollSettleTimerRef.current) window.clearTimeout(scrollSettleTimerRef.current);
    };
  }, []);

  // Trigger smooth deceleration when pausing from hover/focus without cutting off abruptly
  useEffect(() => {
    if (shouldAutoAdvance) {
      setIsDecelerating(false);
      return;
    }
    if (
      enableInfiniteLoop &&
      isInViewport &&
      !isTouchActive &&
      !isDragging &&
      !prefersReducedMotion &&
      velocityFactorRef.current > 0.01
    ) {
      setIsDecelerating(true);
    } else {
      velocityFactorRef.current = 0;
      setIsDecelerating(false);
    }
  }, [
    shouldAutoAdvance,
    enableInfiniteLoop,
    isInViewport,
    isTouchActive,
    isDragging,
    prefersReducedMotion,
  ]);

  const isAnimating =
    enableInfiniteLoop &&
    isInViewport &&
    !isTouchActive &&
    !isDragging &&
    !prefersReducedMotion &&
    (shouldAutoAdvance || isDecelerating);

  // Smooth requestAnimationFrame driver with gradual ramp-up & ramp-down (0 React re-renders per frame)
  useEffect(() => {
    if (!isAnimating) return;
    const el = scrollRef.current;
    if (!el) return;

    floatScrollRef.current = el.scrollLeft;

    let rafId = 0;
    let lastTs = 0;

    const tick = (ts: number) => {
      if (lastTs === 0) {
        lastTs = ts;
      }
      const dtMs = Math.min(50, Math.max(0, ts - lastTs));
      const dtSec = dtMs / 1000;
      lastTs = ts;

      const currentEl = scrollRef.current;
      if (!currentEl) return;

      // Respect smooth arrow button scrolling before resuming rAF control
      if (ts < manualScrollUntilRef.current) {
        floatScrollRef.current = currentEl.scrollLeft;
        rafId = window.requestAnimationFrame(tick);
        return;
      }

      if (shouldAutoAdvance) {
        velocityFactorRef.current = Math.min(
          1,
          velocityFactorRef.current + dtMs / RESUME_RAMP_MS
        );
      } else {
        velocityFactorRef.current = Math.max(
          0,
          velocityFactorRef.current - dtMs / DECEL_DURATION_MS
        );
      }

      if (velocityFactorRef.current <= 0.001 && !shouldAutoAdvance) {
        velocityFactorRef.current = 0;
        setIsDecelerating(false);
        return;
      }

      const { mainStart, span } = getLoopMetrics();
      if (span > 0) {
        const currentPos = floatScrollRef.current ?? currentEl.scrollLeft;
        // Ease velocity smoothly for organic inertia
        const easedVelocity =
          velocityFactorRef.current * (2 - velocityFactorRef.current);
        let nextPos =
          currentPos + AUTO_SCROLL_PX_PER_SEC * easedVelocity * dtSec;

        if (nextPos >= mainStart + span) {
          nextPos -= span;
        } else if (nextPos < mainStart) {
          nextPos += span;
        }

        floatScrollRef.current = nextPos;
        currentEl.scrollLeft = nextPos;

        const rel = (((nextPos - mainStart) % span) + span) % span;
        updateProgressBar(rel / span);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [isAnimating, shouldAutoAdvance, getLoopMetrics, updateProgressBar]);

  const handleScroll = useCallback(() => {
    if (shouldAutoAdvance || isDecelerating) return;

    wrapIntoCenterTrack(false);

    if (scrollSettleTimerRef.current) {
      window.clearTimeout(scrollSettleTimerRef.current);
    }
    scrollSettleTimerRef.current = window.setTimeout(() => {
      wrapIntoCenterTrack(true);
    }, 180);
  }, [shouldAutoAdvance, isDecelerating, wrapIntoCenterTrack]);

  const scrollByAmount = useCallback(
    (direction: 'left' | 'right') => {
      const el = scrollRef.current;
      if (!el) return;
      const step = Math.max(260, Math.round(el.clientWidth * 0.72));
      const { mainStart, span } = getLoopMetrics();

      if (enableInfiniteLoop && span > 0) {
        if (direction === 'left' && el.scrollLeft - step < mainStart * 0.2) {
          el.scrollLeft += span;
        } else if (
          direction === 'right' &&
          el.scrollLeft + step > mainStart + span * 1.8
        ) {
          el.scrollLeft -= span;
        }
      }

      manualScrollUntilRef.current = performance.now() + 480;
      el.scrollBy({
        left: direction === 'left' ? -step : step,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    },
    [enableInfiniteLoop, getLoopMetrics, prefersReducedMotion]
  );

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const el = scrollRef.current;
    if (!el) return;
    velocityFactorRef.current = 0;
    setIsDragging(true);
    dragStateRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      moved: false,
    };
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragStateRef.current.active) return;
      if (
        dragStateRef.current.pointerId !== null &&
        e.pointerId !== dragStateRef.current.pointerId
      ) {
        return;
      }
      const el = scrollRef.current;
      if (!el) return;
      const delta = e.clientX - dragStateRef.current.startX;
      if (Math.abs(delta) > 6 && !dragStateRef.current.moved) {
        dragStateRef.current.moved = true;
        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          // Ignore if capture is unsupported
        }
      }
      if (dragStateRef.current.moved) {
        el.scrollLeft = dragStateRef.current.startScroll - delta;
        wrapIntoCenterTrack(false);
      }
    },
    [wrapIntoCenterTrack]
  );

  const handlePointerUpOrCancel = useCallback(
    (e?: React.PointerEvent<HTMLDivElement>) => {
      const el = scrollRef.current;
      if (el && e && dragStateRef.current.pointerId !== null) {
        try {
          if (el.hasPointerCapture(dragStateRef.current.pointerId)) {
            el.releasePointerCapture(dragStateRef.current.pointerId);
          }
        } catch {
          // Ignore
        }
      }
      dragStateRef.current.active = false;
      dragStateRef.current.pointerId = null;
      setIsDragging(false);
      wrapIntoCenterTrack(true);
      window.setTimeout(() => {
        dragStateRef.current.moved = false;
      }, 50);
    },
    [wrapIntoCenterTrack]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    // Multi-touch protection: ignore extra touch points after gesture starts
    if (touchIdRef.current !== null) return;
    const primaryTouch = e.changedTouches[0];
    if (primaryTouch) {
      touchIdRef.current = primaryTouch.identifier;
    }
    if (touchEndTimerRef.current) window.clearTimeout(touchEndTimerRef.current);
    velocityFactorRef.current = 0;
    setIsTouchActive(true);
  }, []);

  const handleTouchEndOrCancel = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (touchIdRef.current !== null) {
        const stillDown = Array.from(e.touches).some(
          (t) => t.identifier === touchIdRef.current
        );
        if (stillDown) return;
        touchIdRef.current = null;
      }
      if (touchEndTimerRef.current) window.clearTimeout(touchEndTimerRef.current);
      touchEndTimerRef.current = window.setTimeout(() => {
        wrapIntoCenterTrack(true);
        setIsTouchActive(false);
      }, 1300);
    },
    [wrapIntoCenterTrack]
  );

  const handleClickCapture = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (dragStateRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const statusLabel = shouldAutoAdvance
    ? 'Auto • Loop ∞'
    : isHovered
      ? 'Pausado (Hover)'
      : isUserPaused
        ? 'Pausado'
        : isTouchActive
          ? 'Control Táctil'
          : 'Deslizamiento Manual';

  return {
    scrollRef,
    trackLeftRef,
    trackMainRef,
    trackRightRef,
    progressBarRef,
    enableInfiniteLoop,
    isAutoScrolling: shouldAutoAdvance,
    isUserPaused,
    setIsUserPaused,
    statusLabel,
    scrollByAmount,
    containerHandlers: {
      onScroll: handleScroll,
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => {
        setIsHovered(false);
        if (dragStateRef.current.active) {
          handlePointerUpOrCancel();
        }
      },
      onFocus: () => setIsFocusedWithin(true),
      onBlur: (e: React.FocusEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsFocusedWithin(false);
        }
      },
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEndOrCancel,
      onTouchCancel: handleTouchEndOrCancel,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUpOrCancel,
      onPointerCancel: handlePointerUpOrCancel,
      onClickCapture: handleClickCapture,
    },
  };
}
