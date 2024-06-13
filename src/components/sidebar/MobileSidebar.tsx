"use client";
import { Sheet, SheetContent } from "../ui/Sheet";
import { useLocal } from "@/contexts/local-context";
import { getDirByLang } from "@/lib/dir";

interface MobileSidebarProps {
  children: React.ReactNode;
  locale: string;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ locale, children }) => {
  const { mobileSidebarOpen, mobile_sidebar_open } = useLocal();

  return (
    <>
      <Sheet
        open={mobile_sidebar_open}
        onOpenChange={(e) => mobileSidebarOpen(e)}
      >
        <SheetContent
          className="w-fit p-0 m-0"
          side={getDirByLang(locale) === "en" ? "left" : "right"}
          showCloseBtn={false}
        >
          {children}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileSidebar;
