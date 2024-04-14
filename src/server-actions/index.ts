"use server";

import { getAuthSession } from "@/lib/authOptions";
import { db } from "@/lib/db";
import { User, WorkspaceTypes } from "@/types";
import {
  workspace as Workspace,
  subscription as Subscription,
  collaborator as Collaborator,
} from "@prisma/client";
import {
  collaboratingWorkspacesQuery,
  createCollaboratorQuery,
  createWorkspaceQuery,
  getUsersQuery,
  getUserSubscriptioQuery,
  getUserWithoutMeQuery,
  privateWorkspacesQuery,
  sharedWorkspacesQuery,
} from "./queries";
import { cookies } from "next/headers";
import { error } from "console";
import {
  Give_You_Glory,
  Major_Mono_Display,
  Ubuntu_Mono,
} from "next/font/google";
import { unstable_batchedUpdates } from "react-dom";
import { UnlockKeyhole } from "lucide-react";
import { v5 } from "uuid";
import { junit } from "node:test/reporters";
import { ucs2 } from "punycode";
import { lchown } from "fs";

export const checkUserExist = async (userId: string, cookies: any) => {
  try {
    const isUserExists = await db.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!isUserExists) {
      const cookiesState = await cookies();
      cookiesState.delete("next-auth.session-token");

      return false;
    } else return true;
  } catch (err: any) {
    console.log(err);
  }
};

export const getUserSubscription = async (
  userId: string
): Promise<{
  data: Subscription | null;
  error: string | null;
}> => {
  try {
    const sub = await getUserSubscriptioQuery(userId);

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

export const updateUserDetail = async (
  data: User
): Promise<{
  data?: User;
  error?: {
    message: string | null;
  };
}> => {
  try {
    if (!data.id) throw new Error("User id required");
    const isUserExist = await checkUserExist(data.id, cookies);

    if (!isUserExist)
      throw new Error("User not exist enymore , please sign in again");

    const updatedUser = await db.user.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.image && { image: data.image }),
      },
    });

    const returnData = {
      id: updatedUser.id,
      name: updatedUser.name,
      image: updatedUser.image,
      email: updatedUser.email,
    };

    return {
      data: returnData,
    };
  } catch (err: any) {
    console.log(err);
    return {
      error: {
        message: err.message
          ? err.message
          : "We can not update user details, please check your network and try again.",
      },
    };
  }
};

export const createWorkspace = async (
  data: Omit<Workspace, "createdAt">
): Promise<{
  data?: WorkspaceTypes;
  error?: {
    message: string | null;
  };
}> => {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) throw new Error("Unathorized");
    const isUserExist = await checkUserExist(session.user.id, cookies);

    if (!isUserExist)
      throw new Error("User not exist enymore , please sign in");

    const res = await createWorkspaceQuery(data);

    if (!res) throw new Error();

    return {
      data: res,
    };
  } catch (err: any) {
    console.log(err);
    return {
      error: {
        message:
          err.message ||
          "We can not create your workspace, please check your network and try again.",
      },
    };
  }
};

export const createCollaborators = async ({
  workspaceId,
  collaborators,
}: {
  workspaceId: string;
  collaborators: User[];
}) => {
  try {
    const data: Collaborator[] = [];

    if (!collaborators.length)
      throw new Error("atleast 1 collaborator required.");

    for (const c of collaborators) {
      if (c.id) {
        const userExist = await db.user.findUnique({ where: { id: c.id } });
        if (userExist) {
          const coll = await createCollaboratorQuery(workspaceId, c);
          data.push(coll);
        }
      }
    }

    return {
      data,
    };
  } catch (err: any) {
    console.log(err);
    return {
      error: {
        message: err.message || "Something went wrong, please try again",
      },
    };
  }
};

export type getWorkspacesReturnType = {
  data?: {
    private: WorkspaceTypes[];
    shared: WorkspaceTypes[];
    collaborating: WorkspaceTypes[];
  };
  error?: {
    message: string | null;
  };
};

export const getWorkspaces = async (): Promise<getWorkspacesReturnType> => {
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

    const userId = session.user.id as string;

    const [privateWorkspaces, sharedWorkspaces, collaboratingWorkspaces] =
      await Promise.all([
        privateWorkspacesQuery(userId),
        sharedWorkspacesQuery(userId),
        collaboratingWorkspacesQuery(userId),
      ]);

    const data: getWorkspacesReturnType["data"] = {
      private: privateWorkspaces,
      shared: sharedWorkspaces,
      collaborating: collaboratingWorkspaces,
    };

    return {
      data,
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
  data?: WorkspaceTypes | null;
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
    console.log(id);
    const data = await db.workspace.findUnique({
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

    if (!data?.id) throw new Error("Workspace not found");

    return {
      data,
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

export const getUsers = async (
  include_me?: boolean
): Promise<{
  data?: Required<User[]>;
  error?: {
    message: string;
  };
}> => {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) throw new Error("Uauthorized");

    let users: User[];

    if (include_me) {
      users = await getUsersQuery();
    } else {
      users = await getUserWithoutMeQuery(session.user.id);
    }

    return {
      data: users,
    };
  } catch (err: any) {
    return {
      error: {
        message: err.message || "Something went wrong, please try again.",
      },
    };
  }
};
