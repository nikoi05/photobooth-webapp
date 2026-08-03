/**
 * AboutUs — Brand story and spirit of the Sandali photobooth.
 */
import { useScrollReveal } from "../../../hooks/useScrollReveal";

export default function AboutUs() {
  const [headingRef, headingVisible] = useScrollReveal();
  const [p1Ref, p1Visible] = useScrollReveal();
  const [p2Ref, p2Visible] = useScrollReveal();
  const [p3Ref, p3Visible] = useScrollReveal();
  const [labelRef, labelVisible] = useScrollReveal();

  const reveal = (visible, delay = 0) => ({
    opacity:    visible ? 1 : 0,
    transform:  visible ? "translateY(0)" : "translateY(28px)",
    transition: `opacity 600ms ease ${delay}ms, transform 600ms cubic-bezier(0.33,1,0.68,1) ${delay}ms`,
  });

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="w-full bg-theme py-24 px-8 md:px-6 sm:px-4"
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-6 md:gap-10">

        {/* ── Text ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          <h2
            id="about-heading"
            ref={headingRef}
            className="font-main text-5xl md:text-4xl sm:text-3xl text-black leading-tight"
            style={reveal(headingVisible)}
          >
            About Sandali
          </h2>

          <p ref={p1Ref} className="font-main text-black/70 text-lg md:text-base leading-relaxed" style={reveal(p1Visible, 100)}>
            <em>Sandali</em> is a Filipino word meaning{" "}
            <em>"a moment"</em> — that brief, fleeting second you want to hold onto forever.
          </p>

          <p ref={p2Ref} className="font-main text-black/60 text-base leading-relaxed" style={reveal(p2Visible, 200)}>
            We built Sandali as a love letter to the analog photobooth experience: the
            warm grain, the slightly-off framing, the strip you fold and hand to someone.
            No logins, no feeds, no algorithms — just you, a camera, and a memory worth printing.
          </p>

          <p ref={p3Ref} className="font-main text-black/60 text-base leading-relaxed" style={reveal(p3Visible, 300)}>
            Built inspired by love and built for capturing love at the moment.
          </p>

          {/* Decorative Filipino script label */}
          <p
            ref={labelRef}
            className="font-main italic text-primary/50 text-sm tracking-wider mt-2"
            aria-hidden="true"
            style={reveal(labelVisible, 400)}
          >
            ᜐᜈ᜔ᜇᜎᜒ &mdash; Story in each Frame
          </p>
        </div>

      </div>
    </section>
  );
}
