"use client";

import Link from "next/link";
import CypressHomeIcon from "../icons/HomeIcon";
import { useAppSelector } from "@/store";
import CypressSettingsIcon from "../icons/SettingsIcon";
import { Skeleton } from "../ui/Skeleton";
import TrashBin from "../trash-bin";
import { User } from "@/types";

interface NativeNavigationProps {
  user: User;
}

const NativeNavigation: React.FC<NativeNavigationProps> = ({ user }) => {
  const workspace = useAppSelector(
    (store) => store.workspace.current_workspace
  );
  const loading = useAppSelector((store) => store.workspace.loading);

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
        <div className="my-5 w-full">
          <div className="w-full flex flex-col gap-2">
            <Link href={`/dashboard/${workspace?.id}`}>
              <div
                className="flex group/native w-full cursor-pointer transition-all
          py-1 gap-2
          items-center dark:text-gray-400"
              >
                <CypressHomeIcon />
                <p>My Workspace</p>
              </div>
            </Link>
            {user.id === workspace?.workspaceOwnerId && (
              <Link href={`/dashboard/${workspace?.id}/settings`}>
                <div
                  className="flex group/native w-full cursor-pointer transition-all
          py-1 gap-2
          items-center dark:text-gray-400"
                >
                  <CypressSettingsIcon />
                  <p>Settings</p>
                </div>
              </Link>
            )}
            <TrashBin />
          </div>
        </div>
      )}
    </>
  );
};

export default NativeNavigation;
