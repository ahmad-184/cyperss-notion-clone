import { file, folder, workspace } from "@prisma/client";
import type { Session } from "next-auth";

export type UserSession = {
  user: Session["user"] | undefined;
};

export type User = Session["user"];

export type WorkspaceTypes = workspace & {
  folders: (folder & {
    files: file[] | [];
  })[];
};
