import { v4 as uuid4 } from "uuid";
import { FolderType, User } from "@/types";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/Accordion";
import EmojiPicker from "../EmojiPicker";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { File } from "@prisma/client";
import { memo, useState } from "react";
import { Input } from "../ui/Input";
import CustomTooltip from "../custom/CustomTooltip";
import { PlusIcon, TrashIcon } from "lucide-react";
import type { EmojiClickData } from "emoji-picker-react";
import { toast } from "sonner";
import { useAppDispatch } from "@/store";
import {
  addfile,
  changeEmoji,
  changeFileFolderTitle,
  removeFile,
} from "@/store/slices/workspace";
import {
  changeFileFolderTitleAction,
  changeIconAction,
  createFile,
} from "@/server-actions";
import useTrash from "@/hooks/useTrash";

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

  const [isEditting, setEdditing] = useState(false);
  const [title, setTitle] = useState(data.title || "");

  const { deleteItem } = useTrash();

  const handleChangeEmoji = async (emoji: EmojiClickData) => {
    try {
      const currentIcon = data.iconId as string;
      const newIcon = emoji.emoji;
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
        toast.error(error?.message || "Could not update the icon");
        return;
      }
      if (resData) return;
    } catch (err) {
      console.log(err);
      toast.error(`Could not change the ${type} icon, please try again`);
    }
  };

  const handleDoubleClick = () => {
    console.log("double clicked");
    setEdditing(true);
  };

  const handleChangeTitle = async () => {
    try {
      if (!title.length) return;
      if (title.length <= 3)
        return toast.error(`${type} name must have atleast 3 cahracters`);
      const currentTitle = data.title;
      const payload = {
        type,
        title,
        id: data.id,
        ...(type === "file" && { folderId: data.folderId }),
      };
      dispatch(changeFileFolderTitle(payload));
      const { data: resData, error } = await changeFileFolderTitleAction({
        type,
        id: data.id,
        title,
      });
      if (error || !resData) {
        payload["title"] = currentTitle;
        dispatch(changeFileFolderTitle(payload));
        setTitle(currentTitle);
        toast.error(error?.message || "Could not update the icon");

        return;
      }
      if (resData) return;
    } catch (err) {
      console.log(err);
      toast.error(`Could not change the ${type} name, please try again`);
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
        title: "Untitled",
        bannerUrl: "",
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
      const { data: resData, error } = await createFile(payload);
      if (error || !resData) {
        dispatch(removeFile({ folderId: data.id, id: payload.id }));
        toast.error(
          error?.message || "Could not create file, please try again"
        );

        return;
      }
      if (resData) return;
      else throw new Error();
    } catch (err) {
      console.log(err);
      toast.error("Could not create file, please try again");
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
      router.back();
      deleteItem(payload);
      return;
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong, please try again");
    }
  };

  return (
    <AccordionItem
      value={data.id}
      onClick={(e) => {
        e.stopPropagation();
      }}
      className={cn("pr-4", { "rtl:pl-4": type === "file" })}
    >
      <AccordionTrigger
        isFolder={type === "folder"}
        className="dark:text-gray-500"
      >
        <div
          className={cn(
            "flex items-center gap-2 justify-between w-full group/common dark:text-gray-500",
            {
              "group/folder": type === "folder",
              "group/file": type === "file",
            }
          )}
        >
          <div className="flex items-center gap-2">
            <EmojiPicker
              handleChangeEmoji={handleChangeEmoji}
              emoji={data.iconId!}
            />
            {!isEditting ? (
              <p
                onClick={handleChangeUrl}
                className="cursor-pointer"
                onDoubleClick={handleDoubleClick}
              >
                {data.title}
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
          <div className="items-center pr-3 gap-2 hidden group-hover/common:flex transition-all duration-150">
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
          <p className="text-muted-foreground text-center">...empty...</p>
        </AccordionContent>
      ) : null}
    </AccordionItem>
  );
};

export default memo(DropdownItem);
