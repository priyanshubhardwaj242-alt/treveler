"use client";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("waypoint-theme");
    const isDark = stored === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("waypoint-theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      aria-pressed={dark}
      className="w-11 rounded-full border border-mist dark:border-[#28403F] bg-white dark:bg-[#16282B] relative"
      style={{ height: 26 }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-coral transition-transform"
        style={{ transform: dark ? "translateX(18px)" : "translateX(0)" }}
      />
    </button>
  );
}
