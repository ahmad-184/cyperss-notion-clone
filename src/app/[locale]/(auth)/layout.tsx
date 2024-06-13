import Link from "next/link";
import logo from "@/assets/cypresslogo.svg";
import Image from "next/image";
import initTranslations from "@/lib/i18n";
import TranslationsProvider from "@/providers/TranslationProvider";
import LanguageChanger from "@/components/LanguageChanger";
import ThemeToggle from "@/components/ThemeToggle";

const namespaces = ["common", "register", "validators", "error", "messages"];

export default async function Layout({
  params,
  children,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = params.locale || "en";

  const { t, resources } = await initTranslations(locale, namespaces);

  return (
    <div className="h-screen w-full justify-center flex items-center">
      <div className="w-full max-w-sm p-6 flex flex-col gap-2">
        <div className="flex flex-col gap-2 mb-3">
          <Link href={"/"} className="relative flex gap-3 items-center">
            <Image
              src={logo}
              width={50}
              height={50}
              className="w-9"
              alt="Cypress Logo"
            />
            <h1 className="text-3xl font-semibold dark:text-slate-200">
              {t("cypress")}.
            </h1>
          </Link>
          <p className="text-sm text-slate-400">{t("this_is_cypress")}</p>
        </div>
        <TranslationsProvider
          locale={locale}
          namespaces={namespaces}
          resources={resources}
        >
          {children}
        </TranslationsProvider>
        <div className="flex items-center gap-3 mt-3 justify-center">
          <ThemeToggle btn_variant="ghost" />
          <LanguageChanger btn_variant="ghost" />
        </div>
      </div>
    </div>
  );
}
