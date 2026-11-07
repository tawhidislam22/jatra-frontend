"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`w-9 h-9 rounded-lg bg-muted/30 ${className}`} />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative h-9 w-9 rounded-xl border border-border/60 bg-card/60 hover:bg-muted text-foreground transition-all duration-200 shadow-xs hover:border-primary/40 focus-visible:ring-1 focus-visible:ring-primary ${className}`}
          aria-label="Toggle theme"
          title={`Current theme: ${theme || 'system'}`}
        >
          {isDark ? (
            <Moon className="h-4 w-4 text-amber-400 transition-transform duration-300 rotate-0 scale-100" />
          ) : (
            <Sun className="h-4 w-4 text-amber-600 transition-transform duration-300 rotate-0 scale-100" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 bg-card border-border shadow-xl rounded-xl p-1">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            theme === "light" ? "bg-primary text-primary-foreground font-bold" : "hover:bg-muted text-foreground"
          }`}
        >
          <Sun className="h-3.5 w-3.5" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            theme === "dark" ? "bg-primary text-primary-foreground font-bold" : "hover:bg-muted text-foreground"
          }`}
        >
          <Moon className="h-3.5 w-3.5" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            theme === "system" ? "bg-primary text-primary-foreground font-bold" : "hover:bg-muted text-foreground"
          }`}
        >
          <Laptop className="h-3.5 w-3.5" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SimpleThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`w-9 h-9 rounded-lg bg-muted/30 ${className}`} />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`p-2 rounded-xl border border-border/60 bg-card hover:bg-muted text-foreground transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95 ${className}`}
      aria-label="Toggle theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400" />
      ) : (
        <Moon className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
      )}
    </button>
  );
}
