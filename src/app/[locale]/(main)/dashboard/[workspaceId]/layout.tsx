import Sidebar from "@/components/sidebar";
import initTranslations from "@/lib/i18n";
import TranslationsProvider from "@/providers/TranslationProvider";

const namespaces = ["common"];

export default async function Layout({
  params,
  children,
}: {
  children: React.ReactNode;
  params: { locale: string; workspaceId: string };
}) {
  const { resources } = await initTranslations(params.locale, namespaces);

  return (
    <div className="w-screen h-screen flex overflow-auto">
      <TranslationsProvider
        locale={params.locale}
        resources={resources}
        namespaces={namespaces}
      >
        <Sidebar workspaceId={params.workspaceId} />
        <div className="flex flex-grow ">{children}</div>
      </TranslationsProvider>
    </div>
  );
}
