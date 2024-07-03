import { v4 as uuid4 } from "uuid";
import { FolderType, User } from "@/types";
import { cn } from "@/lib/utils";
import { useParams, usePathname, useRouter } from "next/navigation";
import { File } from "@prisma/client";
import { memo, useContext, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store";
import { addfile, removeFile } from "@/store/slices/workspace";
import { createFileAction } from "@/server-actions";
import useTrash from "@/hooks/useTrash";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/DropdownMenu";
import { Context as SocketContext } from "@/contexts/socket-provider";
import { useTranslation } from "react-i18next";
import { useLocal } from "@/contexts/local-context";
import { getDirByLang } from "@/lib/dir";
import { useLanguage } from "@/contexts/language-context";

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
  const { lang } = useLanguage();
  const { socket } = useContext(SocketContext);
  const params = useParams();
  const [open, setOpen] = useState(params.folderId === data.id);

  const { deleteItem } = useTrash();

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
      if (!open) setOpen(true);
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
    <>
      <div className="my-[1px]">
        <div
          className={cn(
            "flex gap-1 transition-all border-b md:border-0 duration-150 h-10 sm:h-9 items-center rounded-sm md:rounded-lg group/common dark:hover:bg-gray-500/20 hover:bg-gray-500/10 px-1",
            {
              "dark:bg-gray-500/20 bg-gray-500/10":
                (type === "folder" &&
                  !params.fileId &&
                  data.id === params.folderId) ||
                (type === "file" &&
                  params.folderId &&
                  data.id === params.fileId),
              "ltr:pl-9 ltr:md:pl-3 rtl:pr-9 rtl:md:pr-3": type === "file",
            }
          )}
        >
          <div
            className={cn(
              "dark:text-gray-500 cursor-pointer dark:hover:bg-gray-800 hover:bg-gray-300/80 py-[4px] px-[3px] rounded-md",
              {
                "hidden invisible": type !== "folder",
                "md:hidden md:group-hover/common:block": type === "folder",
              }
            )}
            onClick={() => setOpen((prev) => !prev)}
          >
            <ChevronRightIcon
              className={cn(
                "h-4 w-4 ltr:block text-[16px] rtl:hidden shrink-0 transition-transform duration-200",
                {
                  "ltr:rotate-[90deg] rtl:rotate-[-90deg]": open,
                }
              )}
            />
            <ChevronLeftIcon
              className={cn(
                "h-4 w-4 rtl:block text-[16px] ltr:hidden shrink-0 transition-transform duration-200",
                {
                  "ltr:rotate-[90deg] rtl:rotate-[-90deg]": open,
                }
              )}
            />
          </div>
          <div
            onClick={() => {
              handleCloseSidebarMobile();
              handleChangeUrl();
            }}
            className="flex h-full items-center cursor-pointer gap-1 flex-grow truncate"
          >
            <div
              className={cn("sm:block", {
                "md:group-hover/common:hidden": type === "folder",
              })}
            >
              <p className="text-[16px] select-none">{data.iconId || ""}</p>
            </div>
            <p className="truncate cursor-pointer flex-grow text-sm font-medium dark:text-gray-500">
              {data.title || t("dashboard:untitled")}
            </p>
          </div>
          <div className="flex gap-2 relative items-center text-gray-500 md:hidden md:group-hover/common:flex">
            <div className="cursor-pointer">
              <div
                className={cn("cursor-pointer hidden md:block")}
                onClick={handleMoveToTrash}
              >
                <Trash2Icon className="w-4 h-4" />
              </div>
              <div className="md:hidden">
                <DropdownMenu dir={getDirByLang(lang)}>
                  <DropdownMenuTrigger asChild>
                    <EllipsisIcon className="w-5 h-5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleMoveToTrash}>
                      <div className="flex gap-2">
                        <Trash2Icon className="w-4 h-4" />
                        <p className="text-sm capitalize">
                          {t("dashboard:delete")}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div
              className={cn("cursor-pointer", {
                hidden: type !== "folder",
              })}
              onClick={handleCreateNewFile}
            >
              <PlusIcon className="w-4 h-4" strokeWidth={2.3} />
            </div>
          </div>
        </div>
        <div
          className={cn({
            "hidden h-0 invisible": !open,
            "block visible": open,
          })}
        >
          {type === "folder" && data.files.length ? (
            <>
              <div>
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
              </div>
            </>
          ) : null}
          {type === "folder" && !data.files.filter((e) => !e.inTrash).length ? (
            <div className="mt-2">
              <p className="text-muted-foreground text-center text-xs capitalize font-medium">
                ...{t("dashboard:empty")}...
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default memo(DropdownItem);
