"use client";

import { useAppSelector } from "@/store";
import CypressTrashIcon from "../icons/TrashIcon";
import { FolderType, WorkspaceTypes } from "@/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { File } from "@prisma/client";
import { ScrollArea } from "../ui/ScrollArea";
import { Trash, Trash2Icon, Undo2 } from "lucide-react";
import useTrash from "@/hooks/useTrash";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/Dialog";
import { useLocal } from "@/contexts/local-context";
import CustomDialog from "../custom/CustomDialog";
import { Button } from "../ui/Button";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { getDirByLang } from "@/lib/dir";
import { useLanguage } from "@/contexts/language-context";
import { Input } from "../ui/Input";

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
  const { mobileSidebarOpen, mobile_sidebar_open } = useLocal();
  const { t } = useTranslation();

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

  const href =
    type === "folder"
      ? `/dashboard/${data.workspaceId}/${data.id}`
      : `/dashboard/${data.workspaceId}/${data.folderId}/${data.id}`;

  return (
    <div
      className="w-full dark:bg-transparent border-b px-2 py-2 rounded-sm flex justify-between gap-3
      dark:hover:bg-gray-500/20 hover:bg-gray-500/10
    "
    >
      <Link
        className="dark:text-gray-400 truncate flex-grow text-gray-700 cursor-pointer text-sm font-medium"
        onClick={() => {
          handleOpenDialog(false);
          if (mobile_sidebar_open) mobileSidebarOpen(false);
        }}
        href={href}
      >
        {data?.title || t("dashboard:untitled")}
      </Link>
      <div className="flex gap-4 dark:text-gray-400 text-gray-600">
        <Undo2
          onClick={handleRestore}
          className="w-4 h-4 cursor-pointer dark:hover:text-gray-300 hover:text-gray-800"
        />
        <CustomDialog
          header={t("dashboard:are-you-sure")}
          description={
            type === "file"
              ? t("dashboard:file-delete-forever")
              : t("dashboard:folder-delete-forever")
          }
          content={
            <div className="flex gap-3 w-full justify-end">
              <Button
                onClick={handleDelete}
                className="capitalize"
                variant="destructive"
              >
                {t("dashboard:delete")}
              </Button>
            </div>
          }
        >
          <Trash2Icon className="w-4 h-4 cursor-pointer  dark:hover:text-gray-300 hover:text-gray-800" />
        </CustomDialog>
      </div>
    </div>
  );
};

const TrashBin = () => {
  const current_workspace = useAppSelector(
    (store) => store.workspace.current_workspace
  );
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [data, setData] = useState<ReturnType<typeof getInTrashFilesFolders>>({
    folders: [],
    files: [],
  });
  const [filteredData, setFilteredData] = useState<
    ReturnType<typeof getInTrashFilesFolders>
  >({
    folders: [],
    files: [],
  });

  const { t } = useTranslation();
  const { lang } = useLanguage();

  useEffect(() => {
    if (!current_workspace) return;
    const getData = getInTrashFilesFolders(current_workspace!);
    setData(getData);
    setFilteredData(getData);
  }, [current_workspace]);

  const handleChangeSearch = (e: any) => {
    const s = e.target.value.toLowerCase() as string;
    if (timer.current) clearTimeout(timer.current);
    if (!s) return setFilteredData(data);
    else {
      timer.current = setTimeout(() => {
        console.log(s);
        const filteredFolders = data.folders.filter((e) => {
          if (!e.title && t("dashboard:untitled").startsWith(s)) return true;
          if (e.title.toLowerCase().startsWith(s)) return true;
        });
        const filteredFiles = data.files.filter((e) => {
          if (!e.title && t("dashboard:untitled").startsWith(s)) return true;
          if (e.title.toLowerCase().startsWith(s)) return true;
        });
        setFilteredData({
          folders: filteredFolders,
          files: filteredFiles,
        });
      }, 600);
    }
  };

  const handleOpenDialog = (e: boolean) => {
    setOpenDialog((prev) => e || !prev);
  };

  return (
    <div>
      <Dialog
        open={openDialog}
        defaultOpen={false}
        onOpenChange={handleOpenDialog}
      >
        <DialogTrigger asChild>
          <div className="flex group/native w-full cursor-pointer transition-all py-1 gap-2 items-center dark:text-gray-400">
            <CypressTrashIcon />
            <p className="text-sm font-medium">{t("dashboard:trash")}</p>
          </div>
        </DialogTrigger>
        <DialogContent className="overflow-auto max-h-[95vh]">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-200">
              {t("dashboard:trash-bin")}
            </DialogTitle>
            <DialogDescription>
              {t("dashboard:trash-bin-desc")}
            </DialogDescription>
          </DialogHeader>
          <div>
            <div className="rounded-se-md z-20 backdrop-blur-[10px]">
              <Input
                placeholder={`${t("dashboard:search")}...`}
                onChange={handleChangeSearch}
                className="w-full bg-transparent rounded-lg rounded-ee-none rounded-es-none outline-none ring-0 focus-visible:ring-offset-0 focus-visible:ring-0"
              />
            </div>
            <div className="border border-t-0 max-w-full relative h-[300px] dark:bg-black/40 bg-slate-400/5 rounded-lg rounded-ss-none rounded-se-none overflow-auto">
              {/* <ScrollArea className="h-[300px] dark:bg-black/70 bg-slate-400/10 rounded-lg"> */}
              <div
                dir={getDirByLang(lang)}
                className="flex flex-col w-full gap-3 h-full p-3 px-4"
              >
                {filteredData.folders.length ? (
                  <div className="flex flex-col gap-1">
                    <span className="dark:text-gray-600 capitalize text-muted-foreground font-medium text-xs">
                      {t("dashboard:folders")}
                    </span>
                    <div className="px-0 flex flex-col">
                      {filteredData.folders.map((e, i) => (
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
                {filteredData.files.length ? (
                  <div className="flex flex-col gap-1 pb-3">
                    <span className="dark:text-gray-600 capitalize  text-muted-foreground font-medium text-xs">
                      {t("dashboard:files")}
                    </span>
                    <div className="px-0 flex flex-col">
                      {filteredData.files.map((e, i) => (
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
            </div>
          </div>
          {/* </ScrollArea> */}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrashBin;
