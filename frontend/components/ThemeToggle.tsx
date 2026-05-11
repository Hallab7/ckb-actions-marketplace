"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem("ckbind-theme");
    const nextDark = stored ? stored === "dark" : true;
    setDark(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
    document.documentElement.style.colorScheme = nextDark ? "dark" : "light";
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    window.localStorage.setItem("ckbind-theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className="secondary-button h-11 w-11 p-0"
    >
      {dark ? (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M12 3v2.2M12 18.8V21M4.22 4.22l1.56 1.56M18.22 18.22l1.56 1.56M3 12h2.2M18.8 12H21M4.22 19.78l1.56-1.56M18.22 5.78l1.56-1.56" strokeLinecap="round" />
          <circle cx="12" cy="12" r="4.2" />
        </svg>
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M20.2 14.7A8.4 8.4 0 0 1 9.3 3.8 8.6 8.6 0 1 0 20.2 14.7Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
