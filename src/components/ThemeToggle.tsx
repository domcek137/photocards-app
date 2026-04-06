"use client";

const STORAGE_KEY = "photocards-theme";

const setTheme = (theme: "light" | "dark") => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem(STORAGE_KEY, theme);
};

export default function ThemeToggle() {
  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-lg border border-slate-400/50 bg-white/90 px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-900"
      aria-label="Toggle color theme"
    >
      Toggle theme
    </button>
  );
}
