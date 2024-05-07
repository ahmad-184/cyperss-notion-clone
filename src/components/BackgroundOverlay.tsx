"use client";
import { useAppSelector } from "@/store";
import CypressLogo from "./CypressLogo";

interface BackgroundOverlayProps {}

const BackgroundOverlay: React.FC<BackgroundOverlayProps> = () => {
  const { background_overlay } = useAppSelector((store) => store.workspace);

  return (
    <>
      {background_overlay ? (
        <div
          style={{ zIndex: 2000 }}
          className="bg-background/10 select-none backdrop-blur-[10px] flex items-center justify-center fixed inset-0 top-0 left-0 right-0 bottom-0"
        >
          <div className="p-2 flex flex-col gap-4 items-center">
            <CypressLogo width={60} height={60} className="animate-pulse" />
          </div>
        </div>
      ) : null}
    </>
  );
};

export default BackgroundOverlay;
