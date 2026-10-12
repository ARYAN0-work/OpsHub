import { Router } from "express";
import { requireAuth } from "../auth/middleware";
import { workspaceContext } from "../workspace/middleware";
import { requireRole } from "../workspace/rbac";
import { create, list } from "./controller";

const router = Router();

router.post(
  "/:workspaceId/channels",
  requireAuth,
  workspaceContext,
  requireRole("OWNER", "ADMIN"),
  create,
);

router.get("/:workspaceId/channels", requireAuth, workspaceContext, list);

export default router;
