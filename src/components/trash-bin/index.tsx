"use client";

import { useAppSelector } from "@/store";
import CypressTrashIcon from "../icons/TrashIcon";
import { FolderType, WorkspaceTypes } from "@/types";
import { useMemo, useState } from "react";
import { File } from "@prisma/client";
import { ScrollArea } from "../ui/ScrollArea";
import { Trash, Undo2 } from "lucide-react";
import useTrash from "@/hooks/useTrash";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/Dialog";

const getInTrashFilesFolders = (workspace: WorkspaceTypes) => {
  if (!workspace)
    return {
      folders: [],
      files: [],
    };

  const inTrashfolders: FolderType[] = workspace.folders?.filter(
    (e) => e.inTrash === true
  );
  const inTrashFiles: File[] = [];

  const folders = workspace.folders?.filter((e) => e.inTrash === false);

  if (folders.length)
    for (const f of folders) {
      for (const file of f.files) {
        if (file.inTrash === true) inTrashFiles.push(file);
      }
    }

  return {
    folders: inTrashfolders || [],
    files: inTrashFiles || [],
  };
};

type TrashItemProps =
  | {
      data: FolderType;
      type: "folder";
      handleOpenDialog: (e: boolean) => void;
    }
  | {
      data: File;
      type: "file";
      handleOpenDialog: (e: boolean) => void;
    };

const TrashItem = ({ data, type, handleOpenDialog }: TrashItemProps) => {
  const { restoreDeletedItem, deleteItemPermanently } = useTrash();
  const router = useRouter();

  const handleDelete = () => {
    const payload = {
      type,
      id: data.id,
      ...(type === "file" && { folderId: data.folderId }),
    };
    deleteItemPermanently(payload);
  };

  const handleRestore = () => {
    const payload = {
      type,
      id: data.id,
      ...(type === "file" && { folderId: data.folderId }),
    };
    restoreDeletedItem(payload);
  };

  return (
    <div className="w-full dark:bg-transparent border-b px-2 py-2 rounded-md flex justify-between gap-3">
      <p
        className="dark:text-gray-400 text-gray-700 cursor-pointer"
        onClick={() => {
          if (type === "folder") {
            router.push(`/dashboard/${data.workspaceId}/${data.id}`);
          }
          if (type === "file") {
            router.push(
              `/dashboard/${data.workspaceId}/${data.folderId}/${data.id}`
            );
          }
          handleOpenDialog(false);
        }}
      >
        {data?.title || "Untitled"}
      </p>
      <div className="flex gap-4 dark:text-gray-400 text-gray-600">
        <Undo2
          onClick={handleRestore}
          className="w-5 h-5 cursor-pointer dark:hover:text-gray-300 hover:text-gray-800"
        />
        <Trash
          onClick={handleDelete}
          className="w-5 h-5 cursor-pointer  dark:hover:text-gray-300 hover:text-gray-800"
        />
      </div>
    </div>
  );
};

const TrashBin = () => {
  const current_workspace = useAppSelector(
    (store) => store.workspace.current_workspace
  );
  const [openDialog, setOpenDialog] = useState(false);

  const data = useMemo(
    () => getInTrashFilesFolders(current_workspace!),
    [current_workspace]
  );

  const handleOpenDialog = (e: boolean) => {
    setOpenDialog((prev) => e || !prev);
  };

  return (
    <>
      <Dialog open={openDialog} onOpenChange={handleOpenDialog}>
        <DialogTrigger asChild>
          <div className="flex group/native w-full cursor-pointer transition-all py-1 gap-2 items-center dark:text-gray-400">
            <CypressTrashIcon />
            <p className="text-sm">Trash</p>
          </div>
        </DialogTrigger>
        <DialogContent className="overflow-auto max-h-[95vh]">
          <DialogHeader>
            <DialogTitle>Trash bin</DialogTitle>
            <DialogDescription>
              here you can restore or delete permanently your folders and files
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[300px] dark:bg-black/70 bg-slate-400/10 rounded-lg">
            <div className="flex flex-col w-full gap-3 h-full p-3 px-4">
              {data.folders.length ? (
                <div className="flex flex-col gap-1">
                  <span className="dark:text-gray-600 text-gray-400 font-medium text-sm">
                    Folders
                  </span>
                  <div className="px-0 flex flex-col gap-2">
                    {data.folders.map((e, i) => (
                      <TrashItem
                        key={i + e.id}
                        data={e}
                        type="folder"
                        handleOpenDialog={handleOpenDialog}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
              {data.files.length ? (
                <div className="flex flex-col gap-1">
                  <span className="dark:text-gray-600 text-gray-400 font-medium text-sm">
                    Files
                  </span>
                  <div className="px-0 flex flex-col gap-2">
                    {data.files.map((e, i) => (
                      <TrashItem
                        key={i + e.id}
                        data={e}
                        type="file"
                        handleOpenDialog={handleOpenDialog}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TrashBin;
