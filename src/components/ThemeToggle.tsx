"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "./icons";
import { cn } from "@/lib/utils";

// Reads whether the component has hydrated on the client without ever
// setting state inside an effect (the recommended useSyncExternalStore
// pattern for a value that must be false during SSR/first paint and true
// after) — avoids the light/dark icon flashing or mismatching on load.
const subscribeNever = () => () => {};
function useHasMounted() {
  return useSyncExternalStore(subscribeNever, () => true, () => false);
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHasMounted();

  const isDark = mounted && resolvedTheme === "dark";
  const cell = compact ? "w-6 h-5" : "w-[38px] h-8";
  const icon = compact ? 11 : 16;

  return (
    <div className="flex items-center bg-bg rounded-md p-[3px]" role="group" aria-label="Theme">
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-pressed={!isDark}
        className={cn(
          "flex items-center justify-center rounded",
          cell,
          !isDark ? "bg-panel shadow-sm text-warn" : "text-fg-faint"
        )}
      >
        <SunIcon width={icon} height={icon} />
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-pressed={isDark}
        className={cn(
          "flex items-center justify-center rounded",
          cell,
          isDark ? "bg-panel-border text-accent" : "text-fg-faint"
        )}
      >
        <MoonIcon width={icon} height={icon} />
      </button>
    </div>
  );
}
