"use client";

import {
  changeInTrashStatusAction,
  deleteFolderFileAction,
} from "@/server-actions";
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
import { findFile, findFolder } from "@/lib/utils";
import { Context as SocketContext } from "@/contexts/socket-provider";
import { useContext } from "react";

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
  const { socket } = useContext(SocketContext);

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
      if (
        workspace &&
        workspace.type === "shared" &&
        socket &&
        socket.connected
      ) {
        socket.emit(
          "to_trash_file/folder",
          workspace.id,
          id,
          folderId,
          type,
          session?.user?.id,
          false,
          ""
        );
      }
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
          data: findFolder(workspace, id),
        };

        if (!currentItem.data) throw new Error();

        const payload = {
          type,
          id,
        };
        dispatch(removeFolder(payload));
        const { data, error } = await deleteFolderFileAction(payload);

        if (error) {
          console.log(error.message);
          toast.error(`Could not delete the ${type} permanently`);
          dispatch(addFolder({ data: currentItem.data }));

          return;
        }

        if (!data) throw new Error();
      } else if (type === "file") {
        if (!folderId) throw new Error("folder id required.");

        currentItem = {
          type,
          data: findFile(workspace, id, folderId),
        };

        const payload = {
          type,
          id,
          folderId,
        };

        dispatch(removeFile({ id, folderId }));

        const { data, error } = await deleteFolderFileAction(payload);

        if (error) {
          console.log(error.message);
          toast.error(`Could not delete the ${type} permanently`);
          dispatch(addfile({ data: currentItem.data, folderId }));

          return;
        }

        if (!data) throw new Error();
      }
      if (
        workspace &&
        workspace.type === "shared" &&
        socket &&
        socket.connected
      ) {
        socket.emit(
          "delete_file/folder",
          workspace.id,
          id,
          type,
          folderId,
          session?.user.id
        );
      }
    } catch (err) {
      console.log(err);
      toast.error(`Could not delete the ${type} permanently.`);
    }
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

      if (type === "folder") currentItem = findFolder(workspace, id);
      if (type === "file")
        currentItem = findFile(workspace, id, folderId as string);

      if (!currentItem) return;

      const payload: ChangeInTrashStatusTypes = {
        type,
        id,
        inTrashBy,
        inTrash: true,
        ...(type === "file" && folderId ? { folderId } : null),
      };

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
      if (
        workspace &&
        workspace.type === "shared" &&
        socket &&
        socket.connected
      ) {
        socket.emit(
          "to_trash_file/folder",
          workspace.id,
          id,
          folderId,
          type,
          session?.user?.id,
          true,
          session?.user.email
        );
      }
      return;
    } catch (err) {
      console.log(err);
      toast.error(`Could not delete the ${type}.`);
    }
  };

  return {
    deleteItemPermanently,
    restoreDeletedItem,
    deleteItem,
  };
};

export default useTrash;
