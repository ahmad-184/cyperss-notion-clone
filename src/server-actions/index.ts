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
  WorkspaceType,
} from "@prisma/client";
import {
  collaboratingWorkspacesQuery,
  createCollaboratorQuery,
  createFolderQuery,
  createWorkspaceQuery,
  getUsersQuery,
  getUserSubscriptioQuery,
  getUserWithoutMeQuery,
  privateWorkspacesQuery,
  sharedWorkspacesQuery,
} from "./queries";
import { validatUser } from "@/lib/validateUser";
import { ZodError } from "zod";
import { changeFileFolderTitleActionValidator } from "@/lib/validations";
import { validate } from "uuid";
import { rateLimit } from "@/lib/rateLimit";
import { headers } from "next/headers";

export const getUserSubscription = async (
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

export const updateUserDetail = async (
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

    const updatedUser = await db.user.update({
      where: {
        id: validatedUser.id,
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
  data: WorkspacePayload
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

export const getWorkspaceCollaborators = async ({
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

    const res = await db.collaborator.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            email: true,
            id: true,
          },
        },
      },
    });

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

export const getWorkspaces = async (): Promise<{
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

    const [privateWorkspaces, sharedWorkspaces, collaboratingWorkspaces] =
      await Promise.all([
        privateWorkspacesQuery(userId),
        sharedWorkspacesQuery(userId),
        collaboratingWorkspacesQuery(userId),
      ]);

    const data: WorkspaceTypes[] = [
      ...privateWorkspaces,
      ...sharedWorkspaces,
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

export const updateWorkspaceSettings = async (data: {
  workspaceId: string;
  title: string;
  type: WorkspaceType;
  imageUrl?: string;
  icon: string;
  collaborators?: User[];
}): Promise<{
  data?: WorkspaceTypes | null;
  error?: { message: string };
}> => {
  try {
    const { validatedUser, error } = await validatUser();
    if (error) throw new Error(error || "Unauthorized");
    if (!validatedUser?.id) throw new Error();

    if (!data.workspaceId) throw new Error("workspace id required");
    if (!data.title || !data.type)
      throw new Error("workspace title and type required.");

    const payload = {
      title: data.title,
      type: data.type,
      iconId: data.icon,
      ...(data.imageUrl && { image: data.imageUrl }),
    };

    await db.workspace.update({
      where: { id: data.workspaceId },
      data: payload,
    });

    if (data.collaborators?.length && data.type === "shared") {
      await Promise.all([
        data.collaborators.forEach(async (w) => {
          const isColExists = await db.collaborator.findFirst({
            where: { workspaceId: data.workspaceId, userId: w.id! },
          });
          if (!isColExists) {
            await createCollaboratorQuery(data.workspaceId, w);
          }
        }),
      ]);

      const userIds = data.collaborators.map((e) => e.id!);
      await db.collaborator.deleteMany({
        where: {
          workspaceId: data.workspaceId,
          userId: {
            notIn: userIds,
          },
        },
      });
    }

    if (data.type === "private") {
      const thereIsCollaborators = await db.collaborator.findFirst({
        where: { workspaceId: data.workspaceId },
      });
      if (thereIsCollaborators) {
        await db.collaborator.deleteMany({
          where: { workspaceId: data.workspaceId },
        });
      }
    }

    const updatedRes = await db.workspace.findUnique({
      where: {
        id: data.workspaceId,
      },
      include: {
        folders: {
          include: {
            files: true,
          },
        },
        collaborators: {
          select: {
            user: {
              select: {
                id: true,
                image: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

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

// export const updateWorkspace = async ({
//   workspaceId,
//   data,
// }: {
//   workspaceId: string;
//   data: Partial<Workspace>;
// }): Promise<{
//   data?: WorkspaceTypes;
//   error?: { message: string };
// }> => {
//   try {
//     if (!workspaceId) throw new Error("workspace id required");
//     const isIdValid = validate(workspaceId);
//     if (!isIdValid) throw new Error("invalid uuid type");

//     const res = await db.workspace.update({
//       where: { id: workspaceId },
//       data,
//       include: {
//         folders: {
//           include: {
//             files: true,
//           },
//         },
//         collaborators: {
//           select: {
//             user: {
//               select: {
//                 id: true,
//                 image: true,
//                 name: true,
//                 email: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!res.id) throw new Error();

//     return {
//       data: res,
//     };
//   } catch (err: any) {
//     return {
//       error: {
//         message: err.message || "Something went wrong, please try again",
//       },
//     };
//   }
// };

// export const changeWorkspaceType = async ({
//   workspaceId,
//   type,
// }: {
//   workspaceId: string;
//   type: WorkspaceType;
// }): Promise<{
//   data?: WorkspaceTypes;
//   error?: { message: string };
// }> => {
//   try {
//     if (!workspaceId) throw new Error("workspace id required");
//     const isIdValid = validate(workspaceId);
//     if (!isIdValid) throw new Error("invalid uuid type");
//     if (!type) throw new Error("workspace type required");

//     await db.workspace.update({
//       where: { id: workspaceId },
//       data: {
//         type,
//       },
//     });

//     if (type === "private") {
//       await db.collaborator.deleteMany({ where: { workspaceId } });
//     }

//     const updatedRes = await db.workspace.findUnique({
//       where: {
//         id: workspaceId,
//       },
//       include: {
//         folders: {
//           include: {
//             files: true,
//           },
//         },
//         collaborators: {
//           select: {
//             user: {
//               select: {
//                 id: true,
//                 image: true,
//                 name: true,
//                 email: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!updatedRes?.id) throw new Error();

//     return {
//       data: updatedRes,
//     };
//   } catch (err: any) {
//     return {
//       error: {
//         message: err.message || "Something went wrong, please try again",
//       },
//     };
//   }
// };

export const deleteWorkspace = async ({
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

export const getWorkspaceById = async (
  id: string
): Promise<{
  data?: WorkspaceTypes | null;
  error?: {
    message: string | null;
  };
}> => {
  try {
    const { validatedUser, error } = await validatUser();
    if (error) throw new Error(error || "Unauthorized");
    if (!validatedUser?.id) throw new Error();

    const options = {
      where: {
        id,
      },
      include: {
        folders: {
          include: {
            files: true,
          },
        },
        collaborators: {
          select: {
            user: {
              select: {
                id: true,
                image: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    };

    const data = await db.workspace.findUnique(options);

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

export const createFolder = async (data: {
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

    const { data: subscription, error: subsError } = await getUserSubscription(
      validatedUser.id
    );

    if (subsError)
      return {
        error: {
          message: subsError || "Something went wrong, please try again",
        },
      };

    const folders = await db.folder.findMany({
      where: { workspaceId: data.folder.workspaceId },
    });

    if (subscription?.status !== "active" && folders.length >= 3)
      return { error: { message: "Reached to limit folder" } };

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

export const getFolderbyId = async (
  id: string
): Promise<{
  data?: FolderType;
  error?: {
    message: string;
  };
}> => {
  try {
    if (!id) throw new Error("folder id required");
    const folder = await db.folder.findUnique({
      where: {
        id,
      },
      include: {
        files: true,
      },
    });

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

export type FileFolderType = "folder" | "file";

export const changeIconAction = async ({
  type,
  id,
  emoji,
}: {
  type: FileFolderType;
  id: string;
  emoji: string;
}): Promise<{
  data?: File | Folder;
  error?: {
    message: string;
  };
}> => {
  try {
    const { validatedUser, error } = await validatUser();
    if (error) throw new Error(error || "Unauthorized");
    if (!validatedUser?.id) throw new Error();

    if (!type)
      return {
        error: {
          message: "type is required",
        },
      };
    if (!emoji) return { error: { message: "emoji is required" } };

    let data: File | Folder;

    if (type === "folder") {
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

export const changeFileFolderTitleAction = async (data: {
  type: FileFolderType;
  id: string;
  title: string;
}): Promise<{
  data?: File | Folder | null;
  error?: {
    message: string;
  };
}> => {
  try {
    const { validatedUser, error } = await validatUser();
    if (error) throw new Error(error || "Unauthorized");
    if (!validatedUser?.id) throw new Error();

    const { type, id, title } =
      await changeFileFolderTitleActionValidator.parse(data);

    let resData: File | Folder;

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

export const createFile = async (
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

export const getFilebyId = async (
  id: string
): Promise<{
  data?: File;
  error?: {
    message: string;
  };
}> => {
  try {
    if (!id) throw new Error("folder id required");
    const file = await db.file.findUnique({
      where: {
        id,
      },
    });

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

export const deleteFolderFile = async (data: {
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
