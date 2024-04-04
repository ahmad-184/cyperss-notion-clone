import { file, folder, workspace } from "@prisma/client";
import type { Session } from "next-auth";

export type UserSession = {
  user: Session["user"] | undefined;
};

export type WorkspaceType = workspace & {
  folders: (folder & {
    files: file[] | [];
  })[];
};
