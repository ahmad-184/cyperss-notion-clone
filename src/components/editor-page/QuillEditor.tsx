import { FolderType, WorkspaceTypes } from "@/types";
import { File } from "@prisma/client";

interface QuillEditorProps {
  data: FolderType | WorkspaceTypes | File;
}

const QuillEditor: React.FC<QuillEditorProps> = ({}) => {
  return <></>;
};

export default QuillEditor;
