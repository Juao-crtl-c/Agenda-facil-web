"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();
`;

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function alternar() {
    const proximo = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", proximo);
    localStorage.setItem("theme", proximo ? "dark" : "light");
    setDark(proximo);
  }

  return (
    <button
      onClick={alternar}
      title={dark ? "Mudar para modo claro" : "Mudar para modo escuro"}
      aria-label={dark ? "Mudar para modo claro" : "Mudar para modo escuro"}
      className={`flex items-center justify-center rounded-sm p-2 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent-dark ${className}`}
    >
      {dark === null ? (
        <span className="block h-4 w-4" />
      ) : dark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
