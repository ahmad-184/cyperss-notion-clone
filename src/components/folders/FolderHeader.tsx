"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import { Plus } from "lucide-react";
import CustomTooltip from "../custom/CustomTooltip";
import { FolderType, User } from "@/types";
import { v4 as uuid4 } from "uuid";
import { addFolder, removeFolder } from "@/store/slices/workspace";
import { Subscription } from "@prisma/client";
import { toast } from "sonner";
import { createFolder } from "@/server-actions";
import { Skeleton } from "../ui/Skeleton";
import { cn } from "@/lib/utils";

interface FoldersHeaderProps {
  user: User;
  subscription: Subscription | null;
}

const FoldersHeader: React.FC<FoldersHeaderProps> = ({
  user,
  subscription,
}) => {
  const dispatch = useAppDispatch();
  const workspace = useAppSelector(
    (store) => store.workspace.current_workspace
  );
  const loading = useAppSelector((store) => store.workspace.loading);

  const createFolderHandler = async () => {
    if (
      subscription?.status !== "active" &&
      workspace &&
      workspace.folders.length >= 3
    ) {
      toast.warning("Reached to limit folder number");
      return;
    } else {
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
        const { error } = await createFolder({
          folder: payload,
          userId: user.id,
        });
        if (error) {
          console.log(error.message);
          // console.log("there is an error");
          toast.error(`Could not create the folder`);
          dispatch(
            removeFolder({
              id: payload.id,
            })
          );
        }
      } catch (err: any) {
        console.log(err);
      }
    }
  };

  return (
    <div
      className="pt-1 flex w-full sticky top-0 z-20 bg-background
      group/title justify-between items-center pr-4
    "
    >
      <div className="flex text-muted-foreground justify-between items-center w-full">
        {!loading ? (
          <>
            <p className="text-sm font-medium">FOLDERS</p>
            <CustomTooltip description="Create New Folder">
              <Plus
                onClick={createFolderHandler}
                className={cn(
                  "w-4 h-4 group-hover/title:visible dark:text-gray-600 transition-all duration-150 group-hover/title:opacity-100 opacity-0 cursor-pointer dark:hover:text-gray-400",
                  {
                    invisible: workspace?.folders.length,
                    "visible animate-bounce duration-10000 dark:text-gray-500 opacity-100":
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

export default FoldersHeader;
