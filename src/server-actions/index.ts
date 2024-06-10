"use server";

import { db } from "@/lib/db";
import {
  ChangeInTrashStatusTypes,
  FolderType,
  User,
  WorkspacePayload,
  WorkspaceTypes,
} from "@/types";
import {
  Subscription,
  Collaborator,
  Folder,
  File,
  Workspace,
} from "@prisma/client";
import {
  collaboratingWorkspacesQuery,
  createCollaboratorQuery,
  createFolderQuery,
  createWorkspaceQuery,
  getFileByIdQuery,
  getFolderByIdQuery,
  getFullDataFolderByIdQuery,
  getFullDataWorkspaceByIdQuery,
  getUsersQuery,
  getUserSubscriptioQuery,
  getUserWithoutMeQuery,
  getUserWorkspacesFullData,
  getWorkspaceByIdQuery,
  getWorkspaceCollaboratorsQuery,
  updateFileQuery,
  updateFolderQuery,
} from "./queries";
import { validatUser } from "@/lib/validateUser";
import { ZodError } from "zod";
import { changeItemTitleActionValidator } from "@/lib/validations";
import { validate } from "uuid";
import { rateLimit } from "@/lib/rateLimit";
import { headers } from "next/headers";

export const getUserSubscriptionAction = async (
  userId: string
): Promise<{
  data: Subscription | null;
  error: string | null;
}> => {
  try {
    const { validatedUser, error } = await validatUser();
    if (error) throw new Error(error || "Unauthorized");
    if (!validatedUser?.id) throw new Error();

    const sub = await getUserSubscriptioQuery(validatedUser.id);

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

export const updateUserDetailAction = async (
  data: User
): Promise<{
  data?: User;
  error?: {
    message: string | null;
  };
}> => {
  try {
    const { validatedUser, error } = await validatUser();
    if (error) throw new Error(error || "Unauthorized");
    if (!validatedUser?.id) throw new Error();

    const payload = {
      name: data.name,
      image: data.image,
    };

    const updatedUser = await db.user.update({
      where: {
        id: validatedUser.id,
      },
      data: payload,
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

export const createWorkspaceAction = async (
  data: WorkspacePayload
): Promise<{
  data?: Workspace;
  error?: {
    message: string | null;
  };
}> => {
  try {
    const { validatedUser, error } = await validatUser();
    if (error) throw new Error(error || "Unauthorized");
    if (!validatedUser?.id) throw new Error();

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

export const createCollaboratorsAction = async ({
  workspaceId,
  collaborators,
}: {
  workspaceId: string;
  collaborators: User[];
}) => {
  try {
    const { validatedUser, error } = await validatUser();
    if (error) throw new Error(error || "Unauthorized");
    if (!validatedUser?.id) throw new Error();

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

export const getWorkspaceCollaboratorsAction = async ({
  workspaceId,
}: {
  workspaceId: string;
}): Promise<{
  data?: (Collaborator & { user: User })[];
  error?: {
    message: string | null;
  };
}> => {
  try {
    if (!workspaceId) throw new Error("workspace id required");

    const res = await getWorkspaceCollaboratorsQuery(workspaceId);

    return {
      data: res,
    };
  } catch (err: any) {
    return {
      error: {
        message: err.message || "Something went wrong, please try again",
      },
    };
  }
};

export const getWorkspacesAction = async (): Promise<{
  data?: WorkspaceTypes[];
  error?: {
    message: string | null;
  };
}> => {
  try {
    const { validatedUser, error } = await validatUser();
    if (error) throw new Error(error || "Unauthorized");
    if (!validatedUser?.id) throw new Error();

    const userId = validatedUser.id;

    const [userWorkspaces, collaboratingWorkspaces] = await Promise.all([
      getUserWorkspacesFullData(userId),
      collaboratingWorkspacesQuery(userId),
    ]);

    const data: WorkspaceTypes[] = [
      ...userWorkspaces,
      ...collaboratingWorkspaces,
    ];

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

export const getWorkspacesListAction = async (
  userId: string
): Promise<{
  data?: Workspace[] | null | [];
  error?: { message: string };
}> => {
  try {
    const { validatedUser, error } = await validatUser();
    if (error) throw new Error(error || "Unauthorized");
    if (!validatedUser?.id) throw new Error();

    if (!userId) throw new Error("user id is required");

    const [userOwn, collabrating] = await Promise.all([
      await db.workspace.findMany({
        where: { workspaceOwnerId: userId },
        orderBy: { createdAt: "asc" },
      }),
      await db.workspace.findMany({
        where: {
          workspaceOwnerId: {
            not: userId,
          },
          collaborators: {
            some: {
              userId: userId,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    return {
      data: [...userOwn, ...collabrating],
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

export const updateWorkspaceAction = async ({
  workspaceId,
  data,
  collaborators,
}: {
  workspaceId: string;
  data: Partial<Workspace>;
  collaborators?: User[];
}): Promise<{
  data?: Workspace | null;
  error?: { message: string };
}> => {
  try {
    const { validatedUser, error } = await validatUser();
    if (error) throw new Error(error || "Unauthorized");
    if (!validatedUser?.id) throw new Error();

    if (!workspaceId) throw new Error("workspace id required");

    const payload = { ...data };

    await db.workspace.update({
      where: { id: workspaceId },
      data: payload,
    });

    if (collaborators?.length && data.type === "shared") {
      await Promise.all([
        collaborators.forEach(async (w) => {
          // if (!data.id) throw new Error("workspace id required");
          const isColExists = await db.collaborator.findFirst({
            where: { workspaceId: workspaceId, userId: w.id! },
          });
          if (!isColExists) {
            await createCollaboratorQuery(workspaceId, w);
          }
        }),
      ]);

      const userIds = collaborators.map((e) => e.id!);
      await db.collaborator.deleteMany({
        where: {
          workspaceId: workspaceId,
          userId: {
            notIn: userIds,
          },
        },
      });
    }

    if (data.type === "private") {
      const thereIsCollaborators = await db.collaborator.findFirst({
        where: { workspaceId: workspaceId },
      });
      if (thereIsCollaborators) {
        await db.collaborator.deleteMany({
          where: { workspaceId: workspaceId },
        });
      }
    }

    const updatedRes = await getWorkspaceByIdQuery(workspaceId);

    return {
      data: updatedRes,
    };
  } catch (err: any) {
    return {
      error: {
        message: err.message || "Something went wrong, please try again",
      },
    };
  }
};

export const deleteWorkspaceAction = async ({
  workspaceId,
}: {
  workspaceId: string;
}): Promise<{
  status: "ok" | "error";
  error?: { message: string };
}> => {
  try {
    if (!workspaceId) throw new Error("workspace id required");
    const isIdValid = validate(workspaceId);
    if (!isIdValid) throw new Error("invalid uuid type");

    const res = await db.workspace.delete({ where: { id: workspaceId } });

    if (!res.id) throw new Error();

    return {
      status: "ok",
    };
  } catch (err: any) {
    return {
      status: "error",
      error: {
        message: err.message || "Something went wrong, please try again",
      },
    };
  }
};

export const getFullDataWorkspaceByIdAction = async (
  id: string
): Promise<{
  data?: WorkspaceTypes;
  error?: {
    message: string | null;
  };
}> => {
  try {
    const { validatedUser, error } = await validatUser();
    if (error) throw new Error(error || "Unauthorized");
    if (!validatedUser?.id) throw new Error();

    const data = await getFullDataWorkspaceByIdQuery(id);

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

export const getWorkspaceByIdAction = async (
  id: string
): Promise<{
  data?: Workspace;
  error?: {
    message: string | null;
  };
}> => {
  try {
    const { validatedUser, error } = await validatUser();
    if (error) throw new Error(error || "Unauthorized");
    if (!validatedUser?.id) throw new Error();

    const data = await getFullDataWorkspaceByIdQuery(id);

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

export const getUsersAction = async (
  include_me?: boolean
): Promise<{
  data?: Required<User[]>;
  error?: {
    message: string;
  };
}> => {
  try {
    const { validatedUser, error } = await validatUser();
    if (error) throw new Error(error || "Unauthorized");
    if (!validatedUser?.id) throw new Error();

    let users: User[];

    if (include_me) {
      users = await getUsersQuery();
    } else {
      users = await getUserWithoutMeQuery(validatedUser.id);
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

export const createFolderAction = async (data: {
  folder: Folder;
  userId: string;
}): Promise<{
  data?: Folder;
  error?: {
    message: string;
  };
}> => {
  try {
    const { validatedUser, error } = await validatUser();
    if (error) throw new Error(error || "Unauthorized");
    if (!validatedUser?.id) throw new Error();

    // const { data: subscription, error: subsError } =
    //   await getUserSubscriptionAction(validatedUser.id);

    // if (subsError)
    //   return {
    //     error: {
    //       message: subsError || "Something went wrong, please try again",
    //     },
    //   };

    // const folders = await db.folder.findMany({
    //   where: { workspaceId: data.folder.workspaceId },
    // });

    // if (subscription?.status !== "active" && folders.length >= 3)
    //   return { error: { message: "Reached to limit folder" } };

    const payload = data.folder;

    if (!payload)
      return {
        error: { message: "folder data required" },
      };

    const newFolder = await createFolderQuery(payload);

    return {
      data: newFolder,
    };
  } catch (err: any) {
    return {
      error: {
        message: err.message || "Something went wrong, please try again.",
      },
    };
  }
};

export const updateFolderAction = async ({
  folderId,
  data,
}: {
  folderId: string;
  data: Partial<Folder>;
}): Promise<{
  data?: Folder | null;
  error?: {
    message: string;
  };
}> => {
  try {
    if (!folderId) throw new Error("folder id required");

    let payload: Partial<Folder> = data;

    const updatedFile = await updateFolderQuery(folderId, payload);

    return {
      data: updatedFile,
    };
  } catch (err: any) {
    return {
      error: {
        message: err.message || "Something went wrong, please try again",
      },
    };
  }
};

export const getFullDataFolderbyIdAction = async (
  id: string
): Promise<{
  data?: FolderType;
  error?: {
    message: string;
  };
}> => {
  try {
    if (!id) throw new Error("folder id required");
    const folder = await getFullDataFolderByIdQuery(id);

    if (!folder) throw new Error();

    return {
      data: folder,
    };
  } catch (err: any) {
    return {
      error: {
        message: err.message || "Something went wrong, please try again",
      },
    };
  }
};

export const getFolderByIdAction = async (
  id: string
): Promise<{
  data?: Folder;
  error?: {
    message: string;
  };
}> => {
  try {
    if (!id) throw new Error("folder id required");
    const folder = await getFolderByIdQuery(id);

    if (!folder) throw new Error();

    return {
      data: folder,
    };
  } catch (err: any) {
    return {
      error: {
        message: err.message || "Something went wrong, please try again",
      },
    };
  }
};

export type FileFolderType = "folder" | "file" | "workspace";

export const changeIconAction = async ({
  type,
  id,
  emoji,
}: {
  type: FileFolderType;
  id: string;
  emoji: string;
}): Promise<{
  data?: File | Folder | Workspace;
  error?: {
    message: string;
  };
}> => {
  try {
    if (!type)
      return {
        error: {
          message: "type is required",
        },
      };
    if (!emoji) return { error: { message: "emoji is required" } };

    let data: File | Folder | Workspace;

    if (type === "workspace") {
      const res = await db.workspace.update({
        where: { id },
        data: { iconId: emoji },
      });
      data = res;
      if (!data) return { error: { message: "Could not update the icon" } };

      return {
        data,
      };
    } else if (type === "folder") {
      const res = await db.folder.update({
        where: { id },
        data: { iconId: emoji },
      });
      data = res;
      if (!data) return { error: { message: "Could not update the icon" } };

      return {
        data,
      };
    } else if (type === "file") {
      const res = await db.file.update({
        where: { id },
        data: { iconId: emoji },
      });
      data = res;

      if (!data) return { error: { message: "Could not update the icon" } };

      return {
        data,
      };
    } else {
      return {
        error: {
          message: "Something went wrong, please try again.",
        },
      };
    }
  } catch (err) {
    console.log(err);
    return {
      error: { message: "Something went wrong, please try again." },
    };
  }
};

export const changeItemTitleAction = async (data: {
  type: FileFolderType;
  id: string;
  title: string;
}): Promise<{
  data?: File | Folder | Workspace | null;
  error?: {
    message: string;
  };
}> => {
  try {
    const { type, id, title } = await changeItemTitleActionValidator.parse(
      data
    );

    let resData: File | Folder | Workspace;

    if (type === "workspace") {
      const res = await db.workspace.update({
        where: { id },
        data: { title },
      });
      resData = res;
      if (!data) return { error: { message: "Could not update the icon" } };

      return {
        data: resData,
      };
    }
    if (type === "folder") {
      const res = await db.folder.update({
        where: { id },
        data: { title },
      });
      resData = res;
      if (!data) return { error: { message: "Could not update the icon" } };

      return {
        data: resData,
      };
    } else if (type === "file") {
      const res = await db.file.update({
        where: { id },
        data: { title },
      });
      resData = res;

      if (!data) return { error: { message: "could not update the icon" } };

      return {
        data: resData,
      };
    } else {
      return {
        error: {
          message: "Something went wrong, please try again.",
        },
      };
    }
  } catch (err) {
    console.log(err);
    if (err instanceof ZodError)
      return {
        error: {
          message: err.errors[0].message,
        },
      };
    return {
      error: { message: "Something went wrong, please try again." },
    };
  }
};

export const createFileAction = async (
  data: File
): Promise<{ data?: File; error?: { message: string } }> => {
  try {
    const { validatedUser, error } = await validatUser();
    if (error) throw new Error(error || "Unauthorized");
    if (!validatedUser?.id) throw new Error();

    if (!data)
      return {
        error: { message: "File data required" },
      };

    const res = await db.file.create({
      data,
    });

    if (res) {
      return {
        data: res,
      };
    } else throw new Error();
  } catch (err) {
    return {
      error: { message: "Something went wrong, please try again" },
    };
  }
};

export const updateFileAction = async ({
  fileId,
  data,
}: {
  fileId: string;
  data: Partial<File>;
}): Promise<{
  data?: File | null;
  error?: {
    message: string;
  };
}> => {
  try {
    if (!fileId) throw new Error("");

    let payload: Partial<File> = data;

    const updatedFile = await updateFileQuery(fileId, payload);

    return {
      data: updatedFile,
    };
  } catch (err: any) {
    return {
      error: {
        message: err.message || "Something went wrong, please try again",
      },
    };
  }
};

export const getFilebyIdAction = async (
  id: string
): Promise<{
  data?: File;
  error?: {
    message: string;
  };
}> => {
  try {
    if (!id) throw new Error("folder id required");
    const file = await getFileByIdQuery(id);

    if (!file) throw new Error();

    return {
      data: file,
    };
  } catch (err: any) {
    return {
      error: {
        message: err.message || "Something went wrong, please try again",
      },
    };
  }
};

export const changeInTrashStatusAction = async (
  data: ChangeInTrashStatusTypes
): Promise<{
  data?: File | Folder;
  error?: { message: string };
}> => {
  try {
    if (!data) throw new Error();

    const { inTrashBy, id, inTrash, type } = data;

    let resData;

    if (type === "folder") {
      resData = await db.folder.update({
        where: {
          id,
        },
        data: {
          inTrash,
          inTrashBy,
        },
      });
    }

    if (type === "file") {
      resData = await db.file.update({
        where: {
          id,
        },
        data: {
          inTrash,
          inTrashBy,
        },
      });
    }

    if (!resData) throw new Error();

    return {
      data: resData,
    };
  } catch (err) {
    return {
      error: { message: "Something went wrong, please try again" },
    };
  }
};

export const deleteFolderFileAction = async (data: {
  type: ChangeInTrashStatusTypes["type"];
  id: string;
}): Promise<{
  data?: Folder | File;
  error?: { message: string };
}> => {
  try {
    if (!data) throw new Error();
    const { type, id } = data;

    let resData;

    if (type === "folder") resData = await db.folder.delete({ where: { id } });

    if (type === "file") resData = await db.file.delete({ where: { id } });

    return {
      data: resData,
    };
  } catch (err) {
    return {
      error: {
        message: "Something went wrong, please try again",
      },
    };
  }
};

export const rateLimitterAction = async ({
  limit = 4,
  duration = 10,
  identifier,
}: {
  limit?: number;
  duration?: number;
  identifier?: string;
}): Promise<{
  status: "ok" | "err";
  error?: { message: string };
}> => {
  try {
    const header = await headers();
    const ip = header.get("x-forwarded-for") as string;
    const rateLimitter = await rateLimit({ limit, duration });
    const { success } = await rateLimitter.limit(identifier || ip);
    if (!success) throw new Error("Too many request");
    return { status: "ok" };
  } catch (err: any) {
    return {
      status: "err",
      error: {
        message: err.message || "Too many request",
      },
    };
  }
};
