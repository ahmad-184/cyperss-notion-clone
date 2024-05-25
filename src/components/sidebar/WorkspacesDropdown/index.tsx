"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  changeBgOverlayStatus,
  setCurrentWorkspace,
} from "@/store/slices/workspace";
import { Skeleton } from "../../ui/Skeleton";
import { ScrollArea } from "../../ui/ScrollArea";
import SelectWorkspace from "../SelectWorkspace";
import { cn } from "@/lib/utils";
import { getAllWorkspacesThunk } from "@/store/slices/workspace/thunk-actions";
import { User, WorkspaceTypes } from "@/types";
import { ChevronsUpDown } from "lucide-react";
import WorkspacesLists from "./WorkspacesLists";
import { getFullDataWorkspaceByIdAction } from "@/server-actions";

interface WorkspacesDropdownProps {
  user: User;
}

const WorkspacesDropdown: React.FC<WorkspacesDropdownProps> = ({ user }) => {
  const { workspaces, current_workspace, loading, background_overlay } =
    useAppSelector((store) => store.workspace);
  const params = useParams();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [openDropdown, setOpenDropdown] = useState(false);

  const workspaceIdParams = useMemo(
    () => params.workspaceId,
    [params.workspaceId]
  );

  useEffect(() => {
    const fetchWorkspaces = async () => {
      const allWorkspaces = workspaces;
      if (!allWorkspaces.length) {
        const data = await dispatch(getAllWorkspacesThunk());
        const thereIsData = data.payload as WorkspaceTypes[];
        if (!thereIsData.length) return router.replace("/dashboard");
      }
    };
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    const update = async () => {
      const allWorkspaces = workspaces;
      if (!allWorkspaces.length) return;
      const workspace = allWorkspaces.find((w) => w.id === workspaceIdParams);
      if (!workspace) {
        router.replace("/dashboard");
        return;
      }
      if (current_workspace && current_workspace.id === workspace.id) return;
      if (!allWorkspaces.length) return;
      if (workspace.type === "private") {
        dispatch(setCurrentWorkspace(workspace));
      } else if (workspace.type === "shared") {
        const { data, error } = await getFullDataWorkspaceByIdAction(
          workspaceIdParams as string
        );
        if (error || !data) {
          router.replace("/dashboard");
          return;
        }
        dispatch(setCurrentWorkspace(data));
      }
      if (window) window.localStorage.setItem("active_workspace", workspace.id);
      if (background_overlay) dispatch(changeBgOverlayStatus(false));
    };
    update();
  }, [workspaceIdParams, workspaces]);

  const selectWorkspace = () => {
    setOpenDropdown((prev) => !prev);
  };

  return (
    <>
      <div className="w-full relative">
        <div className="flex flex-col gap-3">
          {loading ? (
            <Skeleton className="w-full h-9 my-2" />
          ) : !current_workspace ? (
            <div className="w-full bg-muted/50 text-center cursor-pointer transition-all duration-150  hover:bg-muted p-2 gap-4 my-2 rounded-md">
              <p>Select a Workspace</p>
            </div>
          ) : (
            <div className="w-full flex-col gap-3">
              <SelectWorkspace
                workspace={current_workspace}
                selectWorkspace={selectWorkspace}
                className="mb-2 bg-transparent text-sm"
                image_size={20}
                endIcon={
                  <ChevronsUpDown
                    className={cn("dark:text-gray-400 text-gray-500 w-3 h-3", {
                      "dark:text-gray-200 text-gray-800": openDropdown,
                    })}
                  />
                }
              />
              <ScrollArea
                className={`w-full border rounded-md dark:bg-black/30 h-[174px] select-none flex-col transition-all duration-150  ${
                  openDropdown ? "table px-2 py-3" : "invisible h-0"
                }`}
              >
                <WorkspacesLists
                  user={user}
                  workspaces={workspaces}
                  current_workspace={current_workspace}
                  selectWorkspace={selectWorkspace}
                />
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WorkspacesDropdown;
