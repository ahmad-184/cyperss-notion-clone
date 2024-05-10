"use client";

import {
  changeIconAction,
  changeItemTitleAction,
  getFilebyId,
  getFolderbyId,
  getWorkspaceById,
} from "@/server-actions";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  changeEmoji,
  changeItemTitle,
  replaceFile,
  replaceFolder,
  replaceWorkspace,
} from "@/store/slices/workspace";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import EditorBreadCrumb from "./EditorBreadcrumb";
import ItemIsInTrashAlert from "./ItemIsInTrashAlert";
import { useParams, useRouter } from "next/navigation";
import Banner from "./Banner";
import Container from "./Container";
import QuillEditor from "./QuillEditor";
import { File } from "@prisma/client";
import { FolderType, WorkspaceTypes } from "@/types";
import EmojiPicker from "../EmojiPicker";
import { EmojiClickData } from "emoji-picker-react";
import { Input } from "../ui/Input";
import _debounce from "lodash.debounce";

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
    if (!current_workspace) return null;
    let res;

    if (type === "workspace") res = current_workspace;
    if (type === "folder") {
      res = current_workspace?.folders.find((e) => e.id === id);
    }
    if (type === "file" && folderId) {
      const folderIndex = current_workspace?.folders.findIndex(
        (e) => e.id === folderId
      );
      res = current_workspace?.folders[folderIndex!].files.find(
        (e) => e.id === id
      );
    }
    return res as File | FolderType | WorkspaceTypes | null;
  }, [current_workspace, type, id, folderId, params]);

  const handleChangeEmoji = async (emoji: EmojiClickData) => {
    try {
      if (!current_workspace || !data) return;
      const currentIcon = data.iconId as string;
      const newIcon = emoji.emoji;
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

  return (
    <div className="w-full">
      {data?.inTrash ? (
        <ItemIsInTrashAlert type={type === "folder" ? "folder" : "file"} />
      ) : null}
      <div className="py-4 mt-2 px-3 sm:px-6">
        <EditorBreadCrumb type={type} />
      </div>
      <div className="w-full mb-4">
        <Banner src={data?.bannerUrl || null} />
      </div>
      <Container className="py-6 flex flex-col w-full gap-3 justify-center items-center">
        <div className="flex w-full flex-col gap-3">
          <div className="flex flex-col">
            <EmojiPicker
              emoji={data?.iconId || ""}
              handleChangeEmoji={handleChangeEmoji}
              classNames="text-[70px] pl-[2px] w-fit"
            />
            <Input
              value={data?.title || ""}
              placeholder="Untitled"
              className="text-3xl font-bold dark:text-gray-400 pl-[0.87rem]
                border-none bg-transparent hover:bg-transparent
                outline-none hover:outline-none hover:border-none focus-visible:border-none
                focus-within:border-none focus:border-none focus-visible:outline-none
                focus-within:outline-none focus:outline-none focus-visible:ring-0
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
