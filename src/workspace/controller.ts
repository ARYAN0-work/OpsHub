import type { Request, Response } from "express";
import { createWorkspaceSchema, addMemberSchema } from "./schema";
import {
  createWorkspace,
  listWorkspaces,
  getWorkspace,
  deleteWorkspace,
  addMember,
  listMembers,
} from "./service";

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

export const get = async (req: Request, res: Response) => {
  if (!req.workspace) {
    return res.status(403).json({
      error: "Forbidden",
    });
  }

  const workspace = await getWorkspace(req.workspace.id);

  if (!workspace) {
    return res.status(404).json({
      error: "Workspace not found",
    });
  }

  return res.status(200).json({
    workspace,
    role: req.workspace.role,
  });
};

export const remove = async (req: Request, res: Response) => {
  if (!req.workspace) {
    return res.status(403).json({
      error: "Forbidden",
    });
  }

  await deleteWorkspace(req.workspace.id);

  return res.status(204).send();
};

export const add = async (req: Request, res: Response) => {
  if (!req.workspace) {
    return res.status(403).json({
      error: "Forbidden",
    });
  }

  const result = addMemberSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: result.error.issues,
    });
  }

  try {
    const membership = await addMember(req.workspace.id, result.data);

    return res.status(201).json({
      membership,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "User not found") {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "User is already a member"
    ) {
      return res.status(409).json({
        error: "User is already a member",
      });
    }

    throw error;
  }
};

export const members = async (req: Request, res: Response) => {
  if (!req.workspace) {
    return res.status(403).json({
      error: "Forbidden",
    });
  }

  const members = await listMembers(req.workspace.id);

  return res.status(200).json({
    members,
  });
};
