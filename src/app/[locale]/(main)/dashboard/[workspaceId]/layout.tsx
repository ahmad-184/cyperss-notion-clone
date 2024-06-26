import BackgroundOverlay from "@/components/BackgroundOverlay";
import Sidebar from "@/components/sidebar";
import MobileSidebar from "@/components/sidebar/MobileSidebar";
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
      <div className="hidden md:block">
        <ResizablePanelGroup
          direction="horizontal"
          className="w-screen h-screen bg-gray-50 dark:bg-background"
        >
          <ResizablePanel defaultSize={25} minSize={17}>
            <Sidebar
              workspaceId={params.workspaceId}
              className="h-full relative w-full overflow-auto"
              locale={params.locale}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel className="flex-grow" defaultSize={75}>
            <div
              className="flex flex-grow h-[100vh] w-full overflow-auto flex-col gap-2"
              style={{ width: "100%" }}
            >
              <BackgroundOverlay />
              {children}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

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
      </div>
    </>
    // <div className="w-screen h-screen flex overflow-auto bg-gray-50 dark:bg-background">
    //   <MobileSidebar locale={params.locale}>
    //     <Sidebar
    //       locale={params.locale}
    //       workspaceId={params.workspaceId}
    //       className="md:hidden flex z-50 w-screen sm:w-[280px]"
    //     />
    //   </MobileSidebar>
    //   <Sidebar
    //     workspaceId={params.workspaceId}
    //     className="fixed top-0 bottom-0 ltr:left-0 rtl:right-0"
    //     locale={params.locale}
    //   />
    //   <div
    //     className="flex flex-grow ltr:md:ml-[280px] rtl:md:mr-[280px] h-[100vh] flex-col gap-2"
    //     style={{ width: "100%" }}
    //   >
    //     <BackgroundOverlay />
    //     {children}
    //   </div>
    // </div>
  );
}
