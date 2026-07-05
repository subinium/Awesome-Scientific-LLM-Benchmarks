"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const OPTIONS: { value: Theme; label: string; glyph: string }[] = [
  { value: "light", label: "Light", glyph: "☀" },
  { value: "dark", label: "Dark", glyph: "☾" },
  { value: "system", label: "System", glyph: "◑" },
];

function resolve(t: Theme): "light" | "dark" {
  if (t === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return t;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as Theme) || "system";
    setTheme(saved);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if ((localStorage.getItem("theme") || "system") === "system") {
        document.documentElement.dataset.theme = resolve("system");
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function apply(t: Theme) {
    localStorage.setItem("theme", t);
    document.documentElement.dataset.theme = resolve(t);
    setTheme(t);
  }

  return (
    <div className="flex items-center rounded-full border border-border p-0.5">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => apply(o.value)}
          aria-label={o.label}
          title={o.label}
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs transition-colors ${
            theme === o.value
              ? "bg-surface-2 text-text"
              : "text-faint hover:text-text"
          }`}
        >
          {o.glyph}
        </button>
      ))}
    </div>
  );
}
