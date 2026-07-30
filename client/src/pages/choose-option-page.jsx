import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/navbar";

/* ── OptionCard — with press + ripple animation ─────────────────── */
function OptionCard({ icon, label, onClick }) {
  const [pressed, setPressed] = useState(false);

  const handleClick = () => {
    setPressed(true);
    // Let the press animation play before navigating
    setTimeout(onClick, 350);
  };

  return (
    <button
      onPointerDown={() => setPressed(true)}
      onPointerUp={handleClick}
      onPointerLeave={() => setPressed(false)}
      aria-label={label}
      className="
        bg-primary text-white
        rounded-3xl
        flex flex-col items-center justify-center gap-3
        focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40
        cursor-pointer select-none overflow-hidden
      "
      style={{
        width:      "clamp(120px, 18vw, 200px)",
        height:     "clamp(120px, 18vw, 200px)",
        transform:  pressed ? "scale(0.91)" : "scale(1)",
        backgroundColor: pressed ? "var(--color-secondary)" : "var(--color-primary)",
        boxShadow:  pressed
          ? "0 2px 8px rgba(158,59,44,0.15)"
          : "0 8px 24px rgba(158,59,44,0.25)",
        transition: "transform 200ms cubic-bezier(0.34,1.56,0.64,1), background-color 200ms ease, box-shadow 200ms ease",
      }}
    >
      {icon}
      <span
        className="font-main text-white/80 tracking-wide"
        style={{ fontSize: "clamp(0.65rem, 1.2vw, 0.85rem)" }}
      >
        {label}
      </span>
    </button>
  );
}

/* ── SVG icons ──────────────────────────────────────────────────── */
const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "clamp(52px, 8vw, 88px)", height: "clamp(52px, 8vw, 88px)" }}
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <polyline points="3 15 8 10 13 15" />
    <polyline points="11 13 14 10 21 17" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <line x1="19" y1="3" x2="19" y2="7" />
    <line x1="17" y1="5" x2="21" y2="5" />
  </svg>
);

const CameraIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "clamp(52px, 8vw, 88px)", height: "clamp(52px, 8vw, 88px)" }}
    aria-hidden="true"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
    <line x1="19" y1="3" x2="19" y2="7" />
    <line x1="17" y1="5" x2="21" y2="5" />
  </svg>
);

/* ── Page ───────────────────────────────────────────────────────── */
export default function ChooseInputPage() {
  const navigate = useNavigate();
  const [entered, setEntered] = useState(false);

  // Page entrance — stagger heading, subtitle, buttons
  useEffect(() => {
    const t = requestAnimationFrame(() =>
      requestAnimationFrame(() => setEntered(true))
    );
    return () => cancelAnimationFrame(t);
  }, []);

  const fade = (delay) => ({
    opacity:    entered ? 1 : 0,
    transform:  entered ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 500ms ease ${delay}ms, transform 500ms cubic-bezier(0.33,1,0.68,1) ${delay}ms`,
  });

  return (
    <div className="min-h-screen bg-theme flex flex-col">

      <header className="sticky top-0 z-50 w-full px-8 pt-6 pb-2 md:px-6 md:pt-5 sm:px-4 sm:pt-4">
        <NavBar />
      </header>

      <main className="flex-1 flex items-center justify-center px-8 md:px-6 sm:px-4">
        <div className="flex flex-col items-center gap-8 text-center">

          {/* Heading */}
          <h1
            className="font-main font-bold text-black tracking-tight"
            style={{ fontSize: "clamp(3.5rem, 10vw, 8rem)", ...fade(0) }}
          >
            STEP 1
          </h1>

          {/* Subtitle */}
          <p
            className="font-main italic text-black/70"
            style={{ fontSize: "clamp(1rem, 2.5vw, 1.75rem)", ...fade(100) }}
          >
            Choose between Upload or Camera
          </p>

          {/* Option buttons */}
          <div className="flex gap-6 mt-2" style={fade(200)}>
            <OptionCard
              icon={<UploadIcon />}
              label="Upload photos"
              onClick={() => navigate("/upload")}
            />
            <OptionCard
              icon={<CameraIcon />}
              label="Use camera"
              onClick={() => navigate("/camera")}
            />
          </div>

        </div>
      </main>

    </div>
  );
}
