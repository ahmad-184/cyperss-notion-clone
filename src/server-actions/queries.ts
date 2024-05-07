import { db } from "@/lib/db";
import { User, WorkspacePayload } from "@/types";
import { Folder } from "@prisma/client";

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
          files: true,
        },
      },
    },
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
    include: {
      files: true,
    },
  });
};
