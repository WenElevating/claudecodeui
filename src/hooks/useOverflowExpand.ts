import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook for text truncation with click-to-expand behavior.
 * Detects overflow via ResizeObserver and manages expanded state.
 */
export function useOverflowExpand<T extends HTMLElement>(deps: unknown[] = []) {
  const ref = useRef<T>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const checkRef = useRef<() => void>(() => {});

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;

    const check = () => {
      setIsOverflowing(el.scrollWidth > parent.clientWidth + 1);
    };
    checkRef.current = check;

    const ro = new ResizeObserver(check);
    ro.observe(parent);
    check();

    return () => ro.disconnect();
  }, deps);

  useEffect(() => {
    checkRef.current();
  }, [isExpanded]);

  const toggle = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return { ref, isExpanded, isOverflowing, toggle };
}
