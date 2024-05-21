"use client";

import {
  changeIconAction,
  changeItemTitleAction,
  getFilebyId,
  getFolderbyId,
  getWorkspaceById,
  updateFile,
  updateFolder,
  updateWorkspace,
} from "@/server-actions";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  changeBanner,
  changeEmoji,
  changeItemTitle,
  replaceFile,
  replaceFolder,
  replaceWorkspace,
} from "@/store/slices/workspace";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import EditorBreadCrumb from "./EditorBreadcrumb";
import ItemIsInTrashAlert from "./ItemIsInTrashAlert";
import { useParams } from "next/navigation";
import Banner from "./Banner";
import Container from "./Container";
import QuillEditor from "./QuillEditor";
import { File } from "@prisma/client";
import { FolderType, WorkspaceTypes } from "@/types";
import { Input } from "../ui/Input";
import _debounce from "lodash.debounce";
import { Trash } from "lucide-react";
import Loader from "../Loader";
import { cn } from "@/lib/utils";
import useUploadV2 from "@/hooks/useUploadV2";
import Collaborators from "./Collaborators";
import { Badge } from "../ui/Badge";
import { removeFileUpload } from "@/lib/removeFileUpload";
import EmojiPickerMart from "../EmojiPickerMart";

interface EditorPageProps {
  type: "workspace" | "folder" | "file";
  id: string;
  folderId?: string;
}

