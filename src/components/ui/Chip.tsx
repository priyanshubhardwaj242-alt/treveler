"use client";

// Accessible toggle chip — real <button role="switch">, keyboard operable,
// screen-reader announces state. Replaces the old <div onClick> chips.
export function Chip({
  selected, onClick, children, className = ""
}: { selected: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={selected}
      onClick={onClick}
      className={`chip focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral ${
        selected ? "selected" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}
