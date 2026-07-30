/**
 * AboutUs — Brand story and spirit of the Sandali photobooth.
 *
 * Layout: two-column on desktop (text left, decorative right),
 * single column on mobile.
 */

export default function AboutUs() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="w-full bg-theme py-24 px-8 md:px-6 sm:px-4"
    >
      <div className="max-w-5xl mx-auto grid grid-cols-2 gap-16 items-center md:grid-cols-1 md:gap-10">

        {/* ── Left: Text ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          <h2
            id="about-heading"
            className="font-main text-5xl md:text-4xl sm:text-3xl text-black leading-tight"
          >
            About Sandali
          </h2>

          <p className="font-main text-black/70 text-lg md:text-base leading-relaxed">
            <em>Sandali</em> is a Filipino word meaning{" "}
            <em>"a moment"</em> — that brief, fleeting second you want to hold onto forever.
          </p>

          <p className="font-main text-black/60 text-base leading-relaxed">
            We built Sandali as a love letter to the analog photobooth experience: the
            warm grain, the slightly-off framing, the strip you fold and hand to someone.
            No logins, no feeds, no algorithms — just you, a camera, and a memory worth printing.
          </p>

          <p className="font-main text-black/60 text-base leading-relaxed">
           Built inspired by love and built for capturing love at the moment.
          </p>

          {/* Decorative Filipino script label */}
          <p
            className="font-main italic text-primary/50 text-sm tracking-wider mt-2"
            aria-hidden="true"
          >
            ᜐᜈ᜔ᜇᜎᜒ &mdash; Story in each Frame
          </p>
        </div>

        {/* ── Right: Visual ──────────────────────────────────────── */}
        <div
          className="flex items-center justify-center md:justify-start"
          aria-hidden="true"
        >
          {/* Stacked decorative strips */}
          <div className="relative w-48 h-72 select-none">
            {/* Back strip */}
            <div
              className="absolute inset-0 bg-surface border-4 border-white rounded-xl shadow-lg"
              style={{ transform: "rotate(6deg) translateX(16px) translateY(-8px)", opacity: 0.6 }}
            />
            {/* Middle strip */}
            <div
              className="absolute inset-0 bg-surface border-4 border-white rounded-xl shadow-lg"
              style={{ transform: "rotate(-3deg) translateX(-8px) translateY(4px)", opacity: 0.8 }}
            />
            {/* Front strip — with content */}
            <div className="absolute inset-0 bg-white border-4 border-white rounded-xl shadow-xl overflow-hidden flex flex-col">
              {[
                { bg: "#E8D5C4" },
                { bg: "#D4C5B8" },
                { bg: "#C8B8A8" },
                { bg: "#BCA898" },
              ].map((cell, i, arr) => (
                <div
                  key={i}
                  className="flex-1 flex items-center justify-center text-2xl"
                  style={{
                    backgroundColor: cell.bg,
                    borderBottom: i < arr.length - 1 ? "3px solid white" : "none",
                  }}
                >
                  📸
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
