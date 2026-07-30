/**
 * HowToUse — Step-by-step guide for first-time users.
 *
 * Four steps matching the approved user flow:
 *  1. Choose a format
 *  2. Pick a source (camera or upload)
 *  3. Apply a filter
 *  4. Download or share
 */

const STEPS = [
  {
    number: "01",
    emoji: "🎞️",
    title: "Choose Your Format",
    description:
      "Pick how many photos go into your strip. Classic 4-shot, double exposure, or custom layouts — each shapes a different story.",
  },
  {
    number: "02",
    emoji: "📷",
    title: "Capture or Upload",
    description:
      "Use your webcam for a live shoot with countdown, or upload photos you already love. Either way, you're in control.",
  },
  {
    number: "03",
    emoji: "✨",
    title: "Apply a Filter",
    description:
      "Give your strip a mood — warm film, cool mono, faded vintage. One filter applied across all your shots for a cohesive look.",
  },
  {
    number: "04",
    emoji: "💾",
    title: "Download & Share",
    description:
      "Save your strip instantly or share it with a QR code. No account required. Your moment, yours to keep.",
  },
];

export default function HowToUse() {
  return (
    <section
      id="how-to-use"
      aria-labelledby="how-to-use-heading"
      className="w-full bg-surface py-24 px-8 md:px-6 sm:px-4"
    >
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
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
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="flex flex-col gap-4"
            >
              {/* Step number + emoji */}
              <div className="flex items-center gap-3">
                <span className="font-main text-primary text-4xl md:text-3xl leading-none select-none">
                  {step.number}
                </span>
                <span className="text-3xl" role="presentation">
                  {step.emoji}
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
          ))}
        </div>
      </div>
    </section>
  );
}
