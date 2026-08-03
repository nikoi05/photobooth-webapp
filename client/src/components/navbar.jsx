/**
 * NavBar — sticky top navigation.
 *
 * - Brand name navigates to "/" (landing page).
 * - "how to use" and "About Us" navigate to "/" then scroll to their section.
 *   If already on "/", they scroll directly without a page transition.
 * - On mobile (<640px): links collapse into a hamburger menu.
 */
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function useScrollNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (sectionId) => {
    if (location.pathname === "/") {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/#${sectionId}`);
    }
  };
}

export default function NavBar() {
  const navigate  = useNavigate();
  const scrollTo  = useScrollNav();
  const [open, setOpen] = useState(false);

  const handleNav = (fn) => {
    setOpen(false);
    fn();
  };

  return (
    <nav className="bg-surface rounded-full px-6 py-4 w-full relative">
      <div className="flex justify-between items-center">

        {/* Brand */}
        <button
          onClick={() => navigate("/")}
          className="text-black font-main text-2xl md:text-xl hover:text-primary transition-colors duration-200 cursor-pointer bg-transparent border-none p-0"
        >
          Sandali
        </button>

        {/* Desktop links — hidden below sm */}
        <div className="hidden sm:flex text-black font-main gap-10 text-base md:gap-8">
          <button
            onClick={() => handleNav(() => scrollTo("how-to-use"))}
            className="hover:text-primary transition-colors duration-200 cursor-pointer bg-transparent border-none p-0"
          >
            how to use
          </button>
          <button
            onClick={() => handleNav(() => scrollTo("about"))}
            className="hover:text-primary transition-colors duration-200 cursor-pointer bg-transparent border-none p-0"
          >
            About Us
          </button>
        </div>

        {/* Hamburger — shown below sm */}
        <button
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="sm:hidden flex flex-col justify-center items-center gap-1.5 w-8 h-8 cursor-pointer bg-transparent border-none p-0"
        >
          <span
            className="block w-5 h-0.5 bg-black transition-all duration-300 origin-center"
            style={{
              transform: open ? "translateY(8px) rotate(45deg)" : "none",
            }}
          />
          <span
            className="block w-5 h-0.5 bg-black transition-all duration-300"
            style={{ opacity: open ? 0 : 1 }}
          />
          <span
            className="block w-5 h-0.5 bg-black transition-all duration-300 origin-center"
            style={{
              transform: open ? "translateY(-8px) rotate(-45deg)" : "none",
            }}
          />
        </button>

      </div>

      {/* Mobile dropdown — slides down below the pill */}
      {open && (
        <div className="sm:hidden absolute left-0 right-0 top-full mt-2 bg-surface rounded-3xl shadow-lg px-6 py-4 flex flex-col gap-4 z-50">
          <button
            onClick={() => handleNav(() => scrollTo("how-to-use"))}
            className="font-main text-black text-base hover:text-primary transition-colors duration-200 cursor-pointer bg-transparent border-none p-0 text-left"
          >
            how to use
          </button>
          <button
            onClick={() => handleNav(() => scrollTo("about"))}
            className="font-main text-black text-base hover:text-primary transition-colors duration-200 cursor-pointer bg-transparent border-none p-0 text-left"
          >
            About Us
          </button>
        </div>
      )}
    </nav>
  );
}
