"use client";

import Link from "next/link";
import CypressHomeIcon from "../icons/HomeIcon";
import { useAppSelector } from "@/store";
import CypressSettingsIcon from "../icons/SettingsIcon";
import { Skeleton } from "../ui/Skeleton";
import TrashBin from "../trash-bin";
import { User } from "@/types";
import { useContext, useTransition } from "react";
import { useLocal } from "@/contexts/local-context";
import { useTranslation } from "react-i18next";

interface NativeNavigationProps {
  user: User;
}

const NativeNavigation: React.FC<NativeNavigationProps> = ({ user }) => {
  const workspace = useAppSelector(
    (store) => store.workspace.current_workspace
  );
  const loading = useAppSelector((store) => store.workspace.loading);
  const { mobileSidebarOpen, mobile_sidebar_open } = useLocal();
  const { t } = useTranslation();

  const handleCloseSidebarMobile = () => {
    if (mobile_sidebar_open) mobileSidebarOpen(false);
  };

  return (
    <>
      {loading ? (
        <>
          <div className="my-5 w-full">
            <div className="w-full flex flex-col gap-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-2/4" />
              <Skeleton className="h-5 w-1/3" />
            </div>
          </div>
        </>
      ) : (
        <div className="my-2 w-full">
          <div className="w-full flex flex-col gap-2">
            <Link
              href={`/dashboard/${workspace?.id}`}
              onClick={handleCloseSidebarMobile}
            >
              <div
                className="flex group/native w-full cursor-pointer transition-all
          py-1 gap-2
          items-center dark:text-gray-400"
              >
                <CypressHomeIcon />
                <p className="text-sm">{t("dashboard:my-workspace")}</p>
              </div>
            </Link>
            <Link
              href={`/dashboard/${workspace?.id}/settings`}
              onClick={handleCloseSidebarMobile}
            >
              <div
                className="flex group/native w-full cursor-pointer transition-all
          py-1 gap-2
          items-center dark:text-gray-400"
              >
                <CypressSettingsIcon />
                <p className="text-sm">{t("dashboard:settings")}</p>
              </div>
            </Link>
            <TrashBin />
          </div>
        </div>
      )}
    </>
  );
};

export default NativeNavigation;
