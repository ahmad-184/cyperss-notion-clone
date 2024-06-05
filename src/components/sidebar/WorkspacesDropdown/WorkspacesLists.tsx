import { User, WorkspaceTypes } from "@/types";
import Link from "next/link";
import { useContext, useMemo } from "react";
import SelectWorkspace from "../SelectWorkspace";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useAppDispatch } from "@/store";
import { changeBgOverlayStatus } from "@/store/slices/workspace";
import { Context as LocalContext } from "@/contexts/local-context";
import { Workspace } from "@prisma/client";

interface WorkspacesListsProps {
  workspaces: Workspace[];
  current_workspace: WorkspaceTypes;
  user: User;
  selectWorkspace: () => void;
}

const WorkspacesLists: React.FC<WorkspacesListsProps> = ({
  workspaces,
  current_workspace,
  user,
  selectWorkspace,
}) => {
  const dispatch = useAppDispatch();

  const { mobileSidebarOpen, mobile_sidebar_open } = useContext(LocalContext);

  const handleCloseSidebarMobile = () => {
    if (mobile_sidebar_open) mobileSidebarOpen(false);
  };

  const handleShowBackgroundOverlay = (id: string) => {
    if (current_workspace && current_workspace.id === id) return;
    dispatch(changeBgOverlayStatus(true));
  };

  const privateWorkspaces = useMemo(() => {
    return workspaces.filter(
      (e) => e.type === "private" && e.workspaceOwnerId === user.id
    );
  }, [workspaces]);

  const sharedWorkspaces = useMemo(() => {
    return workspaces.filter(
      (e) => e.type === "shared" && e.workspaceOwnerId === user.id
    );
  }, [workspaces]);

  const collaboratingWorkspaces = useMemo(() => {
    return workspaces.filter((e) => e.workspaceOwnerId !== user.id);
  }, [workspaces]);

  return (
    <div className="h-full flex flex-col gap-3 w-full">
      <div className="w-full">
        {privateWorkspaces.length ? (
          <div className="flex flex-col w-full mb-2">
            <p className="text-gray-500 text-xs">Private Workspaces</p>
            {privateWorkspaces.map((e, i) => (
              <Link
                key={e.id + i}
                href={`/dashboard/${e.id}`}
                onClick={() => {
                  handleShowBackgroundOverlay(e.id);
                }}
              >
                <SelectWorkspace
                  key={e.id + i}
                  workspace={e}
                  selectWorkspace={selectWorkspace}
                  className={cn("text-sm", {
                    "border-[1.1px] border-primary hover:bg-primary/5 dark:hover:bg-primary/50 dark:bg-primary/20":
                      current_workspace.id === e.id,
                  })}
                  image_size={20}
                  endIcon={
                    current_workspace.id === e.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )
                  }
                />
              </Link>
            ))}
          </div>
        ) : null}

        {sharedWorkspaces.length ? (
          <div className="flex flex-col w-full mb-2">
            <p className="text-gray-500 text-xs">Shared Workspaces</p>
            {sharedWorkspaces.map((e, i) => (
              <Link
                key={e.id + i}
                href={`/dashboard/${e.id}`}
                onClick={() => {
                  handleShowBackgroundOverlay(e.id);
                }}
              >
                <SelectWorkspace
                  key={e.id + i}
                  workspace={e}
                  selectWorkspace={selectWorkspace}
                  className={cn("text-sm", {
                    "border-[1.1px] border-primary hover:bg-primary/5  dark:hover:bg-primary/50 dark:bg-primary/20":
                      current_workspace.id === e.id,
                  })}
                  image_size={20}
                  endIcon={
                    current_workspace.id === e.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )
                  }
                />
              </Link>
            ))}
          </div>
        ) : null}

        {collaboratingWorkspaces.length ? (
          <div className="flex flex-col w-full">
            <p className="text-gray-500 text-xs">Collaborating Workspaces</p>
            {collaboratingWorkspaces.map((e, i) => (
              <Link
                key={e.id + i}
                href={`/dashboard/${e.id}`}
                onClick={() => {
                  handleShowBackgroundOverlay(e.id);
                }}
              >
                <SelectWorkspace
                  key={e.id + i}
                  workspace={e}
                  selectWorkspace={selectWorkspace}
                  className={cn("text-sm", {
                    "border-[1.1px] border-primary hover:bg-primary/5  dark:hover:bg-primary/50 dark:bg-primary/20":
                      current_workspace.id === e.id,
                  })}
                  image_size={20}
                  endIcon={
                    current_workspace.id === e.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )
                  }
                />
              </Link>
            ))}
          </div>
        ) : null}
      </div>
      <Link
        href={`/dashboard/${current_workspace.id}/new-workspace`}
        onClick={handleCloseSidebarMobile}
      >
        <div className="w-full">
          <div className="flex w-full gap-2 items-center p-2 cursor-pointer hover:bg-muted/70 rounded-md transition-all duration-150">
            <div className="rounded-full relative bottom-[1.5px] w-4 h-4 flex items-center justify-center bg-muted dark:bg-slate-800 text-slate-500">
              +
            </div>
            <p className="text-xs">Create New Workspace</p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default WorkspacesLists;
