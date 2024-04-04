"use server";

import { getAuthSession } from "@/lib/authOptions";
import { db } from "@/lib/db";
import { WorkspaceType } from "@/types";
import {
  workspace as Workspace,
  subscription as Subscription,
} from "@prisma/client";

export const getUserSubscription = async (
  userid: string
): Promise<{
  data: Subscription | null;
  error: string | null;
}> => {
  try {
    const sub = await db.subscription.findFirst({
      where: {
        user_id: userid,
      },
    });

    if (sub)
      return {
        data: sub,
        error: null,
      };

    return { data: null, error: null };
  } catch (err: any) {
    return {
      data: null,
      error: `Error: ${
        err.message || "Something went wrong, please try again."
      }`,
    };
  }
};

export const createWorkspace = async (
  data: Omit<Workspace, "createdAt">
): Promise<{
  data?: WorkspaceType;
  error?: {
    message: string | null;
  };
}> => {
  try {
    const res = await db.workspace.create({
      data: data,
      include: {
        folders: {
          include: {
            files: true,
          },
        },
      },
    });

    if (!res) throw new Error();

    return {
      data: res,
    };
  } catch (err: any) {
    console.log(err);
    return {
      error: {
        message:
          "We can not create your workspace, please check your network and try again.",
      },
    };
  }
};

export const getWorkspaces = async (): Promise<{
  data?: WorkspaceType[];
  error?: {
    message: string | null;
  };
}> => {
  try {
    const session = await getAuthSession();
    if (!session)
      return {
        error: { message: "Unathorized" },
      };
    if (!session?.user?.id)
      return {
        error: { message: "Unathorized" },
      };

    const res = await db.workspace.findMany({
      where: {
        workspaceOwnerId: session.user.id,
      },
      include: {
        folders: {
          include: {
            files: true,
          },
        },
      },
    });
    return {
      data: res || [],
    };
  } catch (err: any) {
    console.log(err);
    return {
      error: {
        message: err.message || "Something went wrong, please try again.",
      },
    };
  }
};

export const getWorkspaceById = async (
  id: string
): Promise<{
  data?: WorkspaceType | null;
  error?: {
    message: string | null;
  };
}> => {
  try {
    const session = await getAuthSession();
    if (!session)
      return {
        error: { message: "Unathorized" },
      };
    if (!session?.user?.id)
      return {
        error: { message: "Unathorized" },
      };

    const res = await db.workspace.findFirst({
      where: {
        id,
      },
      include: {
        folders: {
          include: {
            files: true,
          },
        },
      },
    });

    if (!res) throw new Error("workspace not found");

    return {
      data: res,
    };
  } catch (err: any) {
    console.log(err);
    return {
      error: {
        message: err.message || "Something went wrong, please try again.",
      },
    };
  }
};
