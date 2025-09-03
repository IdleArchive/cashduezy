// app/HeaderClient.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Sun, Moon, Settings, Monitor } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";

type ThemeChoice = "light" | "dark" | "system";

interface NavItem {
  label: string;
  href: string;
}

interface HeaderClientProps {
  onLoginClick?: () => void; // 🔑 new prop
}

export default function HeaderClient({ onLoginClick }: HeaderClientProps) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<ThemeChoice>("system");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // theme init
  useEffect(() => {
    try {
      const saved = (localStorage.getItem("theme") as ThemeChoice | null) || "system";
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const resolved = saved === "system" ? (prefersDark ? "dark" : "light") : saved;
      setTheme(saved);
      document.documentElement.classList.toggle("dark", resolved === "dark");
    } catch {}
  }, []);

  // close dropdown on outside/ESC
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

  const navItems: NavItem[] = [
    { label: "Home", href: "/" },
    { label: "Pricing", href: "/pricing" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "FAQ", href: "/faq" },
    { label: "Changelog", href: "/changelog" },
    { label: "Support", href: "/support" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <span className="p-2 rounded-md border border-indigo-300 dark:border-violet-800/40 bg-indigo-100 dark:bg-violet-900/30">
            <Image src="/cashduezy_logo.png" alt="CashDuezy Logo" width={24} height={24} priority />
          </span>
          <span className="text-lg font-semibold">CashDuezy</span>
        </Link>

        {/* Nav + Theme */}
        <nav className="flex items-center gap-6 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={clsx("hover:underline", pathname === item.href && "font-semibold text-violet-500")}
            >
              {item.label}
            </Link>
          ))}

          {/* 🔑 Replace login link with button that triggers modal */}
          {onLoginClick && (
            <button
              onClick={onLoginClick}
              className="px-3 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white font-medium"
            >
              Log In
            </button>
          )}

          {/* Theme dropdown */}
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
              <div className="absolute right-0 mt-2 w-44 rounded-md shadow-lg border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 overflow-hidden">
                <button onClick={() => applyTheme("system")} className="w-full px-3 py-2 flex items-center justify-between text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
                  <span className="flex items-center gap-2"><Monitor className="w-4 h-4" /> System Default</span>
                  {theme === "system" && <span>✓</span>}
                </button>
                <button onClick={() => applyTheme("light")} className="w-full px-3 py-2 flex items-center justify-between text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
                  <span className="flex items-center gap-2"><Sun className="w-4 h-4" /> Light</span>
                  {theme === "light" && <span>✓</span>}
                </button>
                <button onClick={() => applyTheme("dark")} className="w-full px-3 py-2 flex items-center justify-between text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
                  <span className="flex items-center gap-2"><Moon className="w-4 h-4" /> Dark</span>
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
