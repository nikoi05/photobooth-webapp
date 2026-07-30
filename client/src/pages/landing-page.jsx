import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import NavBar from "../components/navbar";
import Hero from "../components/landingpage-comp/Hero/Hero";
import HowToUse from "../components/landingpage-comp/Hero/HowToUse";
import AboutUs from "../components/landingpage-comp/Hero/AboutUs";
import Footer from "../components/footer";

export default function LandingPage() {
  const { hash } = useLocation();

  // Scroll to section when navigating here with a hash (e.g. /#how-to-use)
  useEffect(() => {
    if (!hash) return;
    const id = hash.replace("#", "");
    // Small delay lets the page render before scrolling
    const t = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <div className="min-h-screen bg-theme flex flex-col">

      {/* ── Sticky navigation ────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full px-8 pt-6 pb-2 md:px-6 md:pt-5 sm:px-4 sm:pt-4">
        <NavBar />
      </header>

      {/* ── Hero — full-viewport section ─────────────────────────── */}
      <main>
        <Hero />

        {/* ── How to use ───────────────────────────────────────────── */}
        <HowToUse />

        {/* ── About Us ─────────────────────────────────────────────── */}
        <AboutUs />
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <Footer />

    </div>
  );
}
