import BackgroundOverlay from "@/components/BackgroundOverlay";
import Sidebar from "@/components/sidebar";
import initTranslations from "@/lib/i18n";
import { validatUser } from "@/lib/validateUser";
import TranslationsProvider from "@/providers/TranslationProvider";
import { redirect } from "next/navigation";

const namespaces = ["common"];

export default async function Layout({
  params,
  children,
}: {
  children: React.ReactNode;
  params: { locale: string; workspaceId: string };
}) {
  const { resources } = await initTranslations(params.locale, namespaces);
  const { validatedUser, error } = await validatUser();

  if (error || !validatedUser) return redirect("/signout");

  return (
    <div className="w-screen h-screen flex overflow-auto bg-gray-50 dark:bg-background">
      <TranslationsProvider
        locale={params.locale}
        resources={resources}
        namespaces={namespaces}
      >
        <Sidebar workspaceId={params.workspaceId} />
        <div
          className="flex flex-grow md:ml-[250px] h-[100vh] flex-col gap-2"
          style={{ width: "100%" }}
        >
          <BackgroundOverlay />
          {children}
        </div>
      </TranslationsProvider>
    </div>
  );
}
