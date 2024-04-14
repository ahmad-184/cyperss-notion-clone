"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { setCurrentWorkspace } from "@/store/slices/workspace";
import { Skeleton } from "../ui/Skeleton";
import { ScrollArea } from "../ui/ScrollArea";
import SelectWorkspace from "./SelectWorkspace";
import Link from "next/link";
import CustomDialog from "../CustomDialog";
import WorkspaceCreator from "./WorkspaceCreator";
import { cn, returnAllWorkspaces } from "@/lib/utils";
import { getAllWorkspacesThunk } from "@/store/slices/workspace/thunk-actions";
import { getWorkspacesReturnType } from "@/server-actions";

const WorkspacesDropdown = () => {
  const { workspaces, current_workspace, loading } = useAppSelector(
    (store) => store.workspace
  );
  const params = useParams();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [openDropdown, setOpenDropdown] = useState(false);

  const urlWorkspaceId = useMemo(
    () => params.workspaceId,
    [params.workspaceId]
  );

  useEffect(() => {
    const fetchWorkspaces = async () => {
      const allWorkspaces = returnAllWorkspaces(workspaces);
      if (!allWorkspaces.length) {
        const data = await dispatch(getAllWorkspacesThunk());
        const thereIsData = returnAllWorkspaces(
          data.payload as NonNullable<getWorkspacesReturnType["data"]>
        );
        if (!thereIsData.length) return router.replace("/dashboard");
      }
    };
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    const allWorkspaces = returnAllWorkspaces(workspaces);
    if (!allWorkspaces.length) return;
    const workspace = allWorkspaces.find((w) => w.id === urlWorkspaceId);
    if (!workspace) {
      router.replace("/dashboard");
      router.refresh();

      return;
    }
    if (current_workspace && current_workspace.id === workspace.id) return;
    dispatch(setCurrentWorkspace(workspace));
    if (window) window.localStorage.setItem("active_workspace", workspace.id);
  }, [urlWorkspaceId, workspaces]);

  const selectWorkspace = () => setOpenDropdown((prev) => !prev);

  return (
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
              className="mb-2 bg-transparent"
            />
            <ScrollArea
              className={`w-full border rounded-md dark:bg-black/30 h-[174px] select-none flex-col transition-all duration-150  ${
                openDropdown ? "table px-2 py-3" : "invisible h-0"
              }`}
            >
              <div className="h-full flex flex-col gap-3 w-full">
                <div className="w-full">
                  {workspaces.private.length ? (
                    <div className="flex flex-col w-full mb-2">
                      <p className="text-gray-500 text-sm">
                        Private Workspaces
                      </p>
                      {workspaces.private.map((e, i) => (
                        <Link key={e.id + i} href={`/dashboard/${e.id}`}>
                          <SelectWorkspace
                            key={e.id + i}
                            workspace={e}
                            selectWorkspace={selectWorkspace}
                            className={cn("text-sm", {
                              "bg-primary/20 hover:bg-primary/30 dark:hover:bg-primary/50 dark:bg-primary/20":
                                current_workspace.id === e.id,
                            })}
                            image_size={20}
                          />
                        </Link>
                      ))}
                    </div>
                  ) : null}

                  {workspaces.shared.length ? (
                    <div className="flex flex-col w-full mb-2">
                      <p className="text-gray-500 text-sm">Shared Workspaces</p>
                      {workspaces.shared.map((e, i) => (
                        <Link key={e.id + i} href={`/dashboard/${e.id}`}>
                          <SelectWorkspace
                            workspace={e}
                            selectWorkspace={selectWorkspace}
                            className={cn("text-sm", {
                              "bg-primary/20": current_workspace.id === e.id,
                            })}
                            image_size={20}
                          />
                        </Link>
                      ))}
                    </div>
                  ) : null}

                  {workspaces.collaborating.length ? (
                    <div className="flex flex-col w-full">
                      <p className="text-gray-500 text-sm">
                        Collaborating Workspaces
                      </p>
                      {workspaces.collaborating.map((e, i) => (
                        <Link key={e.id + i} href={`/dashboard/${e.id}`}>
                          <SelectWorkspace
                            workspace={e}
                            selectWorkspace={selectWorkspace}
                            className={cn("text-sm", {
                              "bg-primary/20": current_workspace.id === e.id,
                            })}
                            image_size={20}
                          />
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
                <CustomDialog
                  header={"New Workspace"}
                  description="Workspace give you the power to collaborate woth others. you can change your workspace privacy settings after creating workspace too."
                  content={<WorkspaceCreator />}
                >
                  <div className="w-full">
                    <div className="flex w-full gap-2 items-center p-2 cursor-pointer hover:bg-muted/70 rounded-md transition-all duration-150">
                      <div className="rounded-full relative bottom-[1.5px] w-4 h-4 flex items-center justify-center bg-muted dark:bg-slate-800 text-slate-500">
                        +
                      </div>
                      <p className="text-sm">Create New Workspace</p>
                    </div>
                  </div>
                </CustomDialog>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspacesDropdown;
