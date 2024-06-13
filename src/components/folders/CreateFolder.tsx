"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import { Plus } from "lucide-react";
import CustomTooltip from "../custom/CustomTooltip";
import { FolderType, User } from "@/types";
import { v4 as uuid4 } from "uuid";
import { addFolder, removeFolder } from "@/store/slices/workspace";
import { Subscription } from "@prisma/client";
import { toast } from "sonner";
import { createFolderAction } from "@/server-actions";
import { Skeleton } from "../ui/Skeleton";
import { cn } from "@/lib/utils";
import { Context as SocketContext } from "@/contexts/socket-provider";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

interface CreateFolderProps {
  user: User;
  subscription: Subscription | null;
}

const CreateFolder: React.FC<CreateFolderProps> = ({ user, subscription }) => {
  const dispatch = useAppDispatch();
  const workspace = useAppSelector(
    (store) => store.workspace.current_workspace
  );
  const loading = useAppSelector((store) => store.workspace.loading);
  const { t } = useTranslation();

  const { socket } = useContext(SocketContext);

  const createFolderHandler = async () => {
    // if (
    //   subscription?.status !== "active" &&
    //   workspace &&
    //   workspace.folders.length >= 3
    // ) {
    //   toast.warning("Reached to limit folder number");
    //   return;
    // } else {
    try {
      if (!workspace) return;
      if (!user?.id) return;

      const payload: Omit<FolderType, "files"> = {
        id: uuid4(),
        bannerUrl: "",
        data: null,
        iconId: "📁",
        inTrash: false,
        inTrashBy: "",
        title: "",
        banner_public_id: "",
        workspaceId: workspace?.id,
        workspaceOwnerId: user.id,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      };
      await dispatch(
        addFolder({
          data: { ...payload, files: [] },
        })
      );
      const { error, data } = await createFolderAction({
        folder: payload,
        userId: user.id,
      });
      if (error) {
        console.log(error.message);
        toast.error(t("dashboard:could-not-create-folder"));
        dispatch(
          removeFolder({
            id: payload.id,
          })
        );
      }
      if (socket && socket.connected && data && workspace.type === "shared") {
        socket?.emit(
          "add_folder",
          workspace?.id,
          { ...data, files: [] },
          user.id
        );
      }
    } catch (err: any) {
      console.log(err);
    }
    // }
  };

  return (
    <div
      className="pt-1 flex w-full sticky top-0 z-20 bg-background
      group/title justify-between items-center
    "
    >
      <div className="flex text-muted-foreground justify-between items-center w-full">
        {!loading ? (
          <>
            <p className="text-xs font-medium uppercase">
              {t("dashboard:folders")}
            </p>
            <CustomTooltip side="left" description="Create New Folder">
              <Plus
                onClick={createFolderHandler}
                className={cn(
                  "w-4 h-4 md:group-hover/title:visible visible dark:text-gray-500 opacity-100 transition-all duration-150 md:group-hover/title:opacity-100 md:invisible md:opacity-0 cursor-pointer dark:hover:text-gray-400",
                  {
                    "md:invisible": workspace?.folders.length,
                    "md:visible animate-bounce duration-10000 dark:text-gray-500 md:opacity-100":
                      !workspace?.folders.length,
                  }
                )}
              />
            </CustomTooltip>
          </>
        ) : (
          <Skeleton className="h-3 w-11" />
        )}
      </div>
    </div>
  );
};

export default CreateFolder;
