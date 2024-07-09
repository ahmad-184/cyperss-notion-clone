import BackgroundOverlay from "@/components/BackgroundOverlay";
import Sidebar from "@/components/sidebar";
import MobileSidebar from "@/components/sidebar/MobileSidebar";
import SidebarDesktop from "@/components/sidebar/SidebarDesktop";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/Resizable";
import { validatUser } from "@/lib/validateUser";
import { redirect } from "next/navigation";

export default async function Layout({
  params,
  children,
}: {
  children: React.ReactNode;
  params: { locale: string; workspaceId: string };
}) {
  const { validatedUser, error } = await validatUser();

  if (error || !validatedUser) return redirect("/signout");

  return (
    <>
      <div className="w-screen h-screen flex overflow-auto bg-gray-50 dark:bg-background">
        <Sidebar
          workspaceId={params.workspaceId}
          className="fixed top-0 bottom-0 w-[280px] ltr:left-0 rtl:right-0 ltr:border-r rtl:border-l"
          locale={params.locale}
        />
        <MobileSidebar locale={params.locale}>
          <Sidebar
            locale={params.locale}
            workspaceId={params.workspaceId}
            className="md:hidden flex z-50 w-screen sm:w-[280px]"
          />
        </MobileSidebar>
        <div
          className="flex flex-grow ltr:md:ml-[280px] rtl:md:mr-[280px] h-[100vh] flex-col gap-2"
          style={{ width: "100%" }}
        >
          <BackgroundOverlay />
          {children}
        </div>
      </div>
      {/* <SidebarDesktop
        sidebar={
          <Sidebar
            workspaceId={params.workspaceId}
            className="h-full relative w-full overflow-auto"
            locale={params.locale}
          />
        }
        locale={params.locale}
        workspaceId={params.workspaceId}
      >
        {children}
      </SidebarDesktop>

      <div className="w-screen h-screen md:hidden flex overflow-auto bg-gray-50 dark:bg-background">
        <MobileSidebar locale={params.locale}>
          <Sidebar
            locale={params.locale}
            workspaceId={params.workspaceId}
            className="md:hidden flex z-50 w-screen overflow-auto sm:w-[320px]"
          />
        </MobileSidebar>
        <div
          className="flex flex-grow h-[100vh] flex-col gap-2"
          style={{ width: "100%" }}
        >
          <BackgroundOverlay />
          {children}
        </div>
      </div> */}
    </>
  );
}
