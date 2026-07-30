import { useEffect, useState } from "react";

export default function Hero() {
  const [isBaybayin, setIsBaybayin] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setIsBaybayin((prev) => !prev);
        setFade(false);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center gap-4">
      <h1
        className={`
          text-[10rem] md:text-6xl sm:text-5xl
          font-bold leading-none tracking-tight text-black
          font-main
          transition-all duration-500 ease-in-out
          ${fade
            ? "opacity-0 scale-95 blur-sm"
            : "opacity-100 scale-100 blur-none"
          }
          hover:text-primary
        `}
      >
        {isBaybayin ? "ᜐᜈ᜔ᜇᜎᜒ" : "Sandali"}
      </h1>

      <p className=" mt-9 text-xl md:text-lg sm:text-base font-main font-light italic text-black">
        Story in each Frame
      </p>

      <button className="mt-6 bg-primary text-white font-main italic text-2xl md:text-xl sm:text-lg px-16 py-4 rounded-full hover:bg-secondary transition-colors duration-300 cursor-pointer">
        Start
      </button>
    </div>
  );
}
