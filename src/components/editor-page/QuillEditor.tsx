import { FolderType, WorkspaceTypes } from "@/types";
import { File } from "@prisma/client";
import { useCallback } from "react";

import "quill/dist/quill.snow.css";

interface QuillEditorProps {
  data: FolderType | WorkspaceTypes | File | null;
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

  ["clean"], // remove formatting button
];

const QuillEditor: React.FC<QuillEditorProps> = ({ data }) => {
  const wrapperRef = useCallback(async (wrapper: HTMLDivElement) => {
    if (typeof window !== "undefined") {
      if (!wrapper) return;
      wrapper.innerHTML = "";
      const editorContainer = document.createElement("div");
      wrapper.append(editorContainer);
      const Quill = await (await import("quill")).default;
      const a = new Quill(editorContainer, {
        theme: "snow",
        modules: {
          toolbar: TOOLBAR_OPTIONS,
        },
      });
    }
  }, []);

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
