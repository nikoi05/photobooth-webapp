/**
 * Footer — site-wide footer with branding, nav links, and credits.
 */

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-primary py-12 px-8 md:px-6 sm:px-4">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">

        {/* ── Top row: brand + nav ──────────────────────────────── */}
        <div className="flex justify-between items-start sm:flex-col sm:gap-6">

          {/* Brand */}
          <div className="flex flex-col gap-1">
            <span className="font-main text-white text-3xl md:text-2xl leading-none">
              Sandali
            </span>
            <span
              className="font-main italic text-white/50 text-sm"
              aria-hidden="true"
            >
              ᜐᜈ᜔ᜇᜎᜒ
            </span>
            <span className="font-main italic text-white/60 text-sm mt-1">
              Story in each Frame
            </span>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-col gap-2 text-right sm:text-left list-none m-0 p-0">
              {[
                { label: "how to use", target: "how-to-use" },
                { label: "About Us", target: "about" },
              ].map(({ label, target }) => (
                <li key={target}>
                  <button
                    onClick={() => scrollTo(target)}
                    className="font-main text-white/70 text-sm hover:text-white transition-colors duration-200 cursor-pointer bg-transparent border-none p-0"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* ── Divider ───────────────────────────────────────────── */}
        <div className="w-full h-px bg-white/20" />

        {/* ── Bottom row: copyright ─────────────────────────────── */}
        <div className="flex justify-between items-center sm:flex-col sm:gap-2 sm:text-center">
          <p className="font-main text-white/50 text-xs">
            &copy; {year} Sandali. Built by Niko for Emilia
          </p>
          <p className="font-main text-white/40 text-xs">
            No data stored. No account needed.
          </p>
        </div>

      </div>
    </footer>
  );
}
