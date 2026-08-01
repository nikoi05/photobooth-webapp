import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../components/navbar";
import { PrimaryButton, BackLink } from "../components/common/StepFlow";

export default function PreviewPage() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Data passed from Generate via navigate state (fallback to null gracefully)
  const { url, filename } = location.state ?? {};

  // Page entrance animation
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setEntered(true))
    );
    return () => cancelAnimationFrame(raf);
  }, []);

  const fade = (delay = 0) => ({
    opacity:   entered ? 1 : 0,
    transform: entered ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 500ms ease ${delay}ms, transform 500ms cubic-bezier(0.33,1,0.68,1) ${delay}ms`,
  });

  const handleDownload = () => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = filename ?? "photo-strip.jpg";
    a.click();
  };

  return (
    <div className="min-h-screen bg-theme flex flex-col">

      <header className="sticky top-0 z-50 w-full px-8 pt-4 pb-2 md:px-6 md:pt-3 sm:px-4 sm:pt-2">
        <div style={fade(0)}>
          <NavBar />
        </div>
        <div className="mt-3 pl-1" style={fade(80)}>
          <BackLink onClick={() => navigate("/upload")} label="back to upload" />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-8 px-8 py-12 md:px-6 sm:px-4">

        {/* Heading */}
        <div className="flex flex-col items-center gap-2 text-center" style={fade(100)}>
          <h1
            className="font-main font-bold text-black tracking-tight leading-none"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          >
            Your Strip
          </h1>
          <p
            className="font-main italic text-black/50"
            style={{ fontSize: "clamp(0.85rem, 1.8vw, 1rem)" }}
          >
            {url ? "Looking good! Save or start over." : "No strip generated yet."}
          </p>
        </div>

        {/* Strip preview */}
        <div style={fade(200)}>
          {url ? (
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "10px 10px 0 10px",
                boxShadow: "0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)",
                borderRadius: "2px",
                width: "clamp(140px, 18vw, 220px)",
              }}
            >
              <img
                src={`http://localhost:3000${url}`}
                alt="Your generated photo strip"
                style={{ width: "100%", display: "block" }}
              />
              {/* Label area */}
              <div
                style={{
                  padding: "10px 4px 14px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                <p
                  style={{
                    fontFamily: '"DM Serif Display", serif',
                    fontStyle: "italic",
                    fontSize: "clamp(0.6rem, 1.3vw, 0.85rem)",
                    color: "#1a1a1a",
                    margin: 0,
                  }}
                >
                  Sandali
                </p>
                <div style={{ width: "60%", height: "0.5px", backgroundColor: "#ccc", margin: "2px 0" }} />
                <p
                  style={{
                    fontFamily: '"DM Serif Display", serif',
                    fontSize: "clamp(0.4rem, 0.9vw, 0.6rem)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#555",
                    margin: 0,
                  }}
                >
                  Story in each Frame
                </p>
              </div>
            </div>
          ) : (
            /* Fallback — no strip data */
            <div
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/25 bg-surface/60"
              style={{ width: "clamp(140px, 18vw, 220px)", aspectRatio: "1/2.5" }}
            >
              <span className="text-primary/30 text-5xl">📸</span>
              <p className="font-main text-xs text-primary/35 mt-3">No strip yet</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-3" style={fade(300)}>
          {url && (
            <PrimaryButton onClick={handleDownload}>
              Download Strip ↓
            </PrimaryButton>
          )}
          <button
            onClick={() => navigate("/upload")}
            className="font-main text-sm text-black/35 hover:text-primary transition-colors duration-200 cursor-pointer bg-transparent border-none p-0"
          >
            ← start over
          </button>
        </div>

      </main>
    </div>
  );
}
