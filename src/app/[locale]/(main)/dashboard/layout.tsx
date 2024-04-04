import initTranslations from "@/lib/i18n";
import ReduxStoreProvider from "@/providers/ReduxStoreProvider";
import TranslationProvider from "@/providers/TranslationProvider";
import { notFound } from "next/navigation";
import { validate } from "uuid";

const namespaces = ["common"];

export default async function Layout({
  params,
  children,
}: {
  children: React.ReactNode;
  params: { locale: string; workspaceId: string };
}) {
  const locale = params.locale || "en";
  const { resources } = await initTranslations(locale, namespaces);

  if (params.workspaceId) {
    const isIdValid = await validate(params.workspaceId);
    if (!isIdValid) return notFound();
  }

  return (
    <main>
      <TranslationProvider
        locale={locale}
        resources={resources}
        namespaces={namespaces}
      >
        <ReduxStoreProvider>{children}</ReduxStoreProvider>
      </TranslationProvider>
    </main>
  );
}
