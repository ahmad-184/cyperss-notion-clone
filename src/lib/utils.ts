import { getWorkspacesReturnType } from "@/server-actions";
import { type ClassValue, clsx } from "clsx";
import type { HashOptions } from "crypto";
import { signOut } from "next-auth/react";
import { twMerge } from "tailwind-merge";

const secret_key = process.env.SECRET_KEY as HashOptions;

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

export const returnAllWorkspaces = (
  data: NonNullable<getWorkspacesReturnType["data"]>
) => {
  return [...data.private, ...data.shared, ...data.collaborating];
};

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
