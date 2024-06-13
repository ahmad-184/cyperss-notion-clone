"use client";

import { OctagonAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/Alert";
import { Button } from "../ui/Button";
import CustomDialog from "../custom/CustomDialog";
import { useAppSelector } from "@/store";
import { Input } from "../ui/Input";
import { useContext, useRef, useState } from "react";
import { toast } from "sonner";
import ButtonWithLoaderAndProgress from "../ButtonWithLoaderAndProgress";
import { deleteWorkspaceAction } from "@/server-actions";
import { Skeleton } from "../ui/Skeleton";
import { Context as SocketContext } from "@/contexts/socket-provider";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface DeleteWorkspaceProps {}

const DeleteWorkspace: React.FC<DeleteWorkspaceProps> = () => {
  const { current_workspace, loading: loadingGlob } = useAppSelector(
    (store) => store.workspace
  );
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { t } = useTranslation();

  const { socket } = useContext(SocketContext);

  const handleDelete = async () => {
    try {
      if (!current_workspace) return;
      if (!inputRef.current) return;
      const input = inputRef.current.value;
      if (input !== current_workspace.title) return setError(true);
      setLoading(true);
      setError(false);

      const { status, error } = await deleteWorkspaceAction({
        workspaceId: current_workspace.id,
      });

      if (error || status === "error") {
        console.log(error);
        toast.error(t("dashboard:could-not-delete-workspace"));
        window.location.replace("/dashboard");
      }

      if (status === "ok") {
        window.localStorage.removeItem("active_workspace");
        toast.error(t("dashboard:workspace-deleted"));
        if (current_workspace.type === "shared" && socket && socket.connected) {
          socket.emit(
            "delete_workspace",
            current_workspace.id,
            current_workspace.workspaceOwnerId
          );
        }
        window.location.replace("/dashboard");
      } else {
        toast.error(t("dashboard:could-not-delete-workspace"));
        window.location.replace("/dashboard");
      }
    } catch (err: any) {
      toast.error(t("dashboard:could-not-delete-workspace"));
    } finally {
      setLoading(false);
    }
  };

  if (loadingGlob || !current_workspace)
    return (
      <div className="w-full h-[200px] rounded-md">
        <Skeleton className="w-full h-full p-4 py-6" />
      </div>
    );

  return (
    <div className="flex flex-col gap-3">
      <p className="dark:text-gray-300 font-medium text-lg">
        {t("dashboard:delete-workspace")}
      </p>
      <div className="w-full p-5 py-6 rounded-md z-[1] bg-white dark:bg-black/15 border">
        <Alert
          variant={"destructive"}
          className="bg-rose-700/10 text-rose-500 border-rose-600"
        >
          <OctagonAlert className="w-4 h-4 text-rose-500 dark:text-rose-500" />
          <AlertTitle
            style={{ letterSpacing: 0.2 }}
            className="text-gray-700 dark:text-gray-200 font-normal"
          >
            {t("dashboard:warning")}
          </AlertTitle>
          <AlertDescription className="text-xs">
            {t("dashboard:delete-workspace-warning-desc")}
          </AlertDescription>
          <div className="w-full mt-3">
            <CustomDialog
              header={t("dashboard:confirm-deletion-of-workspace")}
              description={t("dashboard:delete-workspace-warning-desc")}
              content={
                <>
                  <div className="flex w-full flex-col gap-4">
                    <div className="dark:text-gray-600 flex gap-1 text-sm text-gray-500">
                      {t("dashboard:type")}{" "}
                      <p className="dark:text-gray-400 text-gray-800 font-semibold">
                        {current_workspace.title}
                      </p>{" "}
                      {t("dashboard:to-confirm")}
                    </div>
                    <div className="w-full flex gap-1 flex-col">
                      <Input
                        ref={inputRef}
                        autoFocus
                        placeholder={t("dashboard:type-workspace-name-here")}
                        className={cn({
                          "border-rose-600": error,
                        })}
                      />
                    </div>
                    <ButtonWithLoaderAndProgress
                      loading={loading}
                      variant={"destructive"}
                      disabled={loading}
                      className="text-rose-500 border border-rose-600 bg-rose-600/10 dark:bg-rose-600/10
                      hover:bg-rose-600/40
                    "
                      onClick={handleDelete}
                    >
                      {t("dashboard:i-understand-delete-workspace")}
                    </ButtonWithLoaderAndProgress>
                  </div>
                </>
              }
            >
              <Button
                className="text-xs bg-transparent dark:bg-transparent text-rose-500 border border-rose-500 hover:bg-rose-300"
                variant={"destructive"}
                size={"sm"}
              >
                {t("dashboard:delete-workspace")}
              </Button>
            </CustomDialog>
          </div>
        </Alert>
      </div>
    </div>
  );
};

export default DeleteWorkspace;
