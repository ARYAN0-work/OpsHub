import type { NextFunction, Request, Response } from "express";

type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER";

export const requireRole = (...allowedRoles: WorkspaceRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.workspace) {
      return res.status(403).json({
        error: "Workspace context required",
      });
    }

    if (!allowedRoles.includes(req.workspace.role)) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    next();
  };
};
