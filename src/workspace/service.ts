import { db } from "../prisma/db";
import type { CreateWorkspaceInput } from "./schema";

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
