import { File, Folder, Workspace } from "@prisma/client";
import type { Session } from "next-auth";

export type UserSession = {
  user: Session["user"] | undefined;
};

export type User = Session["user"];

export type WorkspaceTypes = Workspace & {
  folders: (Folder & {
    files: File[];
  })[];
  collaborators:
    | {
        user: User;
      }[]
    | [];
};

export type WorkspacePayload = Omit<Workspace, "createdAt" | "updatedAt">;

export type FolderType = Folder & {
  files: File[] | [];
};

export type ChangeInTrashStatusTypes = {
  type: "folder" | "file";
  id: string;
  folderId?: string;
  inTrashBy: string;
  inTrash: boolean;
};

export type FileTypes = "folder" | "file" | "workspace";
