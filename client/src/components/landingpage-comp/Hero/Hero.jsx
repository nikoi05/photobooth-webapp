/**
 * Hero
 *
 * Orchestrates the full hero section:
 *  - Centered title + CTA
 *  - 4 floating photobooth strips at top-left, top-right, bottom-left, bottom-right
 *  - Responsive: 4 on desktop, 3 on tablet (≥768 px), 2 on mobile (≥480 px), 1 on small
 *
 * Hero owns nothing about the strip animations; FloatingPhotoStrip owns those.
 * Hero owns entrance timing: each strip is delayed by 150 ms × index.
 */
import { useNavigate } from "react-router-dom";
import AnimatedTitle from "./AnimatedTitle";
import CTAButton from "./CTAButton";
import FloatingPhotoStrip from "./FloatingPhotoStrip";

/**
 * Strip configuration.
 *  position: Tailwind absolute-positioning classes
 *  rotation: unique, asymmetric degrees
 *  floatDuration: 6–10 s, all different
 *  depth: front / middle / back
 *  visibleFrom: minimum viewport class before this strip appears
 *               "always" | "sm" | "md" | "lg"
 */
const STRIPS = [
  {
    id: "tl",
    label: "Photobooth strip, top left",
    rotation: -12,
    floatDuration: 7,
    floatOffset: 11,
    depth: "front",
    visibleFrom: "sm",   // hidden on < 480px to avoid title overlap
    positionStyle: {
      position: "absolute",
      top: "4%",
      left: "2%",
    },
  },
  {
    id: "tr",
    label: "Photobooth strip, top right",
    rotation: 8,
    floatDuration: 9,
    floatOffset: 9,
    depth: "back",
    visibleFrom: "sm",   // hidden on < 480px
    positionStyle: {
      position: "absolute",
      top: "6%",
      right: "2%",
    },
  },
  {
    id: "bl",
    label: "Photobooth strip, bottom left",
    rotation: -6,
    floatDuration: 6,
    floatOffset: 10,
    depth: "middle",
    visibleFrom: "md",   // hidden on < 768px
    positionStyle: {
      position: "absolute",
      bottom: "4%",
      left: "3%",
    },
  },
  {
    id: "br",
    label: "Photobooth strip, bottom right",
    rotation: 10,
    floatDuration: 8,
    floatOffset: 12,
    depth: "front",
    visibleFrom: "sm",   // hidden on < 480px to avoid title overlap
    positionStyle: {
      position: "absolute",
      bottom: "5%",
      right: "2%",
    },
  },
];

/** Map visibleFrom key → Tailwind hidden/block responsive prefix */
const VISIBLE_CLASSES = {
  always: "",
  sm: "hidden min-[480px]:block",
  md: "hidden md:block",
  lg: "hidden lg:block",
};

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section
      aria-label="Hero section"
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{ minHeight: "calc(100svh - 80px)" }} // full height minus navbar
    >
      {/* ── Floating strips ────────────────────────────────────────── */}
      {STRIPS.map((strip, i) => (
        <FloatingPhotoStrip
          key={strip.id}
          rotation={strip.rotation}
          floatDuration={strip.floatDuration}
          floatOffset={strip.floatOffset}
          depth={strip.depth}
          alt={strip.label}
          entranceDelay={150 * i}
          className={VISIBLE_CLASSES[strip.visibleFrom]}
          style={strip.positionStyle}
        />
      ))}

      {/* ── Center content ─────────────────────────────────────────── */}
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center gap-3 px-4"
        style={{ pointerEvents: "auto" }}
      >
        <AnimatedTitle />
        <CTAButton onClick={()=> navigate("/start")}/>
      </div>
    </section>
  );
}
