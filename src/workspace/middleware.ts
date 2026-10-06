import type { NextFunction, Request, Response } from "express";
import { db } from "../prisma/db";

export const workspaceContext = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  const workspaceId = Number(req.params.workspaceId);

  if (!Number.isInteger(workspaceId) || workspaceId <= 0) {
    return res.status(400).json({
      error: "Invalid workspace ID",
    });
  }

  const membership = await db.orm.public.Membership.where({
    userId: req.user.id,
    workspaceId,
  })
    .all()
    .first();

  if (!membership) {
    return res.status(403).json({
      error: "Forbidden",
    });
  }

  req.workspace = {
    id: membership.workspaceId,
    role: membership.role,
  };

  next();
};
