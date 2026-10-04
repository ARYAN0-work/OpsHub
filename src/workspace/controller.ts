import type { Request, Response } from "express";
import { createWorkspaceSchema } from "./schema";
import { createWorkspace, listWorkspaces } from "./service";

export const create = async (req: Request, res: Response) => {
  const result = createWorkspaceSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: result.error.issues,
    });
  }

  if (!req.user) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  const workspace = await createWorkspace(req.user.id, result.data);

  return res.status(201).json({
    workspace,
  });
};

export const list = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  const workspaces = await listWorkspaces(req.user.id);

  return res.status(200).json({
    workspaces,
  });
};
