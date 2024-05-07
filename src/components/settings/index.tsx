"use client";

import WorkspaceSettings from "./WorkspaceSettings";
import DeleteWorkspace from "./DeleteWorkspace";
import { Subscription } from "@prisma/client";
import { User, WorkspaceTypes } from "@/types";
import { useAppDispatch } from "@/store";
import { useEffect } from "react";
import { replaceWorkspace } from "@/store/slices/workspace";
import { getWorkspaceById } from "@/server-actions";
import { toast } from "sonner";

interface Settings {
  subscription: Subscription;
  user: User;
  workspaceId: string;
}

const Settings: React.FC<Settings> = ({ subscription, user, workspaceId }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const updateWorkspace = async () => {
      try {
        if (!workspaceId) return;
        const { data, error } = await getWorkspaceById(workspaceId);
        if (error || !data) throw new Error();
        dispatch(replaceWorkspace(data));
      } catch (err) {
        toast.error("Something went wrong, please try again");
        window.location.href = "/dashboard";
      }
    };
    updateWorkspace();
  }, [workspaceId]);

  return (
    <div className="w-full flex flex-col gap-5 max-w-6xl mt-3">
      <h1 className=" dark:text-gray-300 font-medium text-lg">Settings</h1>
      {/* workspace settings */}
      <div className="flex w-full flex-col gap-7">
        <WorkspaceSettings subscription={subscription} user={user} />
        <div className="flex flex-col gap-3">
          <p className="dark:text-gray-300 font-medium text-lg">
            Delete workspace
          </p>
          <DeleteWorkspace />
        </div>
      </div>
    </div>
  );
};

export default Settings;
