import Navbar from "@/components/landing-page/Navbar";
import initTranslations from "@/lib/i18n";
import TranslationsProvider from "@/providers/TranslationProvider";

const i18nNamespaces = ["common", "navbar"];

export default async function Layout({
  params,
  children,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = params.locale || "en";

  const { resources } = await initTranslations(locale, i18nNamespaces);

  return (
    <main className="w-full">
      <TranslationsProvider
        namespaces={i18nNamespaces}
        locale={locale}
        resources={resources}
      >
        <Navbar />
      </TranslationsProvider>
      {children}
    </main>
  );
}
