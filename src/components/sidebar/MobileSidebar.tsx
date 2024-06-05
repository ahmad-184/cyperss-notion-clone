"use client";
import { useContext } from "react";
import { Sheet, SheetContent } from "../ui/Sheet";
import { Context as LocalContext } from "@/contexts/local-context";

interface MobileSidebarProps {
  children: React.ReactNode;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ children }) => {
  const { mobileSidebarOpen, mobile_sidebar_open } = useContext(LocalContext);

  return (
    <>
      <Sheet
        open={mobile_sidebar_open}
        onOpenChange={(e) => mobileSidebarOpen(e)}
      >
        <SheetContent
          className="w-fit p-0 m-0"
          side={"left"}
          showCloseBtn={false}
        >
          {children}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileSidebar;
