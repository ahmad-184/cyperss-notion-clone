"use client";

import WorkspaceSettings from "./WorkspaceSettings";
import DeleteWorkspace from "./DeleteWorkspace";
import { Subscription } from "@prisma/client";
import { User } from "@/types";
import { useAppSelector } from "@/store";
import { Skeleton } from "../ui/Skeleton";
import UserSettings from "./UserSettings";

interface Settings {
  subscription: Subscription;
  user: User;
  workspaceId: string;
}

const Settings: React.FC<Settings> = ({ subscription, user, workspaceId }) => {
  const { loading, current_workspace } = useAppSelector(
    (store) => store.workspace
  );

  return (
    <div className="w-full flex flex-col gap-5 max-w-6xl mt-3">
      <>
        {user.id === current_workspace?.workspaceOwnerId ? (
          <>
            {loading || !current_workspace ? (
              <Skeleton className="h-5 w-16" />
            ) : (
              <h1 className="dark:text-gray-300 font-medium text-lg">
                Settings
              </h1>
            )}
            {/* workspace settings */}
            <div className="flex w-full flex-col gap-7">
              <WorkspaceSettings subscription={subscription} user={user} />
              <UserSettings user={user} />
              <DeleteWorkspace />
            </div>
          </>
        ) : !loading &&
          current_workspace?.workspaceOwnerId &&
          user.id !== current_workspace?.workspaceOwnerId ? (
          <>
            <h1 className="text-center text-2xl sm:text-4xl dark:text-rose-400 font-bold">
              Access not granted! ☠️
            </h1>
            <p className="text-center text-sm sm:text-lg dark:text-muted-foreground">
              Only workspace owner have access to settings page
            </p>
          </>
        ) : null}
      </>
    </div>
  );
};

export default Settings;
