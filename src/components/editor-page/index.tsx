"use client";

import {
  changeIconAction,
  changeItemTitleAction,
  getFilebyIdAction,
  getFolderByIdAction,
  getWorkspaceByIdAction,
  updateFileAction,
  updateFolderAction,
  updateWorkspaceAction,
} from "@/server-actions";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  changeBanner,
  changeEmoji,
  changeItemTitle,
  replaceFile,
  replaceFolder,
  updateWorkspace as updateWorkspaceStore,
  updateFolder as updateFolderStore,
} from "@/store/slices/workspace";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import EditorBreadCrumb from "./EditorBreadcrumb";
import ItemIsInTrashAlert from "./ItemIsInTrashAlert";
import Banner from "./Banner";
import Container from "./Container";
import QuillEditor from "./QuillEditor";
import { File } from "@prisma/client";
import _debounce from "lodash.debounce";
import { Menu, Trash } from "lucide-react";
import Loader from "../Loader";
import { cn, findFile, findFolder } from "@/lib/utils";
import useUploadV2 from "@/hooks/useUploadV2";
import Collaborators from "./Collaborators";
import { Badge } from "../ui/Badge";
import { removeFileUpload } from "@/lib/removeFileUpload";
import EmojiPickerMart from "../EmojiPickerMart";
import { FolderType, User, WorkspaceTypes } from "@/types";
import { Context as LocalContext } from "@/contexts/local-context";
import { useParams, useRouter } from "next/navigation";
import { Context as SocketContext } from "@/contexts/socket-provider";
interface EditorPageProps {
  type: "workspace" | "folder" | "file";
  id: string;
  folderId?: string;
  user: User;
}

