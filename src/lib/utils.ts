import { FolderType, WorkspaceTypes } from "@/types";
import { File } from "@prisma/client";
import { type ClassValue, clsx } from "clsx";
import { signOut } from "next-auth/react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function AddMinutesToDate({
  date = new Date(),
  minutes,
}: {
  date: any;
  minutes: number;
}) {
  return new Date(date.getTime() + minutes * 60000);
}

export const logOutUser = async () => {
  if (window) {
    signOut({ redirect: false }).then(() => {
      setTimeout(() => {
        window.localStorage.removeItem("active_workspace");
        window.location.reload();
      }, 200);
    });
  }
};

export const findFolderIndex = (state: WorkspaceTypes, id: string) => {
  return state?.folders.findIndex((e) => e.id === id) as number;
};

export const findFolder = (state: WorkspaceTypes, id: string) => {
  return state?.folders.find((e) => e.id === id) as FolderType;
};

export const findFileIndex = (
  state: WorkspaceTypes,
  id: string,
  folderId: string
) => {
  const folderIndex = findFolderIndex(state, folderId);
  return state?.folders[folderIndex].files.findIndex(
    (e) => e.id === id
  ) as number;
};

export const findFile = (
  state: WorkspaceTypes,
  id: string,
  folderId: string
) => {
  return state?.folders[findFolderIndex(state, folderId)].files.find(
    (e) => e.id === id
  ) as File;
};

export const findWorkspaceIndex = (
  workspaces: WorkspaceTypes[],
  id: string
) => {
  return workspaces.findIndex((e) => e.id === id);
};

export const findWorkspace = (workspaces: WorkspaceTypes[], id: string) => {
  return workspaces[findWorkspaceIndex(workspaces, id)];
};
