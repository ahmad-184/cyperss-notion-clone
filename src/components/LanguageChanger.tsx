"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { i18nConfig } from "../../i18nConfig";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/DropdownMenu";
import { Button } from "./ui/Button";
import { getDirByLang } from "@/lib/dir";
import { Globe } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

type LanguageChangerProps = {
  btn_variant?: "outline" | "ghost";
  menu_align?: "center" | "end" | "start" | undefined;
};

export default function LanguageChanger({
  btn_variant = "outline",
  menu_align = "center",
}: LanguageChangerProps) {
  const { i18n, t } = useTranslation();
  const currentLocale = i18n.language;
  const router = useRouter();
  const currentPathname = usePathname();

  const handleChange = (e: string) => {
    const newLocale = e;

    // set cookie for next-i18n-router
    const days = 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = date.toUTCString();
    document.cookie = `NEXT_LOCALE=${newLocale};expires=${expires};path=/`;

    // redirect to the new locale path
    if (
      currentLocale === i18nConfig.defaultLocale &&
      !i18nConfig.prefixDefault
    ) {
      router.push("/" + newLocale + currentPathname);
    } else {
      router.push(
        currentPathname.replace(`/${currentLocale}`, `/${newLocale}`)
      );
    }

    router.refresh();
  };

  const langs = useMemo(
    () => [
      {
        locale: "en",
        lang: t("common:english"),
      },
      {
        locale: "fa",
        lang: t("common:farsi"),
      },
    ],
    []
  );

  const dir = getDirByLang(currentLocale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={btn_variant} size="icon">
          <Globe strokeWidth={"1.6px"} className="w-[1.2rem] h-[1.2rem]" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={menu_align}>
        {langs.map((l, i) => (
          <DropdownMenuItem
            key={i + new Date().getFullYear()}
            className={cn("capitalize my-1 rtl:justify-end ltr:justify-start", {
              "dark:bg-slate-500/30 bg-foreground/5":
                l.locale === currentLocale,
            })}
            onClick={() => handleChange(l.locale)}
          >
            {l.lang}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
