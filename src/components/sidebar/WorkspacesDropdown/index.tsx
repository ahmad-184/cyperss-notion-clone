"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  addWorkspace,
  changeBgOverlayStatus,
  setCurrentWorkspace,
} from "@/store/slices/workspace";
import { Skeleton } from "../../ui/Skeleton";
import { ScrollArea } from "../../ui/ScrollArea";
import SelectWorkspace from "../SelectWorkspace";
import { cn } from "@/lib/utils";
import { getAllWorkspacesThunk } from "@/store/slices/workspace/thunk-actions";
import { User, WorkspaceTypes } from "@/types";
import { ChevronRight, ChevronsUpDown } from "lucide-react";
import WorkspacesLists from "./WorkspacesLists";
import {
  getFullDataWorkspaceByIdAction,
  getWorkspacesListAction,
} from "@/server-actions";
import { Button } from "@/components/ui/Button";
import { Context as LocalContext } from "@/contexts/local-context";
import { Workspace } from "@prisma/client";
import Loader from "@/components/Loader";

interface WorkspacesDropdownProps {
  user: User;
}

const WorkspacesDropdown: React.FC<WorkspacesDropdownProps> = ({ user }) => {
  const { workspaces, current_workspace, loading, background_overlay } =
    useAppSelector((store) => store.workspace);
  const params = useParams();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [workspacesList, setWorkspacesList] = useState<
    Workspace[] | WorkspaceTypes[] | []
  >([]);

  const { mobileSidebarOpen } = useContext(LocalContext);

  const [openDropdown, setOpenDropdown] = useState(false);
  const [isLoading, setIsloading] = useState(false);

  const workspaceIdParams = useMemo(
    () => params.workspaceId,
    [params.workspaceId]
  );

  const fetchWorkspaces = useCallback(async () => {
    const allWorkspaces = workspaces;
    if (!allWorkspaces.length) {
      const data = await dispatch(getAllWorkspacesThunk());
      const thereIsData = data.payload as WorkspaceTypes[];
      if (!thereIsData.length) return router.replace("/dashboard");
    }
  }, [workspaces]);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const update = useCallback(async () => {
    const allWorkspaces = workspaces;
    if (!allWorkspaces.length) return;
    const workspace = allWorkspaces.find((w) => w.id === workspaceIdParams);
    if (!workspace) {
      const exist = await getFullDataWorkspaceByIdAction(
        workspaceIdParams as string
      );
      if (exist.data) {
        dispatch(setCurrentWorkspace(exist.data));
        dispatch(addWorkspace({ data: exist.data }));
        if (window)
          window.localStorage.setItem("active_workspace", exist.data.id);
        if (background_overlay) dispatch(changeBgOverlayStatus(false));
      } else {
        if (window) window.localStorage.removeItem("active_workspace");
        router.replace("/dashboard");
        return;
      }
    } else {
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
    }
  }, [current_workspace?.id, workspaces, workspaceIdParams, workspacesList]);

  useEffect(() => {
    update();
  }, [workspaceIdParams, workspaces]);

  const selectWorkspace = () => {
    setOpenDropdown((prev) => !prev);
  };

  useEffect(() => {
    if (current_workspace && openDropdown) {
      (async () => {
        try {
          setIsloading(true);
          const { data: res, error } = await getWorkspacesListAction(
            user.id || ""
          );
          if (error || !res) {
            setWorkspacesList(workspaces);
            return;
          }
          setWorkspacesList(res);
        } catch (err: any) {
          console.log(err);
        } finally {
          setIsloading(false);
        }
      })();
    }
  }, [current_workspace?.id, openDropdown]);

  return (
    <>
      <div className="w-full relative">
        <div className="flex flex-col gap-3">
          {loading ? (
            <Skeleton className="w-full h-9 my-2" />
          ) : !current_workspace ? (
            <div className="w-full bg-muted/50 text-center text-sm cursor-pointer transition-all duration-150  hover:bg-muted p-2 gap-4 my-2 rounded-md">
              <p>Select a Workspace</p>
            </div>
          ) : (
            <div className="w-full flex-col">
              <div className="w-full mb-2 flex items-center gap-3 md:gap-0 justify-between">
                <SelectWorkspace
                  workspace={current_workspace}
                  selectWorkspace={selectWorkspace}
                  className="bg-transparent text-sm"
                  image_size={20}
                  endIcon={
                    <ChevronsUpDown
                      className={cn(
                        "dark:text-gray-400 text-gray-500 w-3 h-3",
                        {
                          "dark:text-gray-200 text-gray-800": openDropdown,
                        }
                      )}
                    />
                  }
                />
                <div className="flex md:hidden">
                  <Button
                    onClick={() => mobileSidebarOpen(false)}
                    variant={"outline"}
                    size={"icon"}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </div>
              </div>
              <ScrollArea
                className={`w-full border rounded-md ${
                  isLoading ? "h-[50px]" : "h-[174px]"
                } dark:bg-black/30 select-none flex-col transition-all duration-150  ${
                  openDropdown ? "table px-2 py-3" : "invisible h-0"
                }`}
              >
                {isLoading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader className="w-6 h-6" />
                  </div>
                ) : !isLoading && workspacesList.length ? (
                  <WorkspacesLists
                    user={user}
                    workspaces={workspacesList}
                    current_workspace={current_workspace}
                    selectWorkspace={selectWorkspace}
                  />
                ) : null}
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WorkspacesDropdown;
