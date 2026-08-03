/**
 * PhotoStrip
 *
 * Classic physical photobooth strip style:
 *   - White border surround (like a print)
 *   - Photos stacked with thin white gaps
 *   - Small bottom label area with italic title + small caps line
 *   - Near-square border-radius (classic print feel)
 *
 * Props:
 *   photos      {string[]}  Array of image src strings. Empty slots use placeholder.
 *   count       {number}    Total slots. Defaults to 4.
 *   alt         {string}    Accessible label.
 *   placeholder {string}    Fallback image src.
 *   title       {string}    Italic script line in label area.
 *   subtitle    {string}    Small caps line in label area.
 */
import placeholderSrc from "../../../assets/lala.png";

export default function PhotoStrip({
  photos = [],
  count = 4,
  alt = "Photobooth strip",
  placeholder = placeholderSrc,
  title = "Sandali",
  subtitle = "Story in each Frame",
}) {
  const slots = Array.from({ length: count }, (_, i) => photos[i] ?? placeholder);

  return (
    <div
      role="img"
      aria-label={alt}
      className="select-none"
      style={{
        width: "112px",
        backgroundColor: "#ffffff",
        padding: "6px 6px 0 6px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)",
        borderRadius: "2px",
      }}
    >
      {/* Photos */}
      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        {slots.map((src, i) => (
          <div
            key={i}
            aria-hidden="true"
            style={{ width: "100%", aspectRatio: "3/2", overflow: "hidden" }}
          >
            <img
              src={src}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        ))}
      </div>

      {/* Bottom label */}
      <div
        style={{
          padding: "8px 4px 10px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px",
        }}
      >
        <p
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontStyle: "italic",
            fontSize: "clamp(0.55rem, 1.2vw, 0.75rem)",
            color: "#1a1a1a",
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          {title}
        </p>
        <div style={{ width: "60%", height: "0.5px", backgroundColor: "#ccc", margin: "2px 0" }} />
        <p
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: "clamp(0.4rem, 0.9vw, 0.55rem)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#555",
            margin: 0,
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}
