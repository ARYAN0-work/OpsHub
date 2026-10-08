import { db } from "../prisma/db";
import type {
  CreateWorkspaceInput,
  AddMemberInput,
  UpdateMemberRoleInput,
} from "./schema";

export const createWorkspace = async (
  userId: number,
  input: CreateWorkspaceInput,
) => {
  return db.transaction(async (tx) => {
    const workspace = await tx.orm.public.Workspace.create({
      name: input.name,
      slug: input.slug,
    });

    await tx.orm.public.Membership.create({
      userId,
      workspaceId: workspace.id,
      role: "OWNER",
    });

    return workspace;
  });
};

export const listWorkspaces = async (userId: number) => {
  return db.orm.public.Membership.where({ userId }).include("workspace").all();
};

export const getWorkspace = async (workspaceId: number) => {
  return db.orm.public.Workspace.where({ id: workspaceId }).all().first();
};

export const deleteWorkspace = async (workspaceId: number) => {
  await db.orm.public.Workspace.where({ id: workspaceId }).delete();
};

export const addMember = async (workspaceId: number, input: AddMemberInput) => {
  const user = await db.orm.public.User.where({ id: input.userId })
    .all()
    .first();

  if (!user) {
    throw new Error("User not found");
  }

  const existingMembership = await db.orm.public.Membership.where({
    userId: input.userId,
    workspaceId,
  })
    .all()
    .first();

  if (existingMembership) {
    throw new Error("User is already a member");
  }

  return db.orm.public.Membership.create({
    userId: input.userId,
    workspaceId,
    role: input.role,
  });
};

export const listMembers = async (workspaceId: number) => {
  return db.orm.public.Membership.where({ workspaceId }).include("user").all();
};

export const updateMemberRole = async (
  workspaceId: number,
  userId: number,
  input: UpdateMemberRoleInput,
) => {
  const membership = await db.orm.public.Membership.where({
    workspaceId,
    userId,
  })
    .all()
    .first();

  if (!membership) {
    throw new Error("Membership not found");
  }

  if (membership.role === "OWNER") {
    throw new Error("Cannot change owner role");
  }

  return db.orm.public.Membership.where({
    workspaceId,
    userId,
  }).update({
    role: input.role,
  });
};

export const removeMember = async (
  workspaceId: number,
  userId: number,
  requesterRole: "OWNER" | "ADMIN" | "MEMBER",
) => {
  const membership = await db.orm.public.Membership.where({
    workspaceId,
    userId,
  })
    .all()
    .first();

  if (!membership) {
    throw new Error("Membership not found");
  }

  if (membership.role === "OWNER") {
    throw new Error("Cannot remove owner");
  }

  if (requesterRole === "ADMIN" && membership.role === "ADMIN") {
    throw new Error("Admin cannot remove another admin");
  }

  await db.orm.public.Membership.where({
    workspaceId,
    userId,
  }).delete();
};
