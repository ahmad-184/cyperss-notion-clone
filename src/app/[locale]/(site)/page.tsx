import Image from "next/image";

import TitleSection from "@/components/landing-page/TitleSection";
import { Button } from "@/components/ui/Button";

import Banner from "@/assets/appBanner.png";
import CalBanner from "@/assets/cal.png";

import PlansCards from "@/components/landing-page/PlansCards";
import TestimonialsSlides from "@/components/landing-page/TestimonialsSlides";
import ClientsSlides from "@/components/landing-page/ClientsSlides";
import initTranslations from "@/lib/i18n";
import { i18nConfig } from "../../../../i18nConfig";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }));
}

export default async function pages({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const { t } = await initTranslations(locale || "en", [
    "landing-page",
    "trusted-by",
    "plan-free",
    "plan-pro",
    "common",
  ]);

  return (
    <section className="py-6 pb-11">
      <div className="mt-10 px-4 sm:px-6 sm:flex sm:flex-col gap-4 md:justify-center md:items-center">
        <TitleSection title={t("head-title")} pill={t("head-pill")} />
        <div className="z-20 p-[2px] bg-white rounded-[14px] bg-gradient-to-r from-purple-500 to-blue-500 mt-5">
          <Button
            variant="default"
            className="w-full bg-white hover:bg-white hover:shadow-lg duration-150 transition-all hover:-translate-y-1 rounded-xl text-black dark:text-white dark:bg-black"
          >
            {t("head-btn")}
          </Button>
        </div>
        <div
          className={cn(
            "md:mt-[-90px] sm:w-full overflow-hidden w-[750px] z-[-1] flex justify-center items-center mt-[-60px] relative sm:ml-0 ml-[-55px]"
          )}
        >
          <Image src={Banner} alt="Application Banner" className="z-[-1]" />
          <div className="absolute top-[50%] bottom-0 z-10 bg-gradient-to-t dark:from-background w-full left-0 right-0" />
        </div>
      </div>
      <ClientsSlides lang={locale} />
      <div className="my-4 px-4 sm:px-6 flex justify-center relative items-center flex-col">
        <div className="w-[30%] blur-[120px] rounded-full h-32 absolute bg-purple-600 -z-10 top-22" />
        <TitleSection
          title={t("feature-title")}
          pill={t("feature-pill")}
          subheading={t("feature-subheading")}
        />
        <div className="mt-10 max-w-[450px] flex justify-center items-center relative sm:ml-0 rounded-3xl border-8 border-zinc-300 border-opacity-10">
          <Image src={CalBanner} alt="Banner" className="rounded-2xl" />
        </div>
      </div>
      <div className="relative mt-20">
        <div className="w-full blur-[120px] rounded-full h-32 absolute bg-purple-600 -z-10 top-56" />
        <div className="flex flex-col overflow-x-hidden overflow-visible">
          <div className="px-4 sm:px-6">
            <TitleSection
              title={t("trustby-title")}
              pill={t("trustby-pill")}
              subheading={t("trustby-subheading")}
            />
          </div>
          <TestimonialsSlides t={t} lang={locale} />
        </div>
      </div>
      <div className="mt-20 px-4 sm:px-6">
        <TitleSection
          title={t("plans-title")}
          pill={t("plans-pill")}
          subheading={t("plans-subheading")}
        />
        <PlansCards t={t} lang={locale} />
      </div>
    </section>
  );
}
