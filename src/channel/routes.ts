import { Router } from "express";
import { requireAuth } from "../auth/middleware";
import { workspaceContext } from "../workspace/middleware";
import { requireRole } from "../workspace/rbac";
import { create } from "./controller";

const router = Router();

router.post(
  "/:workspaceId/channels",
  requireAuth,
  workspaceContext,
  requireRole("OWNER", "ADMIN"),
  create,
);

export default router;
