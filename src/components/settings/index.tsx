"use client";

import WorkspaceSettings from "./WorkspaceSettings";
import DeleteWorkspace from "./DeleteWorkspace";
import { Subscription } from "@prisma/client";
import { User } from "@/types";
import { useAppSelector } from "@/store";
import { Skeleton } from "../ui/Skeleton";
import UserSettings from "./UserSettings";
import { useLocal } from "@/contexts/local-context";
import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import GeneralSettings from "./GeneralSettings";

interface Settings {
  subscription: Subscription;
  user: User;
  workspaceId: string;
}

const Settings: React.FC<Settings> = ({ subscription, user }) => {
  const { loading, current_workspace } = useAppSelector(
    (store) => store.workspace
  );
  const { t } = useTranslation();

  const { mobileSidebarOpen } = useLocal();

  return (
    <div className="h-fit">
      {loading || !current_workspace ? (
        <Skeleton className="ml-3 mt-6 sm:ml-10 h-5 w-16" />
      ) : (
        <div className="px-3 pt-6 pb-3 sm:px-10 flex justify-center">
          <div className="flex items-center gap-3 max-w-6xl mx-auto w-full">
            <div
              onClick={() => {
                mobileSidebarOpen(true);
              }}
              className="md:hidden max-w-[600px] dark:text-white relative bottom-[2px]"
            >
              <Menu className="w-7 h-7" />
            </div>
            <h1 className="dark:text-white  font-semibold text-xl">
              {t("dashboard:settings")}
            </h1>
          </div>
        </div>
      )}
      <div className="p-5 pt-2 px-3 sm:px-10 flex justify-center">
        <div className="w-full flex flex-col gap-5 max-w-6xl">
          <>
            {/* workspace settings */}
            <div className="flex w-full flex-col gap-7">
              {user.id === current_workspace?.workspaceOwnerId ? (
                <WorkspaceSettings subscription={subscription} user={user} />
              ) : null}
              {loading || !current_workspace ? null : <GeneralSettings />}
              {loading || !current_workspace ? null : (
                <UserSettings user={user} />
              )}
              {user.id === current_workspace?.workspaceOwnerId ? (
                <DeleteWorkspace />
              ) : null}
            </div>
          </>
        </div>
      </div>
    </div>
  );
};

export default Settings;
