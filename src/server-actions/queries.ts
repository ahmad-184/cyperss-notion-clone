import { db } from "@/lib/db";
import { User } from "@/types";
import {
  collaborator as Collaborator,
  workspace as Workspace,
} from "@prisma/client";

export const getUserSubscriptioQuery = async (userId: string) => {
  return db.subscription.findFirst({
    where: {
      user_id: userId,
    },
  });
};

export const createWorkspaceQuery = async (
  data: Omit<Workspace, "createdAt">
) => {
  return await db.workspace.create({
    data: data,
    include: {
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
    include: {
      folders: {
        include: {
          files: true,
        },
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
    include: {
      folders: {
        include: {
          files: true,
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
    include: {
      collaborators: true,
      folders: {
        include: { files: true },
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
