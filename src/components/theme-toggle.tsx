"use client";

import { SunMoon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Alternar tema"
      title="Alternar tema"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <SunMoon className="size-4" />
    </Button>
  );
}
