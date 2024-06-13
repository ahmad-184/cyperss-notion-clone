"use client";

import { Context as SocketContext } from "@/contexts/socket-provider";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store";
import { RotateCcw, Wifi, WifiOff } from "lucide-react";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

interface ConnectionStatusProps {}

const ConnectionStatus: React.FC<ConnectionStatusProps> = () => {
  const { socket, connection, reconnect, ping, reconnecting } =
    useContext(SocketContext);
  const { current_workspace } = useAppSelector((store) => store.workspace);
  const { t } = useTranslation();

  return (
    <>
      {current_workspace?.type === "shared" ? (
        <div className="w-full">
          <div className="flex justify-between items-center gap-5">
            <p className="text-muted-foreground text-xs font-medium">
              {t("dashboard:connection-status")}
            </p>
            <div className="flex gap-4 items-center font-medium text-sm">
              {socket && !connection ? (
                <RotateCcw
                  className={cn("w-4 h-4 cursor-pointer dark:text-gray-400", {
                    "spin-in-12 duration-1000 transition-all animate-spin":
                      reconnecting,
                  })}
                  onClick={reconnect}
                />
              ) : null}
              {socket && connection ? (
                <p className="dark:text-muted-foreground">
                  {t("dashboard:ping")}: {ping}
                </p>
              ) : null}
              {socket && connection ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-rose-500" />
              )}
            </div>
          </div>
          <hr className="my-3" />
        </div>
      ) : null}
    </>
  );
};

export default ConnectionStatus;
