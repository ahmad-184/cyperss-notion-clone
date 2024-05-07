"use client";

import { getDirByLang } from "@/lib/dir";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

type dirType = ToasterProps["dir"];

const Toaster = ({ lang, ...props }: ToasterProps & { lang: string }) => {
  const { theme = "dark" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      dir={getDirByLang(lang) as dirType}
      duration={5000}
      closeButton
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton: "dark:border-gray-400 dark:hover:bg-gray-800",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
