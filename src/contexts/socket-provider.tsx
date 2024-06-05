"use client";

import { useSocket } from "@/hooks/useSocket";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  addfile,
  addFolder,
  changeBanner,
  changeEmoji,
  changeInTrashStatus,
  changeItemTitle,
  removeFile,
  removeFolder,
  replaceWorkspace,
} from "@/store/slices/workspace";
import { FileTypes, FolderType, WorkspaceTypes } from "@/types";
import { File } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { createContext, useEffect } from "react";
import type { Socket } from "socket.io-client";

type ContextType = {
  socket: Socket | null;
};

export const Context = createContext<ContextType>({
  socket: null,
});

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { socket } = useSocket();
  const session = useSession();
  const router = useRouter();
  const params = useParams();
  const { current_workspace, loading } = useAppSelector(
    (store) => store.workspace
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (
      !socket ||
      !socket.connected ||
      !session.data?.user ||
      !current_workspace ||
      loading ||
      current_workspace.type !== "shared"
    )
      return;

    socket.on(
      "receive_changed_title",
      (
        room_id: string,
        fileId: string,
        title: string,
        type: "workspace" | "folder" | "file",
        folderId: string,
        by: string
      ) => {
        if (room_id !== current_workspace.id || session.data.user.id === by)
          return;

        dispatch(
          changeItemTitle({
            title,
            type,
            id: fileId,
            folderId,
          })
        );
      }
    );

    socket.on(
      "receive_changed_icon",
      (
        room_id: string,
        fileId: string,
        icon: string,
        type: "workspace" | "folder" | "file",
        folderId: string,
        by: string
      ) => {
        if (room_id !== current_workspace.id || session.data.user.id === by)
          return;
        dispatch(
          changeEmoji({
            emoji: icon,
            id: fileId,
            folderId,
            type,
          })
        );
      }
    );

    socket.on(
      "receive_changed_banner",
      (
        room_id: string,
        fileId: string,
        banner: string,
        type: "workspace" | "folder" | "file",
        folderId: string,
        banner_public_id: string,
        by: string
      ) => {
        if (room_id !== current_workspace.id || session.data.user.id === by)
          return;
        console.log(
          banner,
          fileId,
          room_id,
          type,
          folderId,
          banner_public_id,
          by
        );
        dispatch(
          changeBanner({
            banner_public_id,
            bannerUrl: banner,
            id: fileId,
            type,
            folderId,
          })
        );
      }
    );

    socket.on(
      "receive_folder",
      (room_id: string, data: FolderType, by: string) => {
        if (current_workspace.id !== room_id || by === session.data?.user.id)
          return;
        dispatch(
          addFolder({
            data,
          })
        );
      }
    );

    socket.on("receive_file", (room_id: string, data: File, by: string) => {
      if (current_workspace.id !== room_id || by === session.data?.user.id)
        return;
      dispatch(
        addfile({
          data,
          folderId: data.folderId,
        })
      );
    });

    socket.on(
      "receive_in_trash_file/folder",
      (
        room_id: string,
        id: string,
        folderId,
        type: "folder" | "file",
        by: string,
        status: boolean,
        inTrashBy
      ) => {
        if (current_workspace.id !== room_id || by === session.data?.user.id)
          return;
        dispatch(
          changeInTrashStatus({
            id,
            type,
            inTrash: status,
            inTrashBy,
            folderId,
          })
        );
      }
    );

    socket.on(
      "receive_deleted_file/folder",
      (
        room_id: string,
        id: string,
        type: FileTypes,
        folderId: string,
        by: string
      ) => {
        if (current_workspace.id !== room_id || by === session.data?.user.id)
          return;
        if (type === "folder")
          dispatch(
            removeFolder({
              id,
            })
          );
        if (type === "file")
          dispatch(
            removeFile({
              id,
              folderId,
            })
          );
      }
    );

    socket.on(
      "receive_updated_workspace_settgins",
      (room_id: string, data: WorkspaceTypes, by: string) => {
        if (current_workspace.id !== room_id || by === session.data?.user.id)
          return;
        if (data.type === "private") {
          window.localStorage.removeItem("active_workspace");
          router.replace("/dashboard");

          return;
        }

        const userExistInCollaborators = data.collaborators.some(
          (e) => e.user.id === session.data.user.id
        );
        if (!userExistInCollaborators) {
          window.localStorage.removeItem("active_workspace");
          router.replace("/dashboard");

          return;
        }

        dispatch(replaceWorkspace(data));
      }
    );

    socket.on("receive_deleted_workspace", (room_id: string, by: string) => {
      if (current_workspace.id !== room_id || by === session.data?.user.id)
        return;
      window.localStorage.removeItem("active_workspace");
      router.replace("/dashboard");
      return;
    });

    return () => {
      socket.off("receive_changed_title");
      socket.off("receive_changed_icon");
      socket.off("receive_changed_banner");
      socket.off("receive_folder");
      socket.off("receive_file");
      socket.off("receive_in_trash_file/folder");
      socket.off("receive_deleted_file/folder");
      socket.off("receive_updated_workspace_settgins");
      socket.off("receive_deleted_workspace");
    };
  }, [
    socket,
    socket?.connected,
    session.data?.user,
    current_workspace?.id,
    current_workspace?.type,
    loading,
    params,
  ]);

  return <Context.Provider value={{ socket }}>{children}</Context.Provider>;
};

export default SocketProvider;
