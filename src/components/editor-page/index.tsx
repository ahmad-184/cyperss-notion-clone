"use client";

import { getFilebyId, getFolderbyId, getWorkspaceById } from "@/server-actions";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  replaceFile,
  replaceFolder,
  replaceWorkspace,
} from "@/store/slices/workspace";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import EditorBreadCrumb from "./EditorBreadcrumb";
import ItemIsInTrashAlert from "./ItemIsInTrashAlert";
import { useParams, useRouter } from "next/navigation";

interface EditorPageProps {
  type: "workspace" | "folder" | "file";
  id: string;
  folderId?: string;
}

const EditorPage: React.FC<EditorPageProps> = ({ type, id, folderId }) => {
  const dispatch = useAppDispatch();
  const { current_workspace } = useAppSelector((store) => store.workspace);
  const router = useRouter();
  const params = useParams();

  const updateState = async () => {
    try {
      if (current_workspace?.type !== "shared") return;
      if (type === "workspace") {
        const { data: resData, error } = await getWorkspaceById(id);
        if (error || !resData) throw new Error();
        dispatch(replaceWorkspace(resData));
      }
      if (type === "folder") {
        const { data: resData, error } = await getFolderbyId(id);
        if (error || !resData) throw new Error();
        dispatch(replaceFolder(resData));
      }
      if (type === "file") {
        const { data: resData, error } = await getFilebyId(id);
        if (error || !resData) throw new Error();
        dispatch(replaceFile(resData));
      }
    } catch (err: any) {
      toast.error("Something went wrong, please try again");
      window.location.href = "/dashboard";
    }
  };

  useEffect(() => {
    updateState();
  }, [type, id, folderId]);

  const data = useMemo(() => {
    let res;

    if (type === "workspace") res = current_workspace;
    if (type === "folder") {
      res = current_workspace?.folders.find((e) => e.id === id);
      if (!res) router.push(`/dashboard/${params.dashboardId}`);
    }
    if (type === "file" && folderId) {
      const folderIndex = current_workspace?.folders.findIndex(
        (e) => e.id === folderId
      );
      res = current_workspace?.folders[folderIndex!].files.find(
        (e) => e.id === id
      );
      if (!res)
        router.push(`/dashboard/${params.dashboardId}/${params.folderId}`);
    }
    return res;
  }, [current_workspace, type, id, folderId]);

  return (
    <div className="w-full">
      {data?.inTrash ? (
        <ItemIsInTrashAlert type={type === "folder" ? "folder" : "file"} />
      ) : null}
      <div className="py-6 px-6 w-full">
        <div className="w-full max-w-3xl flex flex-col gap-2">
          <EditorBreadCrumb type={type} />
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
