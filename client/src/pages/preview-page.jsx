import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../components/navbar";
import { PrimaryButton, BackLink } from "../components/common/StepFlow";
import { useParams } from "react-router-dom";

export default function PreviewPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { shareId } = useParams();

  // Determine where "back" should go based on which flow created this strip
  const backPath  = location.state?.from === "camera" ? "/camera" : "/upload";
  const backLabel = location.state?.from === "camera" ? "back to camera" : "back to upload";

  // fetch the strip 
  const [strip, setStrip]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState(null); // "expired" | "notfound" | "error"
  const [copyFeedback, setCopyFeedback] = useState(false);

useEffect(() => {
    async function loadStrip() {
      try {
        const response = await fetch(
            `http://localhost:3000/api/share/${shareId}`
        );

        const data = await response.json();

        if (data.success) {
            setStrip(data);
        } else if (response.status === 410) {
            setErrorType("expired");
        } else if (response.status === 404) {
            setErrorType("notfound");
        } else {
            setErrorType("error");
        }
      } catch (err) {
        console.error("Failed to load strip:", err);
        setErrorType("error");
      } finally {
        setLoading(false);
      }
    }

    loadStrip();
}, [shareId]);
  // Page entrance animation
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setEntered(true))
    );
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleDownload = async () => {
    try {
      const response = await fetch(`http://localhost:3000${strip.imageUrl}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = strip.filename ?? "photo-strip.jpg";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/share/${shareId}`;
    
    try {
      // Try native share API first (mobile)
      if (navigator.share) {
        await navigator.share({
          title: "Check out my photo strip!",
          text: "View my photo strip",
          url: shareUrl,
        });
        return;
      }
      
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const fade = (delay = 0) => ({
    opacity:   entered ? 1 : 0,
    transform: entered ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 500ms ease ${delay}ms, transform 500ms cubic-bezier(0.33,1,0.68,1) ${delay}ms`,
  });

  // Guard: show nothing (or a spinner) while the fetch is in-flight
  if (loading) {
    return (
      <div className="min-h-screen bg-theme flex items-center justify-center">
        <p className="font-main text-black/40 text-sm">Loading your strip…</p>
      </div>
    );
  }

  // Guard: strip not found or fetch failed
  if (!strip) {
    const isExpired = errorType === "expired";
    return (
      <div className="min-h-screen bg-theme flex flex-col">
        <header className="sticky top-0 z-50 w-full px-8 pt-4 pb-2 md:px-6 md:pt-3 sm:px-4 sm:pt-2">
          <NavBar />
        </header>
        <main className="flex-1 flex flex-col items-center justify-center gap-6 px-8 text-center">
          {isExpired ? (
            /* Hourglass icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-black/25"
              style={{ width: "clamp(2.5rem, 8vw, 4rem)", height: "clamp(2.5rem, 8vw, 4rem)" }}
            >
              <path d="M5 22h14" />
              <path d="M5 2h14" />
              <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
              <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
            </svg>
          ) : (
            /* Search / not found icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-black/25"
              style={{ width: "clamp(2.5rem, 8vw, 4rem)", height: "clamp(2.5rem, 8vw, 4rem)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <path d="M8 11h6" />
            </svg>
          )}
          <div className="flex flex-col items-center gap-2">
            <h1
              className="font-main font-bold text-black tracking-tight"
              style={{ fontSize: "clamp(1rem, 4vw, 1.75rem)" }}
            >
              {isExpired ? "This strip has expired" : "Strip not found"}
            </h1>
            <p
              className="font-main italic text-black/45"
              style={{ fontSize: "clamp(0.8rem, 1.8vw, 0.95rem)" }}
            >
              {isExpired
                ? "Photo strips are only available for 2 hours after they're created."
                : "This link doesn't exist or may have already been removed."}
            </p>
          </div>
          <PrimaryButton onClick={() => navigate("/")}>
            ← Back to Home
          </PrimaryButton>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme flex flex-col">

      <header className="sticky top-0 z-50 w-full px-8 pt-4 pb-2 md:px-6 md:pt-3 sm:px-4 sm:pt-2">
        <div style={fade(0)}>
          <NavBar />
        </div>
        <div className="mt-3 pl-1" style={fade(80)}>
          <BackLink onClick={() => navigate(backPath)} label={backLabel} />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-8 py-6 md:px-6 sm:px-4 overflow-hidden">

        {strip.imageUrl ? (
          /* ── Strip left, actions right ──────────────────────── */
          <div
            className="flex flex-row items-center justify-center gap-10 md:gap-8 w-full max-w-3xl"
            style={fade(100)}
          >
            {/* Strip — height-constrained so it never pushes buttons off screen */}
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "8px 8px 0 8px",
                boxShadow: "0 12px 48px rgba(0,0,0,0.20), 0 2px 10px rgba(0,0,0,0.08)",
                borderRadius: "2px",
                flexShrink: 0,
                maxHeight: "80vh",
                width: "auto",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <img
                src={`http://localhost:3000${strip.imageUrl}`}
                alt="Your generated photo strip"
                style={{
                  display: "block",
                  maxHeight: "calc(80vh - 60px)",
                  width: "auto",
                  objectFit: "contain",
                }}
              />
              {/* Bottom label */}
             
            </div>

            {/* Action panel */}
            <div className="flex flex-col gap-5">

              <div className="flex flex-col gap-1">
                <h1
                  className="font-main font-bold text-black tracking-tight leading-none"
                  style={{ fontSize: "clamp(1.6rem, 3vw, 2.8rem)" }}
                >
                  Your Strip
                </h1>
                <p className="font-main italic text-black/45" style={{ fontSize: "clamp(0.8rem, 1.2vw, 0.95rem)" }}>
                  Looking good! Save or share it.
                </p>
              </div>

              <div className="w-10 h-px bg-primary/25" />

              <div className="flex flex-col gap-3">
                <PrimaryButton onClick={handleDownload}>
                  Download Strip ↓
                </PrimaryButton>
                <button
                  onClick={handleShare}
                  className="
                    font-main text-sm
                    bg-surface hover:bg-primary/10
                    text-black/60 hover:text-primary
                    px-8 py-3.5 rounded-full
                    border border-primary/15 hover:border-primary/40
                    transition-all duration-200 cursor-pointer select-none
                    focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30
                  "
                >
                  {copyFeedback ? "✓ Link copied!" : "Share →"}
                </button>
              </div>

              <button
                onClick={() => navigate(backPath)}
                className="font-main text-xs text-black/30 hover:text-primary transition-colors duration-200 cursor-pointer bg-transparent border-none p-0"
              >
                ← start over
              </button>

            </div>
          </div>
        ) : (
          /* ── No strip fallback ─────────────────────────────── */
          <div className="flex flex-col items-center gap-6" style={fade(100)}>
            <div
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/25 bg-surface/60"
              style={{ width: "clamp(140px, 18vw, 220px)", aspectRatio: "1/2.5" }}
            >
              <span className="text-primary/30 text-5xl">📸</span>
              <p className="font-main text-xs text-primary/35 mt-3">No strip yet</p>
            </div>
            <button
              onClick={() => navigate(backPath)}
              className="font-main text-sm text-black/35 hover:text-primary transition-colors duration-200 cursor-pointer bg-transparent border-none p-0"
            >
              ← start over
            </button>
          </div>
        )}

      </main>
    </div>
  );
}


