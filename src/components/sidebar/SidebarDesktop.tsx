"use client";

import { useState } from "react";
import Sidebar from ".";
import BackgroundOverlay from "../BackgroundOverlay";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/Resizable";

interface SidebarDesktopProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  workspaceId: string;
  locale: string;
}

const SidebarDesktop: React.FC<SidebarDesktopProps> = ({
  children,
  workspaceId,
  locale,
  sidebar,
}) => {
  const [isSidebarExpand, setIsSidebarExpand] = useState(true);

  return (
    <>
      <div className="hidden md:block">
        <ResizablePanelGroup
          direction="horizontal"
          className="w-screen h-screen bg-gray-50 dark:bg-background"
        >
          <ResizablePanel
            onCollapse={() => {
              setIsSidebarExpand(false);
            }}
            defaultSize={25}
            minSize={17}
            collapsible={true}
            onExpand={() => {
              setIsSidebarExpand(true);
              console.log("expand");
            }}
          >
            {isSidebarExpand ? sidebar : null}
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
    </>
  );
};

export default SidebarDesktop;
