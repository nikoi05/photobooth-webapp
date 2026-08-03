/**
 * LiveStripPreview
 *
 * Reusable live photo strip preview styled after a classic physical photobooth strip:
 *   - Sharp rectangle (no border-radius)
 *   - White border/padding around the whole strip
 *   - Photos flush with thin white dividers between them
 *   - Bottom label area with italic script title + small caps date line
 *
 * Props:
 *   photos        {Array<{ previewUrl: string }>}
 *   requiredCount {number}
 *   filter        {{ id, label, css }}
 *   format        {{ id, label }}
 *   visible       {boolean}
 *   title         {string}   Optional name/title line (italic script)
 *   subtitle      {string}   Optional subtitle (small caps)
 */

const PLACEHOLDER_COLORS = ["#d6c9b8", "#cbbfaf", "#c0b5a6", "#b5ab9c"];

export default function LiveStripPreview({
  photos = [],
  requiredCount = 4,
  filter = null,
  format = null,
  visible = true,
  title = "Sandali",
  subtitle = "Story in each Frame",
}) {
  const slots = Array.from({ length: requiredCount }, (_, i) => photos[i] ?? null);

  return (
    <div
      className="flex flex-col items-center gap-3 select-none"
      style={{
        opacity:       visible ? 1 : 0,
        transform:     visible ? "translateY(0)" : "translateY(16px)",
        transition:    "opacity 500ms ease, transform 500ms ease",
        pointerEvents: visible ? "auto" : "none",
        flexShrink:    0,
      }}
    >
      {/* "Preview" label above */}
      <p className="font-main text-xs text-black/40 tracking-widest uppercase">
        Preview
      </p>

      {/* ── Strip card ─────────────────────────────────────────── */}
      {/*
        Width logic:
          - Desktop (sidebar): 18vw, capped at 160px
          - Tablet/mobile (column layout, ≤1024px): 35vw, capped at 200px, min 130px
        Handled via a scoped media query so this component stays self-contained.
      */}
      <style>{`
        .live-strip-card {
          width: clamp(100px, 18vw, 160px);
        }
        @media (max-width: 1024px) {
          .live-strip-card {
            width: clamp(130px, 35vw, 200px);
          }
        }
      `}</style>

      <div
        className="live-strip-card"
        style={{
          backgroundColor: "#ffffff",
          padding: "6px 6px 0 6px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)",
          borderRadius: "2px",
        }}
      >
        {/* Photo slots */}
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          {slots.map((photo, i) => (
            <div
              key={i}
              style={{ width: "100%", aspectRatio: "3/2", overflow: "hidden" }}
            >
              {photo ? (
                <img
                  src={photo.previewUrl}
                  alt=""
                  aria-hidden="true"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    filter: filter?.css ?? "none",
                    transition: "filter 350ms ease",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(0,0,0,0.18)",
                  }}
                  aria-hidden="true"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ width: "35%", height: "35%" }}
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Bottom label area ────────────────────────────────── */}
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
          {/* Italic script title */}
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

          {/* Divider */}
          <div style={{ width: "60%", height: "0.5px", backgroundColor: "#ccc", margin: "2px 0" }} />

          {/* Small caps subtitle */}
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

      {/* Filter label below strip */}
      <p className="font-main text-xs text-primary/50 italic">
        {filter?.label ?? "Original"}
      </p>
    </div>
  );
}
