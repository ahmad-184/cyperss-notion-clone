import Navbar from "@/components/landing-page/Navbar";
import { getAuthSession } from "@/lib/authOptions";
import initTranslations from "@/lib/i18n";
import TranslationsProvider from "@/providers/TranslationProvider";
import { redirect } from "next/navigation";

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

  const session = await getAuthSession();
  if (session?.user.id) {
    redirect("/dashboard");
  }

  return (
    <main className="w-full">
      <TranslationsProvider
        namespaces={i18nNamespaces}
        locale={locale}
        resources={resources}
      >
        <Navbar user={session?.user} />
      </TranslationsProvider>
      {children}
    </main>
  );
}
