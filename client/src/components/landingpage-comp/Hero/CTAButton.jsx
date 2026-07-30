/**
 * CTAButton — "Start" call-to-action button.
 * Readable sans-serif per spec.
 * Focus ring for accessibility.
 */
export default function CTAButton({ onClick }) {
  return (  
    <button
      onClick={onClick}
      className="
        mt-6
        bg-primary text-white
        text-xl font-semibold tracking-wide
        px-14 py-4
        rounded-full
        transition-colors duration-300
        hover:bg-secondary
        focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40
        active:scale-95
        cursor-pointer
        select-none
      "
      style={{
        fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",
        transition:
          "background-color 300ms ease, transform 150ms ease, box-shadow 300ms ease",
        boxShadow: "0 4px 14px rgba(158, 59, 44, 0.25)",
      }}
    >
      Start
    </button>
  );
}
