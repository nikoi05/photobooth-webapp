/**
 * FloatingPhotoStrip
 *
 * Wraps <PhotoStrip> with:
 *  - Independent float animation (up/down ~10 px, 6–10 s)
 *  - Depth simulation via scale + opacity + blur
 *  - Hover: rotate toward 0°, scale up, strengthen shadow (300 ms)
 *  - Entrance: fade-in + translateY (600 ms, staggered via entranceDelay)
 *  - Respects prefers-reduced-motion
 */
import { useEffect, useRef, useState } from "react";
import PhotoStrip from "./PhotoStrip";

const REDUCED = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const DEPTH_MAP = {
  front:  { scale: 1.00, opacity: 1.00, blur: 0 },
  middle: { scale: 0.90, opacity: 0.92, blur: 0 },
  back:   { scale: 0.80, opacity: 0.80, blur: 1 },
};

/**
 * @param {object} props
 * @param {number}   props.rotation       CSS rotation in degrees (e.g. -12)
 * @param {number}   props.floatDuration  One float cycle in seconds (6–10)
 * @param {number}   [props.floatOffset]  Vertical travel in px (default 10)
 * @param {number}   [props.entranceDelay] ms before entrance starts
 * @param {"front"|"middle"|"back"} [props.depth]
 * @param {string}   [props.alt]          Accessible description
 * @param {string}   [props.className]    Outer wrapper class (positioning)
 * @param {object}   [props.style]        Outer wrapper inline style (positioning)
 */
export default function FloatingPhotoStrip({
  rotation = 0,
  floatDuration = 8,
  floatOffset = 10,
  entranceDelay = 0,
  depth = "middle",
  alt = "Photobooth strip",
  className = "",
  style = {},
}) {
  const reduced = useRef(REDUCED());
  const [entered, setEntered] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Entrance — trigger after delay
  useEffect(() => {
    const id = setTimeout(() => setEntered(true), entranceDelay + 50); // +50 ensures paint before transition
    return () => clearTimeout(id);
  }, [entranceDelay]);

  const { scale, opacity, blur } = DEPTH_MAP[depth] ?? DEPTH_MAP.middle;

  const currentRotation = hovered ? 0 : rotation;
  const currentScale    = hovered ? scale * 1.06 : scale;

  // Entrance state shifts transform from translateY(32px) → translateY(0)
  const entranceY = entered ? 0 : 32;

  const transform = `translateY(${entranceY}px) rotate(${currentRotation}deg) scale(${currentScale})`;

  // Transition: entrance uses 600 ms with delay; hover uses 300 ms immediately
  const entranceDuration  = reduced.current ? 0 : 600;
  const hoverDuration     = reduced.current ? 0 : 300;
  const activeDelay       = entered ? 0 : (reduced.current ? 0 : entranceDelay);

  const transition = [
    `opacity ${entranceDuration}ms ease ${activeDelay}ms`,
    `transform ${entered ? hoverDuration : entranceDuration}ms cubic-bezier(0.33,1,0.68,1) ${activeDelay}ms`,
    `filter ${hoverDuration}ms ease`,
    `box-shadow ${hoverDuration}ms ease`,
  ].join(", ");

  const boxShadow = hovered
    ? "0 20px 48px rgba(0,0,0,0.18), 0 6px 16px rgba(0,0,0,0.08)"
    : "0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05)";

  // Float animation name — unique per strip to avoid keyframe collision
  const animKey = `strip-float-${floatDuration}-${floatOffset}`;

  return (
    <>
      <style>{`
        @keyframes ${animKey} {
          0%, 100% { translate: 0 0px; }
          50%       { translate: 0 -${floatOffset}px; }
        }
      `}</style>

      <div
        className={className}
        style={{
          ...style,
          opacity: entered ? opacity : 0,
          transform,
          transition,
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
          animation:
            entered && !reduced.current
              ? `${animKey} ${floatDuration}s ease-in-out infinite`
              : "none",
          boxShadow,
          willChange: "transform, opacity",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        <PhotoStrip alt={alt} />
      </div>
    </>
  );
}
