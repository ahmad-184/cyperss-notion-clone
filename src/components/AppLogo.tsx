"use client";

import Image from "next/image";
import Link from "next/link";
import { TFunction } from "i18next";
import Logo from "@/assets/cypresslogo.svg";
import { HTMLAttributes, useContext, useEffect, useState } from "react";
import { Context as LanguageContext } from "@/contexts/language-context";

type translateTypes = {
  cypress?: string;
};

const AppLogo = ({
  t,
  ...props
}: HTMLAttributes<HTMLDivElement> & { t?: TFunction }) => {
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
        <Image alt="Cypress logo" src={Logo} width={25} height={25} />
        <p className="dark:text-slate-200 font-medium">
          {t ? t("common:cypress") : translation.cypress}.
        </p>
      </Link>
    </div>
  );
};

export default AppLogo;
