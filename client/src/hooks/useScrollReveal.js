/**
 * useScrollReveal
 *
 * Attaches an IntersectionObserver to a ref and returns whether
 * the element has entered the viewport. Once visible, stays visible.
 *
 * Usage:
 *   const [ref, visible] = useScrollReveal();
 *   <div ref={ref} style={{ opacity: visible ? 1 : 0, ... }} />
 *
 * Options:
 *   threshold  — 0–1, how much of the element must be visible (default 0.15)
 *   rootMargin — CSS margin around viewport (default "0px 0px -60px 0px")
 */
import { useEffect, useRef, useState } from "react";

export function useScrollReveal({
  threshold = 0.15,
  rootMargin = "0px 0px -60px 0px",
} = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el); // fire once
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, visible];
}
