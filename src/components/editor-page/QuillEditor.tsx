"use client";

import { File, Folder, Workspace } from "@prisma/client";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Context as SocketContext } from "@/contexts/socket-provider";
import { useAppSelector } from "@/store";
import { toast } from "sonner";
import type QuillType from "quill";

import "quill/dist/quill.snow.css";
import { useParams } from "next/navigation";

interface QuillEditorProps {
  data: Folder | Workspace | File | null | undefined;
  type: "folder" | "file" | "workspace";
  setSaving: (prop: boolean) => void;
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

const QuillEditor: React.FC<QuillEditorProps> = ({ data, type, setSaving }) => {
  const { socket } = useContext(SocketContext);
  const { current_workspace } = useAppSelector((store) => store.workspace);
  const params = useParams();

  const [quill, setQuill] = useState<QuillType | null>(null);

  const timeOut = useRef<ReturnType<typeof setTimeout>>();

  const wrapperRef = useCallback(async (wrapper: HTMLDivElement) => {
    if (typeof window !== "undefined") {
      if (!wrapper) return;
      wrapper.innerHTML = "";
      const editorContainer = document.createElement("div");
      wrapper.append(editorContainer);
      const Quill = await (await import("quill")).default;
      const q = new Quill(editorContainer, {
        theme: "snow",
        modules: {
          toolbar: TOOLBAR_OPTIONS,
          clipboard: {
            matchVisual: true,
          },
        },
      });
      setQuill(q);
    }
  }, []);

  useEffect(() => {
    if (!current_workspace || !data?.id || !quill) return;
    quill.setContents(JSON.parse(JSON.stringify(data?.data || "")));
  }, [data?.id, quill]);

  useEffect(() => {
    if (socket && data?.id && current_workspace && quill) {
      if (!socket.connected) return;

      socket.emit("join_room", data.id, type);
    }
  }, [
    socket?.connected,
    socket,
    data?.id,
    current_workspace?.id,
    quill,
    params,
  ]);

  useEffect(() => {
    if (!data || !current_workspace || !quill || !type) return;
    if ((current_workspace.type === "shared" && !socket) || !socket?.connected)
      return;
    const quillHandler = async (delta: any, oldDelta: any, source: any) => {
      if (source !== "user") return;
      if (timeOut.current) clearTimeout(timeOut.current);
      setSaving(true);
      const content = quill.getContents();
      const contentLength = quill.getLength();
      timeOut.current = setTimeout(async () => {
        try {
        } catch (err: any) {
          console.log(err);
          toast.error("Something went wrong, please try again");
        }
      }, 850);
    };
  }, [quill, data, type, socket]);
  return (
    <div className="pb-[3rem]">
      <div
        id="editor-container"
        className="w-full min-h-[500px]"
        ref={wrapperRef}
      />
    </div>
  );
};

export default QuillEditor;
