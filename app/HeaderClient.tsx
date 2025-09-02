// app/HeaderClient.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Sun, Moon, Settings, Monitor } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Types for theme choices
 */
type ThemeChoice = "light" | "dark" | "system";

/**
 * HeaderClient — Responsive top navigation bar with brand, navigation links, and theme controls.
 */
export default function HeaderClient() {
  const pathname = usePathname();

  // --- State ---
  const [theme, setTheme] = useState<ThemeChoice>("system"); // Default: system
  const [open, setOpen] = useState(false); // Dropdown open/close
  const menuRef = useRef<HTMLDivElement>(null);

  // --- Initialize theme on mount ---
  useEffect(() => {
    try {
      const saved = (localStorage.getItem("theme") as ThemeChoice | null) || "system";
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const resolved = saved === "system" ? (prefersDark ? "dark" : "light") : saved;

      setTheme(saved);
      document.documentElement.classList.toggle("dark", resolved === "dark");
    } catch (err) {
      console.error("Theme initialization error:", err);
    }
  }, []);

  // --- Close dropdown on outside click or ESC ---
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  // --- Apply chosen theme ---
  const applyTheme = (t: ThemeChoice) => {
    setTheme(t);
    localStorage.setItem("theme", t);

    if (t === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    } else {
      document.documentElement.classList.toggle("dark", t === "dark");
    }

    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* --- Brand: Logo + Name --- */}
        <Link href="/" className="flex items-center gap-3">
          <span className="p-2 rounded-md border border-indigo-300 dark:border-violet-800/40 bg-indigo-100 dark:bg-violet-900/30">
            <Image
              src="/cashduezy_logo.png"
              alt="CashDuezy Logo"
              width={24}
              height={24}
              className="w-6 h-6 object-cover object-left"
              priority
            />
          </span>
          <span className="text-lg font-semibold">CashDuezy</span>
        </Link>

        {/* --- Navigation Links + Theme Dropdown --- */}
        <nav className="flex items-center gap-6 text-sm">
          {/* Main pages */}
          <Link
            href="/"
            className={`hover:underline ${pathname === "/" ? "font-semibold" : ""}`}
          >
            Home
          </Link>
          <Link
            href="/pricing"
            className={`hover:underline ${pathname === "/pricing" ? "font-semibold" : ""}`}
          >
            Pricing
          </Link>
          <Link
            href="/dashboard"
            className={`hover:underline ${
              pathname?.startsWith("/dashboard") ? "font-semibold" : ""
            }`}
          >
            Dashboard
          </Link>

          {/* Newly added informational pages */}
          <Link
            href="/faq"
            className={`hover:underline ${pathname === "/faq" ? "font-semibold" : ""}`}
          >
            FAQ
          </Link>
          <Link
            href="/changelog"
            className={`hover:underline ${pathname === "/changelog" ? "font-semibold" : ""}`}
          >
            Changelog
          </Link>
          <Link
            href="/support"
            className={`hover:underline ${pathname === "/support" ? "font-semibold" : ""}`}
          >
            Support
          </Link>

          {/* Theme settings dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Theme settings"
              className="p-2 rounded-md border bg-gray-100 text-gray-700 hover:bg-gray-200
                         dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <Settings className="w-4 h-4" />
            </button>

            {open && (
              <div
                className="absolute right-0 mt-2 w-44 rounded-md shadow-lg border bg-white dark:bg-gray-900
                           border-gray-200 dark:border-gray-800 overflow-hidden"
              >
                {/* --- System Default --- */}
                <button
                  onClick={() => applyTheme("system")}
                  className="w-full px-3 py-2 flex items-center justify-between text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" /> System Default
                  </span>
                  {theme === "system" && <span>✓</span>}
                </button>

                {/* --- Light --- */}
                <button
                  onClick={() => applyTheme("light")}
                  className="w-full px-3 py-2 flex items-center justify-between text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span className="flex items-center gap-2">
                    <Sun className="w-4 h-4" /> Light
                  </span>
                  {theme === "light" && <span>✓</span>}
                </button>

                {/* --- Dark --- */}
                <button
                  onClick={() => applyTheme("dark")}
                  className="w-full px-3 py-2 flex items-center justify-between text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span className="flex items-center gap-2">
                    <Moon className="w-4 h-4" /> Dark
                  </span>
                  {theme === "dark" && <span>✓</span>}
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}