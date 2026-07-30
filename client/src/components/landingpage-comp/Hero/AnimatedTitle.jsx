/**
 * AnimatedTitle
 *
 * Manages the Baybayin ↔ Latin transformation for the hero heading.
 * Cycles every 4 s with a 500 ms crossfade (opacity + blur + scale).
 * Respects prefers-reduced-motion — disables transition when set.
 */
import { useEffect, useRef, useState } from "react";

const REDUCED = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const LATIN   = "Sandali";
const BAYBAYIN = "ᜐᜈ᜔ᜇᜎᜒ";

export default function AnimatedTitle() {
  const reduced = useRef(REDUCED());
  const [isBaybayin, setIsBaybayin] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (reduced.current) return; // no animation for reduced-motion users

    const id = setInterval(() => {
      setFading(true);
      const swap = setTimeout(() => {
        setIsBaybayin((prev) => !prev);
        setFading(false);
      }, 500);
      return () => clearTimeout(swap);
    }, 4000);

    return () => clearInterval(id);
  }, []);

  const text = isBaybayin ? BAYBAYIN : LATIN;

  return (
    <>
      <h1
        className="font-main leading-none tracking-tight text-black"
        style={{
          fontSize: "clamp(4rem, 12vw, 10rem)",
          opacity: fading ? 0 : 1,
          transform: fading ? "scale(0.95)" : "scale(1)",
          filter: fading ? "blur(4px)" : "blur(0px)",
          transition: reduced.current
            ? "none"
            : "opacity 500ms ease, transform 500ms ease, filter 500ms ease",
          willChange: "opacity, transform, filter",
        }}
      >
        {text}
      </h1>

      <p
        className="font-main italic text-black/70"
        style={{ fontSize: "clamp(0.9rem, 2vw, 1.2rem)", marginTop: "1.5rem" }}
      >
        Story in each Frame
      </p>
    </>
  );
}
