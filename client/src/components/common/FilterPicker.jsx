/**
 * FilterPicker
 *
 * Reusable global filter selector. Applies a CSS filter string to a
 * preview swatch so users see the effect before committing.
 *
 * Props:
 *   selected    {string}            id of the active filter ("none" by default)
 *   onChange    {(filter) => void}  called with the full filter object on change
 *   previewSrc  {string}            image src to show in each swatch (optional)
 *
 * Each filter exposes:
 *   id      unique key
 *   label   display name
 *   css     CSS filter string to apply to the photo canvas
 */
import placeholderSrc from "../../assets/lala.png";

export const FILTERS = [
  {
    id: "none",
    label: "Original",
    css: "none",
  },
  {
    id: "sandali",
    label: "Sandali",
    // Warm sepia with a soft glow — matches the app's parchment palette
    css: "sepia(0.5) saturate(1.3) brightness(1.08) contrast(0.95)",
  },
  {
    id: "golden",
    label: "Golden",
    // Rich warm gold, like late afternoon sun
    css: "sepia(0.7) saturate(1.6) brightness(1.1) contrast(0.9)",
  },
  {
    id: "faded",
    label: "Faded",
    // Washed-out analog print look
    css: "sepia(0.2) contrast(0.8) brightness(1.15) saturate(0.7)",
  },
  {
    id: "mono",
    label: "Mono",
    // Clean black & white with slight boost
    css: "grayscale(1) contrast(1.1) brightness(1.05)",
  },
  {
    id: "noir",
    label: "Noir",
    // High contrast dramatic b&w
    css: "grayscale(1) contrast(1.5) brightness(0.88)",
  },
  {
    id: "terracotta",
    label: "Terracotta",
    // Deep warm reddish-brown — echoes the primary color
    css: "sepia(0.6) saturate(1.8) hue-rotate(-10deg) brightness(0.95) contrast(1.05)",
  },
];

export default function FilterPicker({ selected = "none", onChange, previewSrc }) {
  const src = previewSrc ?? placeholderSrc;

  return (
    <div
      role="radiogroup"
      aria-label="Choose a photo filter"
      className="flex flex-wrap justify-center gap-3"
    >
      {FILTERS.map((filter) => {
        const isSelected = selected === filter.id;
        return (
          <button
            key={filter.id}
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(filter)}
            className={`
              flex flex-col items-center gap-1.5
              rounded-xl border-2 overflow-hidden
              transition-all duration-200
              cursor-pointer select-none
              focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40
              ${isSelected
                ? "border-primary shadow-lg scale-105"
                : "border-surface hover:border-primary/50 hover:scale-105 bg-surface"
              }
            `}
          >
            {/* Filter swatch */}
            <div className="w-16 h-16 overflow-hidden">
              <img
                src={src}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover"
                style={{ filter: filter.css }}
              />
            </div>

            {/* Label */}
            <span
              className={`
                font-main text-xs pb-1.5 px-2
                ${isSelected ? "text-primary font-semibold" : "text-black/50"}
              `}
            >
              {filter.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
