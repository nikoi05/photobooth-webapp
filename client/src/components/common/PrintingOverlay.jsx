/**
 * PrintingOverlay
 *
 * Full-screen loading animation shown while the strip is being generated.
 * Mimics a classic photobooth thermal printer — a strip slowly feeds out
 * from a slot, with a soft glow and scan-line effect.
 *
 * Props:
 *   visible {boolean}
 */
export default function PrintingOverlay({ visible }) {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-theme"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 300ms ease",
      }}
    >
      <style>{`
        @keyframes strip-feed {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(0%); }
        }
        @keyframes scanline {
          0%   { top: 0%; }
          100% { top: 100%; }
        }
        @keyframes slot-glow {
          0%, 100% { box-shadow: 0 0 12px 2px rgba(158,59,44,0.25); }
          50%       { box-shadow: 0 0 24px 6px rgba(158,59,44,0.55); }
        }
        @keyframes fade-label {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }
        @keyframes dot-pulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%           { opacity: 1;   transform: scale(1); }
        }
      `}</style>

      {/* ── Printer body ─────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-6">

        {/* Printer shell */}
        <div
          style={{
            width: "clamp(140px, 24vw, 200px)",
            background: "var(--color-surface)",
            borderRadius: "16px 16px 8px 8px",
            padding: "18px 18px 0 18px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Top vent lines */}
          <div className="flex gap-1 justify-center mb-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: "3px",
                  height: "10px",
                  borderRadius: "2px",
                  backgroundColor: "rgba(0,0,0,0.1)",
                }}
              />
            ))}
          </div>

          {/* Paper slot with glow */}
          <div
            style={{
              width: "100%",
              height: "6px",
              borderRadius: "3px",
              backgroundColor: "rgba(0,0,0,0.12)",
              overflow: "visible",
              position: "relative",
              animation: "slot-glow 1.4s ease-in-out infinite",
            }}
          />
        </div>

        {/* ── Strip feeding out ────────────────────────────── */}
        <div
          style={{
            width: "clamp(110px, 18vw, 160px)",
            height: "clamp(180px, 32vw, 280px)",
            position: "relative",
            overflow: "hidden",
            marginTop: "-8px",
          }}
        >
          {/* The strip itself */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "#ffffff",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              animation: "strip-feed 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              padding: "6px 6px 0 6px",
            }}
          >
            {/* Photo placeholders */}
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  borderRadius: "2px",
                  backgroundColor: `hsl(${28 + i * 5}, ${20 + i * 4}%, ${82 - i * 3}%)`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>

          {/* Scan line */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: "3px",
              background: "linear-gradient(90deg, transparent, rgba(158,59,44,0.6), transparent)",
              animation: "scanline 1.2s linear infinite",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* ── Label ────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3">
          <p
            className="font-main font-semibold text-black tracking-wide"
            style={{
              fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
              animation: "fade-label 1.6s ease-in-out infinite",
            }}
          >
            Printing your strip
          </p>

          {/* Animated dots */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-primary)",
                  animation: `dot-pulse 1.2s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
