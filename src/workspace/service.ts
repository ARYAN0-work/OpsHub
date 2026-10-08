import { db } from "../prisma/db";
import type { CreateWorkspaceInput, AddMemberInput } from "./schema";

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
