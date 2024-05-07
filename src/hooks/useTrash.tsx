"use client";

import { changeInTrashStatusAction, deleteFolderFile } from "@/server-actions";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  addfile,
  addFolder,
  changeInTrashStatus,
  removeFile,
  removeFolder,
} from "@/store/slices/workspace";
import { ChangeInTrashStatusTypes, FolderType } from "@/types";
import { File } from "@prisma/client";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import ToTrashAlerts from "@/components/ToTrashAlerts";
import { TriangleAlert, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

type FuncsTypes = {
  type: TrashAlertsType["type"];
  id: string;
  folderId?: string;
};

type TrashAlertDataType = {
  id: string;
  type: "folder" | "file";
  name: string;
  inTrashBy: string;
};

export type TrashAlertsType = TrashAlertDataType & {
  restoreItemFunc: () => void;
  deletePermanentlyFunc: () => void;
};

const useTrash = () => {
  const dispatch = useAppDispatch();
  const workspace = useAppSelector(
    (store) => store.workspace.current_workspace
  );

  const { data: session } = useSession();

  const restoreDeletedItem = async ({ type, id, folderId }: FuncsTypes) => {
    try {
      if (!workspace) return;
      let currentItem;
      if (type === "folder")
        currentItem = workspace?.folders.find((f) => f.id === id);
      if (type === "file") {
        const folderIndex = workspace?.folders.findIndex(
          (f) => f.id === folderId
        );
        currentItem = workspace?.folders[folderIndex]?.files.find(
          (f) => f.id === id
        );
      }

      if (!currentItem) return;

      const payload: ChangeInTrashStatusTypes = {
        type,
        id,
        inTrashBy: "",
        inTrash: false,
        ...(type === "file" && folderId ? { folderId } : null),
      };

      dispatch(changeInTrashStatus(payload));

      const { data, error } = await changeInTrashStatusAction(payload);

      if (error) {
        payload["inTrashBy"] = currentItem.inTrashBy!;
        payload["inTrash"] = true;

        console.log(error.message);
        toast.error(`Could not restore the ${type}`);
        dispatch(changeInTrashStatus(payload));

        return;
      }

      if (!data) throw new Error();

      return;
    } catch (err) {
      console.log(err);
      toast.error(`Could restore the ${type}.`);
    }
  };

  const deleteItemPermanently = async ({ type, id, folderId }: FuncsTypes) => {
    try {
      if (!workspace) return;
      let currentItem:
        | {
            type: "folder";
            data: FolderType;
          }
        | {
            type: "file";
            data: File;
          };

      if (type === "folder") {
        currentItem = {
          type,
          data: workspace.folders.find((f) => f.id === id)!,
        };

        if (!currentItem.data) throw new Error();

        const payload = {
          type,
          id,
        };
        dispatch(removeFolder(payload));
        const { data, error } = await deleteFolderFile(payload);

        if (error) {
          console.log(error.message);
          toast.error(`Could not delete the ${type} permanently`);
          dispatch(addFolder({ data: currentItem.data }));

          return;
        }

        if (!data) throw new Error();
        return;
      } else if (type === "file") {
        if (!folderId) throw new Error("folder id required.");
        const folderIndex = workspace.folders.findIndex(
          (f) => f.id === folderId
        );

        currentItem = {
          type,
          data: workspace.folders[folderIndex].files.find((f) => f.id === id)!,
        };

        const payload = {
          type,
          id,
          folderId,
        };

        dispatch(removeFile({ id, folderId }));

        const { data, error } = await deleteFolderFile(payload);

        if (error) {
          console.log(error.message);
          toast.error(`Could not delete the ${type} permanently`);
          dispatch(addfile({ data: currentItem.data, folderId }));

          return;
        }

        if (!data) throw new Error();
        return;
      }
    } catch (err) {
      console.log(err);
      toast.error(`Could not delete the ${type} permanently.`);
    }
  };

  const createTrashAlertToast = (data: TrashAlertDataType) => {
    if (!workspace) return;

    const payload: TrashAlertsType = {
      ...data,
      restoreItemFunc: () => restoreDeletedItem(data),
      deletePermanentlyFunc: () => deleteItemPermanently(data),
    };

    const toastId = toast(
      `The "${payload.name}" ${payload.type} moved to trash`,
      {
        closeButton: true,
        duration: 7000,
        position: "top-center",
        classNames: { title: "dark:text-gray-300", icon: "dark:text-gray-300" },
        action: (
          <div className="flex items-center justify-end flex-grow">
            <Button
              onClick={() => {
                payload.restoreItemFunc();
                toast.dismiss(toastId);
              }}
              variant={"secondary"}
              size={"sm"}
              className="font-medium dark:text-gray-300"
            >
              Undo
            </Button>
          </div>
        ),
      }
    );
  };

  const deleteItem = async ({
    type,
    id,
    folderId,
    inTrashBy,
    name,
  }: FuncsTypes & { inTrashBy: string; name: string }) => {
    try {
      if (!workspace) throw new Error();

      let currentItem;

      if (type === "folder")
        currentItem = workspace?.folders.find((f) => f.id === id);
      if (type === "file") {
        const folderIndex = workspace?.folders.findIndex(
          (f) => f.id === folderId
        );
        currentItem = workspace?.folders[folderIndex].files.find(
          (f) => f.id === id
        );
      }

      if (!currentItem) return;

      const payload: ChangeInTrashStatusTypes = {
        type,
        id,
        inTrashBy,
        inTrash: true,
        ...(type === "file" && folderId ? { folderId } : null),
      };

      createTrashAlertToast({
        type,
        inTrashBy: payload.inTrashBy!,
        id: payload.id,
        name,
        ...(type === "file" && { folderId: payload.folderId }),
      });

      dispatch(changeInTrashStatus(payload));

      const { data, error } = await changeInTrashStatusAction(payload);

      if (error) {
        payload["inTrashBy"] = "";
        payload["inTrash"] = false;

        console.log(error.message);
        toast.error(`Could not delete the ${type}`);
        dispatch(changeInTrashStatus(payload));
        return;
      }

      if (!data) throw new Error();

      return;
    } catch (err) {
      console.log(err);
      toast.error(`Could not delete the ${type}.`);
    }
  };

  return {
    createTrashAlertToast,
    deleteItemPermanently,
    restoreDeletedItem,
    deleteItem,
  };
};

export default useTrash;
