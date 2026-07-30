/**
 * StepFlow — shared primitives for any multi-step flow (upload, camera, etc.)
 *
 * Exports:
 *   StepPanel      Animated fade+slide wrapper. One visible at a time.
 *   StepHeader     Step pill + heading + optional hint line.
 *   BackLink       Subtle ← back navigation link.
 *   PrimaryButton  Main themed CTA button.
 *   useStepFlow    Hook that manages currentStep / displayStep with sequenced transitions.
 */
import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────────────────────────
   useStepFlow
   Manages the two-state step system so exit finishes before enter.

   Usage:
     const { currentStep, displayStep, goToStep } = useStepFlow(1);
───────────────────────────────────────────────────────────────── */
export function useStepFlow(initialStep = 1) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [displayStep, setDisplayStep] = useState(initialStep);

  const goToStep = (step) => {
    setCurrentStep(step);
    // Mount the incoming panel only after the outgoing one has exited (420ms + buffer)
    const t = setTimeout(() => setDisplayStep(step), 440);
    return () => clearTimeout(t);
  };

  return { currentStep, displayStep, goToStep };
}

/* ─────────────────────────────────────────────────────────────────
   StepPanel
   Fades + slides in when visible. Fades out then unmounts when hidden.
   Pass `visible={displayStep === N && currentStep === N}`.
───────────────────────────────────────────────────────────────── */
export function StepPanel({ visible, children }) {
  const [mounted, setMounted] = useState(visible);
  const [shown,   setShown]   = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      // Double-rAF ensures the browser paints the hidden state before animating in
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setShown(true))
      );
      return () => cancelAnimationFrame(raf);
    } else {
      setShown(false);
      const t = setTimeout(() => setMounted(false), 420);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <div
      className="w-full flex flex-col items-center gap-5"
      style={{
        opacity:    shown ? 1 : 0,
        transform:  shown ? "translateY(0px)" : "translateY(20px)",
        transition: "opacity 420ms cubic-bezier(0.4,0,0.2,1), transform 420ms cubic-bezier(0.4,0,0.2,1)",
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   StepHeader
   Props:
     step       {number}  Current step number
     total      {number}  Total steps (default 3)
     label      {string}  Large heading text
     hint       {string}  Optional italic hint below heading
───────────────────────────────────────────────────────────────── */
export function StepHeader({ step, total = 3, label, hint }) {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <span className="bg-surface font-main text-primary text-xs tracking-[0.2em] uppercase px-4 py-1.5 rounded-full">
        Step {step} of {total}
      </span>
      <h1
        className="font-main font-bold text-black leading-none tracking-tight"
        style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}
      >
        {label}
      </h1>
      {hint && (
        <p
          className="font-main italic text-black/50"
          style={{ fontSize: "clamp(0.85rem, 1.8vw, 1rem)" }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   BackLink
   Props:
     onClick  {() => void}
     label    {string}      Text after the ←
───────────────────────────────────────────────────────────────── */
export function BackLink({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="font-main text-sm text-black/35 hover:text-primary transition-colors duration-200 cursor-pointer bg-transparent border-none p-0 mt-2"
    >
      ← {label}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────
   PrimaryButton
   Props:
     onClick   {() => void}
     children  {ReactNode}
     disabled  {boolean}
───────────────────────────────────────────────────────────────── */
export function PrimaryButton({ onClick, children, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="
        bg-primary hover:bg-secondary text-white
        font-main text-lg px-12 py-3.5 rounded-full
        shadow-md hover:shadow-lg
        transition-all duration-300 cursor-pointer select-none
        focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
      "
    >
      {children}
    </button>
  );
}
