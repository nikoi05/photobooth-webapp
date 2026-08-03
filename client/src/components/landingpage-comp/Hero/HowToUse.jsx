/**
 * HowToUse — Step-by-step guide for first-time users.
 *
 * Four steps matching the approved user flow:
 *  1. Choose a format
 *  2. Pick a source (camera or upload)
 *  3. Apply a filter
 *  4. Download or share
 */

import { useScrollReveal } from "../../../hooks/useScrollReveal";

const FilmIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "1.75rem", height: "1.75rem" }}
    aria-hidden="true"
  >
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
    <line x1="7" y1="2" x2="7" y2="22" />
    <line x1="17" y1="2" x2="17" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="2" y1="7" x2="7" y2="7" />
    <line x1="2" y1="17" x2="7" y2="17" />
    <line x1="17" y1="17" x2="22" y2="17" />
    <line x1="17" y1="7" x2="22" y2="7" />
  </svg>
);

const CameraIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "1.75rem", height: "1.75rem" }}
    aria-hidden="true"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const FilterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "1.75rem", height: "1.75rem" }}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="14.31" y1="8" x2="20.05" y2="17.94" />
    <line x1="9.69" y1="8" x2="21.17" y2="8" />
    <line x1="7.38" y1="12" x2="13.12" y2="2.06" />
    <line x1="9.69" y1="16" x2="3.95" y2="6.06" />
    <line x1="14.31" y1="16" x2="2.83" y2="16" />
    <line x1="16.62" y1="12" x2="10.88" y2="21.94" />
  </svg>
);

const DownloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "1.75rem", height: "1.75rem" }}
    aria-hidden="true"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const STEPS = [
  {
    number: "01",
    icon: <FilmIcon />,
    title: "Choose Your Format",
    description:
      "Pick how many photos go into your strip. Classic 4-shot, double exposure, or custom layouts — each shapes a different story.",
  },
  {
    number: "02",
    icon: <CameraIcon />,
    title: "Capture or Upload",
    description:
      "Use your webcam for a live shoot with countdown, or upload photos you already love. Either way, you're in control.",
  },
  {
    number: "03",
    icon: <FilterIcon />,
    title: "Apply a Filter",
    description:
      "Give your strip a mood — warm film, cool mono, faded vintage. One filter applied across all your shots for a cohesive look.",
  },
  {
    number: "04",
    icon: <DownloadIcon />,
    title: "Download & Share",
    description:
      "Save your strip instantly or share it with a link. No account required. Your moment, yours to keep.",
  },
];

export default function HowToUse() {
  const [headingRef, headingVisible] = useScrollReveal();

  // Each step needs its own top-level hook call — cannot call hooks inside .map()
  const [step0Ref, step0Visible] = useScrollReveal({ threshold: 0.12 });
  const [step1Ref, step1Visible] = useScrollReveal({ threshold: 0.12 });
  const [step2Ref, step2Visible] = useScrollReveal({ threshold: 0.12 });
  const [step3Ref, step3Visible] = useScrollReveal({ threshold: 0.12 });

  const stepRefs = [
    [step0Ref, step0Visible],
    [step1Ref, step1Visible],
    [step2Ref, step2Visible],
    [step3Ref, step3Visible],
  ];

  const reveal = (visible, delay = 0) => ({
    opacity:   visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(32px)",
    transition: `opacity 600ms ease ${delay}ms, transform 600ms cubic-bezier(0.33,1,0.68,1) ${delay}ms`,
  });

  return (
    <section
      id="how-to-use"
      aria-labelledby="how-to-use-heading"
      className="w-full bg-surface py-24 px-8 md:px-6 sm:px-4"
    >
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16" ref={headingRef} style={reveal(headingVisible)}>
          <h2
            id="how-to-use-heading"
            className="font-main text-5xl md:text-4xl sm:text-3xl text-black leading-tight"
          >
            How It Works
          </h2>
          <p className="mt-4 font-main italic text-black/60 text-lg md:text-base sm:text-sm">
            Four steps to a strip worth keeping.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-4 gap-8 md:grid-cols-2 sm:grid-cols-1">
          {STEPS.map((step, i) => {
            const [ref, visible] = stepRefs[i];
            return (
              <div
                key={step.number}
                ref={ref}
                className="flex flex-col gap-4"
                style={reveal(visible, i * 100)}
              >
                {/* Step number + icon */}
                <div className="flex items-center gap-3">
                  <span className="font-main text-primary text-4xl md:text-3xl leading-none select-none">
                    {step.number}
                  </span>
                  <span className="text-primary/70">
                    {step.icon}
                  </span>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-primary/20" />

                {/* Content */}
                <h3 className="font-main text-xl md:text-lg text-black">
                  {step.title}
                </h3>
                <p className="font-main text-sm text-black/60 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
