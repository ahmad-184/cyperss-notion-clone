"use client";

import Link from "next/link";
import { TFunction } from "i18next";
import { HTMLAttributes, useContext, useEffect, useState } from "react";
import { Context as LanguageContext } from "@/contexts/language-context";
import CypressLogo from "./CypressLogo";

type translateTypes = {
  cypress?: string;
};

const AppLogo = ({
  t,
  showLogoName = true,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  t?: TFunction;
  showLogoName?: boolean;
}) => {
  const [translation, setTranslation] = useState<translateTypes>({});
  const { lang } = useContext(LanguageContext);

  const getTranslation = async () => {
    const file = (await import(`@/locales/${lang}/common.json`)).default;
    setTranslation(JSON.parse(JSON.stringify(file)));
  };

  useEffect(() => {
    if (!t) getTranslation();
  }, [lang]);

  return (
    <div {...props}>
      <Link href="/" className="flex gap-2 items-center">
        <CypressLogo />
        {showLogoName ? (
          <p className="dark:text-slate-200 font-medium">
            {t ? t("common:cypress") : translation.cypress}.
          </p>
        ) : null}
      </Link>
    </div>
  );
};

export default AppLogo;