const EditorPage: React.FC<EditorPageProps> = ({ type, id, folderId }) => {
  const dispatch = useAppDispatch();
  const { current_workspace } = useAppSelector((store) => store.workspace);
  const params = useParams();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);

  const { progress, isUploading, startUpload, files } = useUploadV2({
    ref: inputRef,
    max_size: 3,
  });

  const [isLoading, setIsloading] = useState(false);

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
    if (!id || !type) return null;
    let res;
    if (type === "workspace") {
      res = current_workspace as WorkspaceTypes;
    }
    if (type === "folder") {
      res = current_workspace?.folders.find((e) => e.id === id) as FolderType;
    }
    if (type === "file" && folderId) {
      const folderIndex = current_workspace?.folders.findIndex(
        (e) => e.id === folderId
      );
      res = current_workspace?.folders[folderIndex!].files.find(
        (e) => e.id === id
      ) as File;
    }
    return res;
  }, [current_workspace, type, id, folderId, params]);

  useEffect(() => {
    if (data?.id) {
      document.title = `${data?.iconId} ${data?.title || "Untitled"}`;
    }
  }, [data?.title, data?.iconId]);

  const handleChangeEmoji = async (value: string) => {
    try {
      if (!current_workspace || !data) return;
      const currentIcon = data.iconId as string;
      const newIcon = value;
      const payload = {
        emoji: newIcon,
        type,
        id: data.id,
        ...(type === "file" && { folderId: folderId }),
      };
      dispatch(changeEmoji(payload));
      const { error, data: resData } = await changeIconAction({
        type: type,
        emoji: newIcon,
        id: data.id,
      });
      if (error || !resData) {
        payload["emoji"] = currentIcon;
        dispatch(changeEmoji(payload));
        toast.error(error?.message || "Could not update the icon");
        return;
      }
      if (resData) return;
    } catch (err) {
      console.log(err);
      toast.error(`Could not change the ${type} icon, please try again`);
    }
  };

  const updateTitle = useCallback(
    _debounce(async (t) => {
      try {
        if (!data) return;
        const { data: resData, error } = await changeItemTitleAction({
          type,
          id: data.id,
          title: t,
        });
        if (error) throw new Error();
        if (resData) return;
      } catch (err) {
        console.log(err);
        toast.error(`Could not change the ${type} name, please try again`);
      }
    }, 1000),
    [data?.id, type]
  );

  const handleChangeTitle = (e: any) => {
    if (!data) return;
    dispatch(
      changeItemTitle({
        type,
        title: e.target.value,
        id: data.id,
        ...(type === "file" && {
          folderId: folderId,
        }),
      })
    );
    updateTitle(e.target.value);
  };

  const handleOpenInput = async () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleUploadBanner = useCallback(async () => {
    try {
      if (!data?.id) return;
      if (!files.length) return;
      setIsloading(true);
      const uploadedFile = await startUpload();
      if (!uploadedFile?.length) return;
      const fileUrl = uploadedFile[0].file.secure_url;
      const file_public_id = uploadedFile[0].file.public_id;
      console.log(uploadedFile);
      if (!fileUrl) throw new Error();
      if (type === "workspace") {
        const res = await updateWorkspace({
          workspaceId: data.id,
          data: {
            bannerUrl: fileUrl,
            banner_public_id: file_public_id,
          },
        });
        if (res.error || !res.data) throw new Error();
        dispatch(replaceWorkspace(res.data));
      } else if (type === "folder") {
        const res = await updateFolder({
          folderId: data.id,
          data: {
            bannerUrl: fileUrl,
            banner_public_id: file_public_id,
          },
        });
        if (res.error || !res.data) throw new Error();
        dispatch(replaceFolder(res.data));
      } else if (type === "file") {
        const res = await updateFile({
          fileId: data.id,
          data: {
            bannerUrl: fileUrl,
            banner_public_id: file_public_id,
          },
        });
        if (res.error || !res.data) throw new Error();
        dispatch(replaceFile(res.data));
      }
    } catch (err: any) {
      console.log(err);
      toast.error("Somethin went wrong, please try again");
    } finally {
      setIsloading(false);
    }
  }, [type, data, files]);

  useEffect(() => {
    handleUploadBanner();
  }, [files]);

  const handleRemoveBanner = async () => {
    try {
      if (!data?.id) return;
      if (!data.bannerUrl) return;
      if (!data.banner_public_id) return;

      const currentData = data;

      await removeFileUpload({
        file_public_id: data.banner_public_id,
      });

      if (type === "workspace") {
        dispatch(
          changeBanner({
            bannerUrl: "",
            banner_public_id: "",
            id: data.id,
            type,
          })
        );
        const res = await updateWorkspace({
          workspaceId: data.id,
          data: {
            bannerUrl: "",
            banner_public_id: "",
          },
        });
        if (res.error || !res.data) {
          dispatch(
            changeBanner({
              bannerUrl: currentData.bannerUrl || "",
              banner_public_id: currentData.bannerUrl || "",
              id: data.id,
              type,
            })
          );
          throw new Error();
        }
        dispatch(replaceWorkspace(res.data));
      } else if (type === "folder") {
        dispatch(
          changeBanner({
            bannerUrl: "",
            banner_public_id: "",
            id: data.id,
            type,
          })
        );
        const res = await updateFolder({
          folderId: data.id,
          data: {
            bannerUrl: "",
            banner_public_id: "",
          },
        });
        if (res.error || !res.data) {
          dispatch(
            changeBanner({
              bannerUrl: currentData.bannerUrl || "",
              banner_public_id: currentData.bannerUrl || "",
              id: data.id,
              type,
            })
          );
          throw new Error();
        }
        dispatch(replaceFolder(res.data));
      } else if (type === "file") {
        dispatch(
          changeBanner({
            bannerUrl: "",
            banner_public_id: "",
            id: data.id,
            type,
            folderId: folderId,
          })
        );
        const res = await updateFile({
          fileId: data.id,
          data: {
            bannerUrl: "",
            banner_public_id: "",
          },
        });
        if (res.error || !res.data) {
          dispatch(
            changeBanner({
              bannerUrl: currentData.bannerUrl || "",
              banner_public_id: currentData.bannerUrl || "",
              id: data.id,
              type,
              folderId: folderId,
            })
          );
          throw new Error();
        }
        dispatch(replaceFile(res.data));
      }
    } catch (err: any) {
      console.log(err);
      toast.error("Somethin went wrong, please try again");
    }
  };

  if (!current_workspace || !data) return null;

  return (
    <div className="w-full">
      {data?.inTrash ? (
        <ItemIsInTrashAlert type={type === "folder" ? "folder" : "file"} />
      ) : null}
      <div className="py-3 mt-1 px-3 flex flex-wrap gap-3 items-center w-full justify-between sm:px-6">
        <EditorBreadCrumb type={type} />
        <div className="flex items-center gap-3 px-3 sm:px-0">
          <Collaborators />
          <Badge
            variant={"secondary"}
            className={cn("select-none", {
              "dark:bg-green-700 bg-green-300": !saving,
              "dark:bg-orange-700 bg-orange-300": saving,
            })}
          >
            {saving ? "Saving..." : "Saved"}
          </Badge>
        </div>
      </div>
      <div className="w-full mb-4">
        <Banner src={data?.bannerUrl || null} alt={`${data?.title} banner`} />
      </div>
      <Container className="py-6 flex flex-col w-full gap-3 justify-center items-center">
        <div className="flex w-full flex-col gap-3">
          <div className="w-full flex flex-col">
            <div className="flex w-full flex-col mb-2">
              <EmojiPickerMart
                emoji={data?.iconId || ""}
                classNames="text-[70px] pl-[2px] w-fit"
                onChangeEmoji={handleChangeEmoji}
              />
              <input ref={inputRef} hidden type="file" accept="image/*" />
              <div className="ml-3 flex gap-2">
                {data && !data?.bannerUrl ? (
                  <div
                    onClick={handleOpenInput}
                    className="w-fit flex cursor-pointer 
                  gap-2 dark:hover:bg-muted/100 hover:bg-muted-foreground/20 transition-all 
                  duration-150 dark:text-gray-400 text-xs 
                  bg-muted-foreground/10 
                  dark:bg-muted/70 rounded-lg px-2 py-[3px]"
                  >
                    Add Banner
                  </div>
                ) : null}
                {data && data?.bannerUrl ? (
                  <>
                    <div
                      onClick={handleOpenInput}
                      className="w-fit flex cursor-pointer
                  gap-2 dark:hover:bg-muted/100 hover:bg-muted-foreground/20 transition-all 
                  duration-150 dark:text-gray-400 text-xs 
                  bg-muted-foreground/10
                  dark:bg-muted/70 rounded-lg px-2 py-[3px]"
                    >
                      Change Banner
                    </div>
                    <div
                      onClick={handleRemoveBanner}
                      className="w-fit flex cursor-pointer 
                  gap-1 dark:hover:bg-muted/100 hover:bg-muted-foreground/20 transition-all 
                  duration-150 dark:text-gray-400 text-xs 
                  bg-muted-foreground/10 items-center 
                  dark:bg-muted/70 rounded-lg px-2 py-[3px]"
                    >
                      <div>
                        <Trash className="w-3 h-3" />
                      </div>
                    </div>
                  </>
                ) : null}
                <div
                  className={cn("hidden", {
                    block: isUploading || isLoading,
                  })}
                >
                  <Loader className="w-5 h-5" />
                </div>
              </div>
            </div>
            <Input
              value={data?.title || ""}
              placeholder="Untitled"
              className="text-3xl font-bold dark:text-gray-400 pl-[0.87rem]
                border-none bg-transparent hover:bg-transparent
                outline-none hover:outline-none hover:border-none focus-visible:border-none
                focus-within:border-none focus:border-none focus-visible:outline-none
                focus-within:outline-none focus:outline-none focus-visible:ring-0 
                peer-focus-within:outline-red-400 rounded-none border-transparent
              "
              onChange={handleChangeTitle}
            />
          </div>
        </div>
        <QuillEditor data={data} />
      </Container>
    </div>
  );
};

export default EditorPage;
