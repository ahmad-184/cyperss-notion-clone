import { v4 as uuid4 } from "uuid";
import { FolderType, User } from "@/types";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/Accordion";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { File } from "@prisma/client";
import { memo, useContext, useState } from "react";
import { Input } from "../ui/Input";
import CustomTooltip from "../custom/CustomTooltip";
import { EllipsisVertical, PlusIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  addfile,
  changeEmoji,
  changeItemTitle,
  removeFile,
} from "@/store/slices/workspace";
import {
  changeItemTitleAction,
  changeIconAction,
  createFileAction,
} from "@/server-actions";
import useTrash from "@/hooks/useTrash";
import EmojiPickerMart from "../EmojiPickerMart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/DropdownMenu";
import { Context as SocketContext } from "@/contexts/socket-provider";
import { useTranslation } from "react-i18next";
import { useLocal } from "@/contexts/local-context";

type DropdownItemProps =
  | {
      type: "folder";
      data: FolderType;
      user: User;
    }
  | {
      type: "file";
      data: File;
      user: User;
    };

const DropdownItem: React.FC<DropdownItemProps> = ({ type, data, user }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { current_workspace } = useAppSelector((store) => store.workspace);
  const { t } = useTranslation();
  const [isEditting, setEdditing] = useState(false);
  const [title, setTitle] = useState(data.title || "");

  const { socket } = useContext(SocketContext);

  const { deleteItem } = useTrash();

  const handleChangeEmoji = async (value: string) => {
    try {
      const currentIcon = data.iconId as string;
      const newIcon = value;
      const payload = {
        emoji: newIcon,
        type,
        id: data.id,
        ...(type === "file" && { folderId: data.folderId }),
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
        toast.error(t("dashboard:error-message"));
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
      toast.error(t("dashboard:error-message"));
    }
  };

  const handleDoubleClick = () => {
    console.log("double clicked");
    setEdditing(true);
  };

  const handleChangeTitle = async () => {
    try {
      const currentTitle = data.title;
      const payload = {
        type,
        title,
        id: data.id,
        ...(type === "file" && { folderId: data.folderId }),
      };
      dispatch(changeItemTitle(payload));
      const { data: resData, error } = await changeItemTitleAction({
        type,
        id: data.id,
        title,
      });
      if (error || !resData) {
        payload["title"] = currentTitle;
        dispatch(changeItemTitle(payload));
        setTitle(currentTitle);
        toast.error(t("dashboard:error-message"));

        return;
      }
      if (resData) {
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
            resData.title,
            type,
            // @ts-ignore
            data.folderId,
            user.id
          );
        }
      }
    } catch (err) {
      console.log(err);
      toast.error(t("dashboard:could-not-change-file-name", { type }));
    }
  };

  const handleOnBlur = () => {
    setEdditing(false);
    handleChangeTitle();
  };

  const handleCreateNewFile = async () => {
    try {
      if (type === "file") return;
      const payload: File = {
        id: uuid4(),
        title: "",
        bannerUrl: "",
        banner_public_id: "",
        createdAt: new Date(Date.now()),
        data: null,
        folderId: data.id,
        iconId: "📄",
        inTrash: false,
        inTrashBy: "",
        updatedAt: new Date(Date.now()),
        workspaceId: data.workspaceId,
        workspaceOwnerId: data.workspaceOwnerId,
      };
      dispatch(addfile({ data: payload, folderId: data.id }));
      const { data: resData, error } = await createFileAction(payload);
      if (error || !resData) {
        dispatch(removeFile({ folderId: data.id, id: payload.id }));
        toast.error(t("dashboard:could-not-create-file"));

        return;
      }
      if (resData) {
        if (
          socket &&
          socket.connected &&
          data &&
          current_workspace?.type === "shared"
        ) {
          socket?.emit("add_file", current_workspace?.id, resData, user.id);
        }
      } else throw new Error();
    } catch (err) {
      console.log(err);
      toast.error(t("dashboard:could-not-create-file"));
    }
  };

  const handleChangeUrl = () => {
    if (type === "folder") {
      const url = `/dashboard/${data.workspaceId}/${data.id}`;
      if (url === pathname) return;
      router.push(url);
    }
    if (type === "file" && data?.folderId) {
      const url = `/dashboard/${data.workspaceId}/${data.folderId}/${data.id}`;
      if (url === pathname) return;
      router.push(url);
    }
  };

  const handleMoveToTrash = () => {
    try {
      const payload = {
        type,
        inTrashBy: user.email as string,
        id: data.id,
        name: data.title,
        ...(type === "file" && { folderId: data.folderId }),
      };
      if (type === "folder") {
        const itemPath = `/dashboard/${data.workspaceId}/${data.id}`;
        const urlToNavigate = `/dashboard/${data.workspaceId}`;
        if (pathname === itemPath) router.push(urlToNavigate);
      }
      if (type === "file" && data?.folderId) {
        const itemPath = `/dashboard/${data.workspaceId}/${data.folderId}/${data.id}`;
        const urlToNavigate = `/dashboard/${data.workspaceId}/${data.folderId}`;
        if (itemPath === pathname) router.push(urlToNavigate);
      }
      deleteItem(payload);
      return;
    } catch (err) {
      console.log(err);
      toast.error(t("dashboard:error-message"));
    }
  };

  const { mobileSidebarOpen, mobile_sidebar_open } = useLocal();

  const handleCloseSidebarMobile = () => {
    if (mobile_sidebar_open) mobileSidebarOpen(false);
  };

  return (
    <AccordionItem
      value={data.id}
      onClick={(e) => {
        e.stopPropagation();
      }}
      className={cn("w-full sm:w-[256px]", {
        "rtl:pr-3 ltr:pl-3": type === "file",
      })}
    >
      <AccordionTrigger
        isFolder={type === "folder"}
        className="dark:text-gray-500"
      >
        <div
          className={cn(
            "flex items-center w-full sm:w-[236px] gap-2 justify-between max-w-full group/common dark:text-gray-500",
            {
              "group/folder": type === "folder",
              "group/file": type === "file",
            }
          )}
        >
          <div className="flex items-center gap-2 truncate flex-grow">
            <div className="hidden sm:block">
              <EmojiPickerMart
                onChangeEmoji={handleChangeEmoji}
                emoji={data.iconId! || ""}
              />
            </div>
            <div className="block sm:hidden">
              <p
                className={cn(`cursor-pointer`)}
                onClick={() => {
                  handleCloseSidebarMobile();
                  handleChangeUrl();
                }}
              >
                {data?.iconId}
              </p>
            </div>
            {!isEditting ? (
              <p
                onClick={() => {
                  handleCloseSidebarMobile();
                  handleChangeUrl();
                }}
                className="cursor-pointer truncate flex-grow text-sm"
                onDoubleClick={handleDoubleClick}
              >
                {data?.title || t("dashboard:untitled")}
              </p>
            ) : (
              <Input
                value={title}
                className="border-none outline-none text-gray-700 dark:text-primary-foreground h-fit flex flex-grow bg-muted"
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleOnBlur}
                readOnly={!isEditting}
                autoFocus
              />
            )}
          </div>
          <div
            className="items-center pr-3 gap-2 md:hidden md:group-hover/common:flex
          transition-all duration-150 hidden"
          >
            <CustomTooltip
              description={
                type === "folder"
                  ? "Delete Folder"
                  : type === "file"
                  ? "Delete File"
                  : ""
              }
            >
              <TrashIcon
                onClick={handleMoveToTrash}
                className="w-4 h-4 dark:hover:text-gray-400 cursor-pointer"
              />
            </CustomTooltip>
            {type === "folder" ? (
              <CustomTooltip description={"Create New File"}>
                <PlusIcon
                  onClick={handleCreateNewFile}
                  className="w-4 h-4 dark:hover:text-gray-400 cursor-pointer"
                />
              </CustomTooltip>
            ) : null}
          </div>
          <div className="md:hidden flex pr-2">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <EllipsisVertical className="w-5 h-5 dark:text-gray-500" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleMoveToTrash}>
                  <div className="w-full flex items-center gap-1">
                    <p className="text-sm dark:text-gray-200">Delete</p>
                  </div>
                </DropdownMenuItem>

                {type === "folder" ? (
                  <DropdownMenuItem onClick={handleCreateNewFile}>
                    <div className="w-full flex items-center gap-1">
                      <p className="text-sm dark:text-gray-200">Add File</p>
                    </div>
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </AccordionTrigger>
      {type === "folder" && data.files.length ? (
        <>
          <AccordionContent className="ml-4">
            {data.files
              .filter((e) => !e.inTrash)
              .map((f, i) => (
                <DropdownItem
                  data={f}
                  type="file"
                  key={`file-item-${i}-${f.id}`}
                  user={user}
                />
              ))}
          </AccordionContent>
        </>
      ) : null}
      {type === "folder" && !data.files.filter((e) => !e.inTrash).length ? (
        <AccordionContent>
          <p className="text-muted-foreground text-center">
            ...{t("dashboard:empty")}...
          </p>
        </AccordionContent>
      ) : null}
    </AccordionItem>
  );
};

export default memo(DropdownItem);
