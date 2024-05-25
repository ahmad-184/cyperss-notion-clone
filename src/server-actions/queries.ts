import { db } from "@/lib/db";
import { User, WorkspacePayload, WorkspaceTypes } from "@/types";
import { File, Folder } from "@prisma/client";

export const getUserSubscriptioQuery = async (userId: string) => {
  return db.subscription.findFirst({
    where: {
      user_id: userId,
    },
  });
};

export const createWorkspaceQuery = async (data: WorkspacePayload) => {
  return await db.workspace.create({
    data: data,
  });
};

export const privateWorkspacesQuery = async (userId: string) => {
  return await db.workspace.findMany({
    where: {
      workspaceOwnerId: userId,
      type: "private",
    },
    orderBy: { createdAt: "asc" },
    include: {
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
      folders: {
        include: {
          files: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
};

export const getUserWorkspacesFullData = async (userId: string) => {
  return await db.workspace.findMany({
    where: {
      workspaceOwnerId: userId,
    },
    orderBy: { createdAt: "asc" },
    include: {
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
      folders: {
        include: {
          files: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
};

export const sharedWorkspacesQuery = async (userId: string) => {
  return await db.workspace.findMany({
    where: {
      workspaceOwnerId: userId,
      type: "shared",
    },
    orderBy: { createdAt: "asc" },
    include: {
      folders: {
        include: {
          files: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
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
};

export const collaboratingWorkspacesQuery = async (userId: string) => {
  return await db.workspace.findMany({
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
    include: {
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
      folders: {
        include: {
          files: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
};

export const getUsersQuery = async () => {
  return await db.user.findMany({
    select: {
      id: true,
      image: true,
      name: true,
      email: true,
    },
  });
};

export const getUserWithoutMeQuery = async (userId: string) => {
  return await db.user.findMany({
    where: {
      id: {
        not: userId,
      },
    },
    select: {
      id: true,
      image: true,
      name: true,
      email: true,
    },
  });
};

export const createCollaboratorQuery = async (
  workspaceId: string,
  collaborator: User
) => {
  return await db.collaborator.create({
    data: {
      userId: collaborator.id as string,
      workspaceId,
    },
  });
};

export const createFolderQuery = async (payload: Folder) => {
  return await db.folder.create({
    data: payload,
  });
};

export const getFullDataWorkspaceByIdQuery = async (workspaceId: string) => {
  return (await db.workspace.findUnique({
    where: {
      id: workspaceId,
    },
    include: {
      folders: {
        include: {
          files: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
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
  })) as WorkspaceTypes;
};

export const getWorkspaceByIdQuery = async (workspaceId: string) => {
  return await db.workspace.findUnique({
    where: {
      id: workspaceId,
    },
  });
};

export const getWorkspaceCollaboratorsQuery = async (workspaceId: string) => {
  return await db.collaborator.findMany({
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
};

export const updateFolderQuery = async (
  folderId: string,
  payload: Partial<Folder>
) => {
  return await db.folder.update({
    where: { id: folderId },
    data: {
      ...payload,
    },
  });
};

export const getFullDataFolderByIdQuery = async (id: string) => {
  return await db.folder.findUnique({
    where: {
      id,
    },
    include: {
      files: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
};

export const getFolderByIdQuery = async (id: string) => {
  return await db.folder.findUnique({
    where: {
      id,
    },
  });
};

export const updateFileQuery = async (
  fileId: string,
  payload: Partial<File>
) => {
  return await db.file.update({
    where: { id: fileId },
    data: {
      ...payload,
    },
  });
};

export const getFileByIdQuery = async (id: string) => {
  return await db.file.findUnique({
    where: {
      id,
    },
  });
};
