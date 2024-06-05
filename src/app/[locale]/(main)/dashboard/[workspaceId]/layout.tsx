import BackgroundOverlay from "@/components/BackgroundOverlay";
import Sidebar from "@/components/sidebar";
import MobileSidebar from "@/components/sidebar/MobileSidebar";
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
        <Sidebar
          workspaceId={params.workspaceId}
          className="fixed top-0 bottom-0 left-0"
        />
        <MobileSidebar>
          <Sidebar
            workspaceId={params.workspaceId}
            className="md:hidden flex z-50 w-screen sm:w-[280px]"
          />
        </MobileSidebar>
        <div
          className="flex flex-grow md:ml-[280px] h-[100vh] flex-col gap-2"
          style={{ width: "100%" }}
        >
          <BackgroundOverlay />
          {children}
        </div>
      </TranslationsProvider>
    </div>
  );
}
