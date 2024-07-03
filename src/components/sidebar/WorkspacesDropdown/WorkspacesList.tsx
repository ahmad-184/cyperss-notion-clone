import { useLanguage } from "@/contexts/language-context";
import { useLocal } from "@/contexts/local-context";
import { useAppDispatch } from "@/store";
import { changeBgOverlayStatus } from "@/store/slices/workspace";
import { User, WorkspaceTypes } from "@/types";
import { Workspace } from "@prisma/client";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import SelectWorkspace from "../SelectWorkspace";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Loader from "@/components/Loader";
import { useClickOutside } from "@mantine/hooks";
import { getDirByLang } from "@/lib/dir";

interface WorkspacesListProps {
  workspaces: Workspace[];
  current_workspace: WorkspaceTypes;
  user: User;
  selectWorkspace: () => void;
  open: boolean;
  isLoading: boolean;
}

const WorkspacesList: React.FC<WorkspacesListProps> = ({
  workspaces,
  current_workspace,
  user,
  selectWorkspace,
  open,
  isLoading,
}) => {
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();
  const { t } = useTranslation();

  const { mobileSidebarOpen, mobile_sidebar_open } = useLocal();

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
    <div
      className={cn(
        "origin-top-right invisible opacity-0 scale-90 absolute w-full transition-all duration-200 rounded-md shadow-md z-50 h-[200px] bg-gray-300/10 dark:bg-black/10 backdrop-blur-md group p-2 overflow-auto border-[1px] border-muted",
        {
          "visible opacity-100 scale-100": open,
        }
      )}
    >
      {isLoading && !workspaces.length ? (
        <div className="w-full h-full flex items-center justify-center">
          <Loader className="w-6 h-6" />
        </div>
      ) : workspaces.length ? (
        <>
          {privateWorkspaces.length ? (
            <div className="flex flex-col w-full mb-2">
              <p className="text-gray-500 text-xs font-medium">
                {t("dashboard:private-workspace")}
              </p>
              {privateWorkspaces.map((e, i) => (
                <Link
                  key={e.id + i}
                  href={`/dashboard/${e.id}`}
                  onClick={() => {
                    handleShowBackgroundOverlay(e.id);
                  }}
                  className="w-full"
                >
                  <SelectWorkspace
                    key={e.id + i}
                    workspace={e}
                    selectWorkspace={selectWorkspace}
                    className={cn("text-sm", {
                      "w-full border-[1.1px] border-primary hover:bg-primary/5 dark:hover:bg-primary/50 dark:bg-primary/20":
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
              <p className="text-gray-500 text-xs font-medium">
                {t("dashboard:shared-workspace")}
              </p>
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
            <div className="flex flex-col w-full mb-2">
              <p className="text-gray-500 text-xs font-medium">
                {t("dashboard:collaborating-workspace")}
              </p>
              {collaboratingWorkspaces.map((e, i) => (
                <Link
                  key={e.id + i}
                  href={`/dashboard/${e.id}`}
                  onClick={() => {
                    handleShowBackgroundOverlay(e.id);
                  }}
                  className="w-full"
                >
                  <SelectWorkspace
                    key={e.id + i}
                    workspace={e}
                    selectWorkspace={selectWorkspace}
                    className={cn("text-sm", {
                      "w-full border-[1.1px] border-primary hover:bg-primary/5 dark:hover:bg-primary/50 dark:bg-primary/20":
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
          <Link
            href={`/dashboard/${current_workspace.id}/new-workspace`}
            onClick={() => {
              handleCloseSidebarMobile();
              selectWorkspace();
            }}
          >
            <div className="w-full" dir={getDirByLang(lang)}>
              <div className="flex w-full font-medium gap-2 items-center p-2 cursor-pointer hover:bg-muted/70 rounded-md transition-all duration-150">
                <div className="rounded-full relative bottom-[1.5px] w-4 h-4 flex items-center justify-center bg-muted dark:bg-slate-800 text-slate-500">
                  +
                </div>
                <p className="text-xs">{t("dashboard:create-new-workspace")}</p>
              </div>
            </div>
          </Link>
        </>
      ) : null}
    </div>
  );
};

export default WorkspacesList;
