"use client";

import { File, Folder, Workspace } from "@prisma/client";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Context as SocketContext } from "@/contexts/socket-provider";
import { useAppSelector } from "@/store";
import { toast } from "sonner";
import type QuillType from "quill";
import { useParams } from "next/navigation";

import "quill/dist/quill.snow.css";
import {
  updateFileAction,
  updateFolderAction,
  updateWorkspaceAction,
} from "@/server-actions";
import { User } from "@/types";
import { supabase } from "@/lib/supabase";

interface QuillEditorProps {
  data: Folder | Workspace | File | null | undefined;
  type: "folder" | "file" | "workspace";
  setSaving: (prop: boolean) => void;
  user: User | null | undefined;
  setOnlineCollaborators: (users: User[]) => void;
}

const TOOLBAR_OPTIONS = [
  ["bold", "italic", "underline", "strike"], // toggled buttons
  ["blockquote", "code-block"],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: "ordered" }, { list: "bullet" }],
  [{ script: "sub" }, { script: "super" }], // superscript/subscript
  [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
  [{ direction: "rtl" }], // text direction

  [{ size: ["small", false, "large", "huge"] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],
  ["link"],

  ["clean"], // remove formatting button
];

const QuillEditor: React.FC<QuillEditorProps> = ({
  data,
  type,
  setSaving,
  user,
  setOnlineCollaborators,
}) => {
  const { socket } = useContext(SocketContext);

  const params = useParams();

  const { current_workspace } = useAppSelector((store) => store.workspace);

  const [localCursors, setLocalCursors] = useState<any>([]);

  const [quill, setQuill] = useState<QuillType | null>(null);

  const timeOut = useRef<ReturnType<typeof setTimeout>>();

  const wrapperRef = useCallback(async (wrapper: HTMLDivElement) => {
    if (typeof window !== "undefined") {
      if (!wrapper) return;
      wrapper.innerHTML = "";
      const editorContainer = document.createElement("div");
      wrapper.append(editorContainer);
      const Quill = await (await import("quill")).default;
      const QuillCursor = await (await import("quill-cursors")).default;
      Quill.register("modules/cursors", QuillCursor);
      const q = new Quill(editorContainer, {
        theme: "snow",
        modules: {
          toolbar: TOOLBAR_OPTIONS,
          clipboard: {
            matchVisual: true,
          },
          cursors: {
            transformOnTextChange: true,
          },
        },
      });
      setQuill(q);
    }
  }, []);

  useEffect(() => {
    if (!current_workspace || !data?.id || !quill) return;
    if (data?.data) quill.setContents(JSON.parse(data.data));
  }, [data?.id, data?.data, quill, params, user]);

  const updateChanges = async (content: any) => {
    try {
      if (!data || !current_workspace || !quill || !type) return;
      if (type === "file") {
        await updateFileAction({
          fileId: data.id,
          data: {
            data: JSON.stringify(content),
          },
        });
      }
      if (type === "workspace") {
        await updateWorkspaceAction({
          workspaceId: data.id,
          data: {
            data: JSON.stringify(content),
          },
        });
      }
      if (type === "folder") {
        await updateFolderAction({
          folderId: data.id,
          data: {
            data: JSON.stringify(content),
          },
        });
      }
    } catch (err: any) {
      console.log(err);
      toast.error("Could not save the changes");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!data || !current_workspace || !quill || !user?.id) return;

    const selectionChangeHandler = (cursorId: string) => {
      if (current_workspace.type !== "shared" || !socket || !socket?.connected)
        return;

      return (range: any, oldRange: any, source: any) => {
        if (source === "user" && cursorId) {
          socket.emit(
            "send_cursor_move",
            range,
            cursorId,
            current_workspace.id,
            data.id,
            user.id
          );
        }
      };
    };

    const quillHandler = async (delta: any, oldDelta: any, source: any) => {
      if (source !== "user") {
        setSaving(false);
        return;
      }

      if (timeOut.current) clearTimeout(timeOut.current);

      const content = quill.getContents();

      if (current_workspace.type === "shared" && socket && socket?.connected)
        socket.emit(
          "send_editor_changes",
          delta,
          current_workspace.id,
          data.id,
          user?.id
        );

      setSaving(true);
      timeOut.current = setTimeout(async () => {
        await updateChanges(content);
      }, 850);
    };

    quill.on("text-change", quillHandler);
    if (current_workspace.type === "shared" && socket && socket?.connected)
      quill.on("selection-change", selectionChangeHandler(user.id));

    return () => {
      quill.off("text-change", quillHandler);
      if (current_workspace.type === "shared" && socket && socket?.connected)
        quill.off("selection-change", selectionChangeHandler);
      if (timeOut.current) clearTimeout(timeOut.current);
    };
  }, [quill, data?.id, current_workspace?.id, socket, socket?.connected, user]);

  useEffect(() => {
    if (!data || !current_workspace || !quill || !user?.id) return;
    if (current_workspace.type !== "shared" || !socket || !socket?.connected)
      return;

    const quillUpdateChangesHandler = (
      deltas: any,
      room_id: string,
      fileId: string,
      by: string
    ) => {
      if (
        room_id !== current_workspace?.id ||
        user.id === by ||
        data.id !== fileId
      )
        return;

      quill.updateContents(deltas);
    };

    socket.on("receive_editor_changes", quillUpdateChangesHandler);

    return () => {
      socket?.off("receive_editor_changes", quillUpdateChangesHandler);
    };
  }, [quill, data?.id, current_workspace?.id, socket, socket?.connected, user]);

  useEffect(() => {
    if (!data || !current_workspace || !quill || !user?.id) return;
    if (current_workspace.type !== "shared" || !socket || !socket?.connected)
      return;

    const quillUpdateSelectionHandler = (
      range: any,
      cursorId: string,
      room_id: string,
      fileId: string,
      by: string
    ) => {
      if (
        room_id !== current_workspace.id ||
        !range ||
        !cursorId ||
        user.id === by ||
        data.id !== fileId
      )
        return;
      // console.log(localCursors);
      const cursors = localCursors.cursors();
      const cursorToMove = cursors.find((e: any) => e.id === cursorId);
      // console.log(cursors);
      if (cursorToMove) {
        localCursors.moveCursor(cursorId, range);
      }
    };

    socket.on("receive_cursor_move", quillUpdateSelectionHandler);

    return () => {
      socket?.off("receive_cursor_move", quillUpdateSelectionHandler);
    };
  }, [
    quill,
    data?.id,
    current_workspace?.id,
    socket,
    socket?.connected,
    user,
    localCursors,
  ]);

  useEffect(() => {
    if (
      !current_workspace?.id ||
      !user ||
      current_workspace.type !== "shared" ||
      !data ||
      !quill
    )
      return;
    const room = supabase.channel(data.id);
    const subscription = room
      .on("presence", { event: "sync" }, async () => {
        const newState = room.presenceState();
        const newCollaborators = Object.values(newState).flat() as any;
        const otherColls = newCollaborators.filter(
          (e: User) => e.id !== user.id
        );
        setOnlineCollaborators(otherColls);
        const userCursor = quill.getModule("cursors") as any;
        for (const colls of otherColls) {
          userCursor.createCursor(
            colls.id,
            colls.name,
            `#${Math.random().toString(16).slice(2, 8)}`
          );
        }
        setLocalCursors(userCursor);
      })
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED" || !user) return;

        room.track({
          id: user.id,
          email: user.email?.split("@")[0],
          name: user.name,
          image: user.image,
        });
      });

    return () => {
      supabase.removeChannel(room);
    };
  }, [current_workspace?.id, current_workspace?.type, user, data?.id, quill]);

  return (
    <div className="pb-[3rem] w-full">
      <div
        id="editor-container"
        className="w-full max-w-full"
        ref={wrapperRef}
      />
    </div>
  );
};

export default QuillEditor;
