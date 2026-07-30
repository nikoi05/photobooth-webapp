/**
 * FormatPicker
 *
 * Reusable format selector used by both the Upload and Camera flows.
 *
 * Props:
 *   selected  {string}           id of the currently selected format
 *   onChange  {(format) => void} called with the full format object on selection
 *
 * Each format exposes:
 *   id            unique key
 *   label         display name
 *   requiredCount number of photos needed
 *   description   short human-readable hint
 *   layout        visual grid hint ("1x4" | "2x2" | "1x2" | "1x1")
 */

export const FORMATS = [
  {
    id: "strip-4",
    label: "4-Shot Strip",
    requiredCount: 4,
    description: "4 photos · classic strip",
    layout: "1x4",
  },
  {
    id: "strip-3",
    label: "3-Shot Strip",
    requiredCount: 3,
    description: "3 photos · short strip",
    layout: "1x3",
  },
  {
    id: "strip-2",
    label: "2-Shot Strip",
    requiredCount: 2,
    description: "2 photos · duo strip",
    layout: "1x2",
  },
];

/** Tiny visual preview of a layout using mini boxes */
function LayoutPreview({ layout }) {
  const configs = {
    "1x4": Array(4).fill(null),
    "1x3": Array(3).fill(null),
    "1x2": Array(2).fill(null),
  };

  const cells = configs[layout] ?? configs["1x4"];

  return (
    <div className="grid grid-cols-1 gap-1" aria-hidden="true">
      {cells.map((_, i) => (
        <div
          key={i}
          className="bg-current rounded"
          style={{ width: "20px", height: "16px" }}
        />
      ))}
    </div>
  );
}

export default function FormatPicker({ selected, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-label="Choose a photo strip format"
      className="flex flex-wrap justify-center gap-4"
    >
      {FORMATS.map((format) => {
        const isSelected = selected === format.id;
        return (
          <button
            key={format.id}
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(format)}
            className={`
              flex flex-col items-center gap-3
              px-8 py-6 rounded-2xl border-2
              transition-all duration-250
              cursor-pointer select-none
              focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40
              ${isSelected
                ? "bg-primary border-primary text-white shadow-xl scale-105"
                : "bg-surface border-surface/0 text-black hover:border-primary/30 hover:shadow-md hover:scale-102"
              }
            `}
          >
            {/* Layout mini-preview */}
            <span className={isSelected ? "text-white" : "text-primary/70"}>
              <LayoutPreview layout={format.layout} />
            </span>

            {/* Label */}
            <span className="font-main font-semibold text-base tracking-wide">
              {format.label}
            </span>

            {/* Description */}
            <span className={`font-main text-xs ${isSelected ? "text-white/60" : "text-black/40"}`}>
              {format.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