const EditorPage: React.FC<EditorPageProps> = ({
  type,
  id,
  folderId,
  user,
}) => {
  const dispatch = useAppDispatch();
  const { current_workspace } = useAppSelector((store) => store.workspace);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const [onlineCollaborators, setOnlineCollaborators] = useState<User[] | []>(
    []
  );

  const { socket } = useContext(SocketContext);

  const params = useParams();

  const { mobileSidebarOpen } = useContext(LocalContext);

  const { progress, isUploading, startUpload, files } = useUploadV2({
    ref: inputRef,
    max_size: 3,
  });

  const [isLoading, setIsloading] = useState(false);

  const updateState = useCallback(async () => {
    try {
      if (current_workspace?.type !== "shared") return;
      if (type === "workspace") {
        const { data: resData, error } = await getWorkspaceByIdAction(id);
        if (error || !resData) throw new Error();
        const payload: WorkspaceTypes = {
          ...current_workspace,
          ...resData,
        };
        dispatch(updateWorkspaceStore(payload));
      }
      if (type === "folder") {
        const { data: resData, error } = await getFolderByIdAction(id);
        if (error || !resData) throw new Error();
        const folder = findFolder(current_workspace, id);
        if (!folder) return;
        const payload: FolderType = {
          ...folder,
          ...resData,
        };
        dispatch(updateFolderStore(payload));
      }
      if (type === "file") {
        const { data: resData, error } = await getFilebyIdAction(id);
        if (error || !resData) throw new Error();
        dispatch(replaceFile(resData));
      }
    } catch (err: any) {
      toast.error("Something went wrong, please try again");
      window.location.href = "/dashboard";
    }
  }, [current_workspace, id, type, params]);

  useEffect(() => {
    updateState();
  }, [type, id, folderId, params]);

  const data = useMemo(() => {
    if (!current_workspace) return;
    let res: File | FolderType | WorkspaceTypes | null | undefined = null;

    if (type === "workspace") res = current_workspace as WorkspaceTypes;
    if (type === "folder") {
      res = findFolder(current_workspace, id) as FolderType;
    }
    if (type === "file" && folderId) {
      const isFolderInTrash = findFolder(current_workspace, folderId);
      if (isFolderInTrash.inTrash)
        return router.push(`/dashboard/${current_workspace.id}`);
      res = findFile(current_workspace, id, folderId) as File;
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
      if (resData) {
        if (
          socket &&
          socket.connected &&
          data &&
          current_workspace?.type === "shared"
        ) {
          socket?.emit(
            "change_icon",
            current_workspace?.id,
            data.id,
            newIcon,
            type,
            //@ts-ignore
            data.folderId,
            user.id
          );
        }
      }
    } catch (err) {
      console.log(err);
      toast.error(`Could not change the ${type} icon, please try again`);
    }
  };

  const updateTitle = useCallback(
    _debounce(async (t) => {
      try {
        if (!current_workspace || !data) return;
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
    [id, type, data?.id]
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
    if (
      socket &&
      socket.connected &&
      data &&
      current_workspace?.type === "shared"
    ) {
      socket.emit(
        "change_title",
        current_workspace?.id,
        data.id,
        e.target.value,
        type,
        // @ts-ignore
        data.folderId,
        user.id
      );
    }
    updateTitle(e.target.value);
  };

  const handleOpenInput = async () => {
    if (isUploading || isLoading) return;
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleUploadBanner = useCallback(async () => {
    try {
      if (!data?.id) return;
      if (!files.length) return;
      if (!current_workspace) return;
      if (isUploading || isLoading) return;
      setIsloading(true);
      const uploadedFile = await startUpload();
      if (!uploadedFile?.length) return;
      const fileUrl = uploadedFile[0].file.secure_url;
      const file_public_id = uploadedFile[0].file.public_id;
      console.log(uploadedFile);
      if (!fileUrl) throw new Error();
      if (type === "workspace") {
        const res = await updateWorkspaceAction({
          workspaceId: data.id,
          data: {
            bannerUrl: fileUrl,
            banner_public_id: file_public_id,
          },
        });
        if (res.error || !res.data) throw new Error();
        dispatch(
          updateWorkspaceStore({
            ...current_workspace,
            ...res.data,
          })
        );
      } else if (type === "folder") {
        const res = await updateFolderAction({
          folderId: data.id,
          data: {
            bannerUrl: fileUrl,
            banner_public_id: file_public_id,
          },
        });
        if (res.error || !res.data) throw new Error();
        dispatch(
          updateFolderStore({
            ...findFolder(current_workspace, id),
            ...res.data,
          })
        );
      } else if (type === "file") {
        const res = await updateFileAction({
          fileId: data.id,
          data: {
            bannerUrl: fileUrl,
            banner_public_id: file_public_id,
          },
        });
        if (res.error || !res.data) throw new Error();
        dispatch(replaceFile(res.data));
      }
      if (
        socket &&
        socket.connected &&
        data &&
        current_workspace?.type === "shared"
      ) {
        socket?.emit(
          "change_banner",
          current_workspace?.id,
          data.id,
          fileUrl,
          type,
          //@ts-ignore
          data.folderId,
          file_public_id,
          user.id
        );
      }
    } catch (err: any) {
      console.log(err);
      toast.error("Somethin went wrong, please try again");
    } finally {
      setIsloading(false);
    }
  }, [type, data, files]);

  useEffect(() => {
    if (isUploading || isLoading) return;
    handleUploadBanner();
  }, [files]);

  const handleRemoveBanner = async () => {
    try {
      if (!data?.id) return;
      if (!data.bannerUrl) return;
      if (!data.banner_public_id) return;
      if (!current_workspace) return;
      if (isUploading || isLoading) return;

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
        const res = await updateWorkspaceAction({
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
        dispatch(
          updateWorkspaceStore({
            ...current_workspace,
            ...res.data,
          })
        );
      } else if (type === "folder") {
        dispatch(
          changeBanner({
            bannerUrl: "",
            banner_public_id: "",
            id: data.id,
            type,
          })
        );
        const res = await updateFolderAction({
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
        dispatch(
          replaceFolder({
            ...findFolder(current_workspace, id),
            ...res.data,
          })
        );
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
        const res = await updateFileAction({
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
      if (
        socket &&
        socket.connected &&
        data &&
        current_workspace?.type === "shared"
      ) {
        socket?.emit(
          "change_banner",
          current_workspace?.id,
          data.id,
          "",
          type,
          //@ts-ignore
          data.folderId,
          "",
          user.id
        );
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
        <>
          {type === "folder" || type === "file" ? (
            //@ts-ignore
            <ItemIsInTrashAlert type={type} data={data} />
          ) : null}
        </>
      ) : null}
      <div className="py-3 mt-2 px-3 flex flex-wrap gap-3 items-center w-full justify-between sm:px-6">
        <div className="flex items-center gap-3 flex-grow">
          <div
            onClick={() => {
              mobileSidebarOpen(true);
            }}
            className="md:hidden dark:text-white relative bottom-[2px]"
          >
            <Menu className="w-7 h-7" />
          </div>
          <EditorBreadCrumb type={type} />
        </div>
        <div className="flex items-center gap-3 sm:px-0">
          <Collaborators
            user={user}
            data={data}
            onlineCollaborators={onlineCollaborators}
            setOnlineCollaborators={setOnlineCollaborators}
          />
          <Badge
            variant={"secondary"}
            className={cn("select-none", {
              "dark:bg-green-700 dark:hover:bg-green-700 bg-green-300 hover:bg-green-300":
                !saving,
              "dark:bg-orange-700 dark:hover:bg-orange-700 bg-orange-300 hover:bg-orange-300":
                saving,
            })}
          >
            {saving ? "Saving..." : "Saved"}
          </Badge>
        </div>
      </div>
      <div className="w-full mb-4">
        <Banner
          src={data?.bannerUrl}
          alt={`${data?.title} banner`}
          isUploading={isUploading}
        />
      </div>
      <Container className="py-6">
        <div className="flex flex-col w-full justify-center items-center">
          <div className="flex w-full flex-col gap-3">
            <div className="w-full flex flex-col group/container">
              <div className="flex w-full flex-col mb-2">
                <input ref={inputRef} hidden type="file" accept="image/*" />
                <div className="md:ml-1">
                  <div className="flex gap-2 md:invisible group-hover/container:visible">
                    {data && !data?.bannerUrl ? (
                      <div
                        onClick={handleOpenInput}
                        className="w-fit flex cursor-pointer 
                  gap-2 dark:hover:bg-muted/100 hover:bg-muted-foreground/20 transition-all 
                  duration-150 dark:text-gray-500 text-xs 
                  bg-muted-foreground/10 
                  dark:bg-muted/50 rounded-lg px-2 py-[3px]"
                      >
                        Add Banner +
                      </div>
                    ) : null}
                    {data && data?.bannerUrl ? (
                      <>
                        <div
                          onClick={handleOpenInput}
                          className="w-fit flex cursor-pointer
                      gap-2 dark:hover:bg-muted/100 hover:bg-muted-foreground/20 transition-all 
                      duration-150 dark:text-gray-500 text-xs 
                      bg-muted-foreground/10
                      dark:bg-muted/50 rounded-lg px-2 py-[3px]"
                        >
                          Change Banner
                        </div>
                        <div
                          onClick={handleRemoveBanner}
                          className="w-fit flex cursor-pointer 
                  gap-1 dark:hover:bg-muted/100 hover:bg-muted-foreground/20 transition-all 
                  duration-150 dark:text-gray-500 text-xs 
                  bg-muted-foreground/10 items-center 
                  dark:bg-muted/50 rounded-lg px-2 py-[3px]"
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
              </div>
              <div className="flex items-center gap-0 w-full overflow-hidden">
                <EmojiPickerMart
                  emoji={data?.iconId || ""}
                  classNames="text-[40px] w-fit"
                  onChangeEmoji={handleChangeEmoji}
                />
                <input
                  value={data?.title || ""}
                  placeholder="Untitled"
                  className="text-3xl h-[3rem] font-bold dark:text-gray-400 pl-0
                border-none bg-transparent hover:bg-transparent flex-grow 
                outline-none hover:outline-none hover:border-none focus-visible:border-none
                focus-within:border-none focus:border-none focus-visible:outline-none
                focus-within:outline-none focus:outline-none focus-visible:ring-0 
                peer-focus-within:outline-red-400 rounded-none border-transparent 
                placeholder:text-gray-300 placeholder:dark:text-gray-600/50
              "
                  onChange={handleChangeTitle}
                />
              </div>
            </div>
          </div>
          <QuillEditor
            setSaving={setSaving}
            data={data}
            type={type}
            user={user}
            onlineCollaborators={onlineCollaborators}
            setOnlineCollaborators={setOnlineCollaborators}
          />
        </div>
      </Container>
    </div>
  );
};

export default EditorPage;
