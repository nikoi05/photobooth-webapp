/**
 * NavBar — sticky top navigation.
 *
 * - Brand name navigates to "/" (landing page).
 * - "how to use" and "About Us" navigate to "/" then scroll to their section.
 *   If already on "/", they scroll directly without a page transition.
 */
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
  const navigate = useNavigate();
  const scrollTo = useScrollNav();

  return (
    <nav className="bg-surface rounded-full px-8 py-5 w-full md:px-6 md:py-4 sm:px-4 sm:py-3">
      <div className="flex justify-between items-center">

        {/* Brand — always goes to landing page */}
        <button
          onClick={() => navigate("/")}
          className="text-black font-main text-2xl md:text-xl sm:text-lg hover:text-primary transition-colors duration-200 cursor-pointer bg-transparent border-none p-0"
        >
          Sandali
        </button>

        <div className="text-black font-main flex gap-20 text-lg md:gap-10 md:text-base sm:gap-6 sm:text-sm">
          <button
            onClick={() => scrollTo("how-to-use")}
            className="hover:text-primary transition-colors duration-200 cursor-pointer bg-transparent border-none p-0"
          >
            how to use
          </button>
          <button
            onClick={() => scrollTo("about")}
            className="hover:text-primary transition-colors duration-200 cursor-pointer bg-transparent border-none p-0"
          >
            About Us
          </button>
        </div>

      </div>
    </nav>
  );
}
