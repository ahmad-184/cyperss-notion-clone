"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

type ModeToggleProps = {
  btn_variant?: "outline" | "ghost";
  menu_align?: "center" | "end" | "start" | undefined;
};

export default function ModeToggle({
  btn_variant = "outline",
  menu_align = "center",
}: ModeToggleProps) {
  const { setTheme, theme: currentTheme } = useTheme();
  const { i18n, t } = useTranslation();

  const themes = useMemo(
    () => [
      {
        key: "light",
        theme: t("common:light"),
      },
      {
        key: "dark",
        theme: t("common:dark"),
      },
      {
        key: "system",
        theme: t("common:system"),
      },
    ],
    []
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={btn_variant} size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={menu_align}>
        {themes.map((t, i) => (
          <DropdownMenuItem
            key={
              t.key +
              i +
              new Date().getFullYear() +
              Math.floor(Math.random() * 100000000)
            }
            className={cn("capitalize my-1 rtl:justify-end ltr:justify-start", {
              "dark:bg-slate-500/30 bg-foreground/5": t.key === currentTheme,
            })}
            onClick={() => setTheme(t.key)}
          >
            {t.theme}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
