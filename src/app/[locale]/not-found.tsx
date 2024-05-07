"use client";

import { Button, buttonVariants } from "@/components/ui/Button";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { getDirByLang } from "@/lib/dir";
import AppLogo from "@/components/AppLogo";
import { cn } from "@/lib/utils";
import { useContext, useEffect, useState } from "react";
import { Context as LanguageContext } from "@/contexts/language-context";

type translateTypes = {
  message?: string;
  btn_home?: string;
  btn_back?: string;
};

export default function NotFound() {
  const router = useRouter();
  const { locale = "en" } = useParams();

  const [translation, setTranslation] = useState<translateTypes>({});
  const { lang } = useContext(LanguageContext);

  const getTranslation = async () => {
    const file = (await import(`@/locales/${lang}/not-found.json`)).default;
    setTranslation(JSON.parse(JSON.stringify(file)));
  };

  useEffect(() => {
    getTranslation();
  }, [lang]);

  return (
    <div className="w-full h-screen flex items-center justify-center relative bg-gradient-to-bl from-background to-purple-500/15">
      <AppLogo
        className={cn("fixed top-4 md:top-6", {
          "left-4 md:left-12": getDirByLang(locale as string) === "ltr",
          "right-4 md:right-12": getDirByLang(locale as string) === "rtl",
        })}
      />
      <div className="flex flex-col gap-3 text-center">
        <h1 className="text-8xl sm:text-9xl font-bold text-slate-700 dark:text-slate-300">
          404
        </h1>
        <p className="font-normal ">{translation.message}</p>
        <div className="flex gap-2 justify-center">
          <Button
            variant="link"
            onClick={() => router.back()}
            className="text-slate-800 dark:text-slate-300"
          >
            {translation.btn_back}
          </Button>
          <Link
            href={"/"}
            className={buttonVariants({
              variant: "secondary",
              className: "bg-slate-200 dark:bg-slate-700",
            })}
          >
            {translation.btn_home}
          </Link>
        </div>
      </div>
    </div>
  );
}
