import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/navbar";

/* ── Icons ──────────────────────────────────────────────────────── */
const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "2.2rem", height: "2.2rem" }}
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <polyline points="3 15 8 10 13 15" />
    <polyline points="11 13 14 10 21 17" />
    <circle cx="8.5" cy="8.5" r="1.5" />
  </svg>
);

const CameraIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "2.2rem", height: "2.2rem" }}
    aria-hidden="true"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

/* ── OptionCard ─────────────────────────────────────────────────── */
function OptionCard({ icon, label, description, onClick }) {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    setPressed(true);
    setTimeout(onClick, 250);
  };

  const active = pressed || hovered;

  return (
    <button
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => { setHovered(false); setPressed(false); }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={handleClick}
      aria-label={label}
      className="
        flex flex-col items-center gap-4
        px-10 py-8 rounded-2xl border-2
        focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40
        cursor-pointer select-none text-center
      "
      style={{
        width: "clamp(160px, 22vw, 240px)",
        backgroundColor: active ? "var(--color-primary)" : "var(--color-surface)",
        borderColor:     active ? "var(--color-primary)" : "transparent",
        color:           active ? "#ffffff" : "inherit",
        transform:       pressed ? "scale(0.96)" : hovered ? "scale(1.03)" : "scale(1)",
        boxShadow:       active
          ? "0 12px 32px rgba(158,59,44,0.28)"
          : "0 2px 8px rgba(0,0,0,0.06)",
        transition: "transform 200ms cubic-bezier(0.34,1.56,0.64,1), background-color 200ms ease, box-shadow 200ms ease, border-color 200ms ease, color 200ms ease",
      }}
    >
      {/* Icon */}
      <span style={{ opacity: active ? 1 : 0.65 }}>
        {icon}
      </span>

      {/* Label */}
      <span className="font-main font-semibold tracking-wide" style={{ fontSize: "clamp(1rem, 1.6vw, 1.2rem)" }}>
        {label}
      </span>

      {/* Description */}
      <span
        className="font-main italic leading-snug"
        style={{
          fontSize: "clamp(0.75rem, 1vw, 0.85rem)",
          color: active ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.4)",
          transition: "color 200ms ease",
        }}
      >
        {description}
      </span>
    </button>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function ChooseInputPage() {
  const navigate = useNavigate();
  const [entered, setEntered] = useState(false);

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
        <div className="flex flex-col items-center gap-10 text-center">

          {/* Step pill */}
          <span
            className="bg-surface font-main text-primary text-xs tracking-[0.2em] uppercase px-4 py-1.5 rounded-full"
            style={fade(0)}
          >
            Step 1 of 3
          </span>

          {/* Heading */}
          <div className="flex flex-col items-center gap-3" style={fade(80)}>
            <h1
              className="font-main font-bold text-black tracking-tight leading-none"
              style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
            >
              How would you like<br />to add your photos?
            </h1>
            <p
              className="font-main italic text-black/50"
              style={{ fontSize: "clamp(0.9rem, 1.8vw, 1.1rem)" }}
            >
              Pick a source to get started.
            </p>
          </div>

          {/* Cards */}
          <div className="flex gap-5 mt-2 flex-wrap justify-center" style={fade(180)}>
            <OptionCard
              icon={<CameraIcon />}
              label="Use Camera"
              description="Live shoot with countdown"
              onClick={() => navigate("/camera")}
            />
            <OptionCard
              icon={<UploadIcon />}
              label="Upload Photos"
              description="Pick from your device"
              onClick={() => navigate("/upload")}
            />
          </div>

        </div>
      </main>

    </div>
  );
}
