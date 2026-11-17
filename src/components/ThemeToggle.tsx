"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { DARK_THEME_VARIABLES } from "@/lib/theme";

type Theme = "light" | "dark";
const THEME_CHANGE_EVENT = "sgsacw-theme-change";

function subscribeToTheme(onChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onChange);
}

function getThemeSnapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getServerThemeSnapshot(): Theme {
  return "light";
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.dataset.theme = nextTheme;
    for (const [name, value] of Object.entries(DARK_THEME_VARIABLES)) {
      if (nextTheme === "dark") {
        root.style.setProperty(name, value);
      } else {
        root.style.removeProperty(name);
      }
    }
    window.localStorage.setItem("sgsacw-theme", nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };

  const label = theme === "dark" ? "Activar modo claro" : "Activar modo oscuro";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
        theme === "dark"
          ? "border-slate-700 bg-slate-800 text-blue-200 hover:bg-slate-700"
          : "border-blue-200 bg-white text-blue-700 hover:bg-blue-50"
      }`}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
