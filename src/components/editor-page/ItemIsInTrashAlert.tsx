import useTrash from "@/hooks/useTrash";
import { useAppSelector } from "@/store";
import { FolderType } from "@/types";
import { File } from "@prisma/client";
import { useSession } from "next-auth/react";
import { Button } from "../ui/Button";
import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

type ItemIsInTrashAlertProps = {
  type: "folder" | "file";
};

const ItemIsInTrashAlert: React.FC<ItemIsInTrashAlertProps> = ({ type }) => {
  const { current_workspace } = useAppSelector((store) => store.workspace);
  const params = useParams();
  const router = useRouter();
  const { restoreDeletedItem, deleteItemPermanently } = useTrash();
  const { data: session } = useSession();

  const data = useMemo(() => {
    let res:
      | {
          data: FolderType;
          type: "folder";
        }
      | {
          data: File;
          type: "file";
        }
      | null = null;

    if (type === "folder")
      res = {
        type: "folder",
        data: current_workspace?.folders.find(
          (e) => e.id === params.folderId
        ) as FolderType,
      };

    if (type === "file") {
      const folderIndex = current_workspace?.folders.findIndex(
        (e) => e.id === params.folderId
      );
      res = {
        type: "file",
        data: current_workspace?.folders[folderIndex!].files.find(
          (e) => e.id === params.fileId
        ) as File,
      };
    }
    return res;
  }, [type, params.folderId, params.fileId]);

  if (!data || data === undefined) return null;

  return (
    <div className="w-full p-4 bg-rose-200 dark:bg-rose-800/50">
      <div className="flex flex-col justify-center gap-2">
        <div className="flex w-full items-center justify-center gap-3">
          <p className="dark:text-gray-200 text-sm">This {type} is in trash</p>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                restoreDeletedItem({
                  id: data.data.id,
                  type,
                  ...(data.type === "file" && {
                    folderId: data.data.folderId,
                  }),
                });
              }}
              size={"sm"}
              variant={"secondary"}
            >
              Restore
            </Button>
            <Button
              onClick={() => {
                deleteItemPermanently({
                  id: data.data.id,
                  type,
                  ...(data.type === "file" && {
                    folderId: data.data.folderId,
                  }),
                });
                if (data.type === "folder") {
                  router.push(`/dashboard/${data.data.workspaceId}`);
                }
                if (data.type === "file") {
                  router.push(
                    `/dashboard/${data.data.workspaceId}/${data.data.folderId}`
                  );
                }
              }}
              size={"sm"}
              variant={"destructive"}
            >
              Delete
            </Button>
          </div>
        </div>
        {current_workspace?.type === "shared" ? (
          <>
            <div className="w-full text-center">
              <p className="text-gray-200 text-sm">
                deleted by "
                {session?.user.email === data.data.inTrashBy
                  ? "You"
                  : data.data.inTrashBy}
                "
              </p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default ItemIsInTrashAlert;
