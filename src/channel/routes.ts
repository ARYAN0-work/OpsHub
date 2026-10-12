import { Router } from "express";
import { requireAuth } from "../auth/middleware";
import { workspaceContext } from "../workspace/middleware";
import { requireRole } from "../workspace/rbac";
import { create, list, get, update, remove } from "./controller";

const router = Router();

router.post(
  "/:workspaceId/channels",
  requireAuth,
  workspaceContext,
  requireRole("OWNER", "ADMIN"),
  create,
);

router.get("/:workspaceId/channels", requireAuth, workspaceContext, list);

router.get(
  "/:workspaceId/channels/:channelId",
  requireAuth,
  workspaceContext,
  get,
);

router.patch(
  "/:workspaceId/channels/:channelId",
  requireAuth,
  workspaceContext,
  requireRole("OWNER", "ADMIN"),
  update,
);

router.delete(
  "/:workspaceId/channels/:channelId",
  requireAuth,
  workspaceContext,
  requireRole("OWNER"),
  remove,
);

export default router;
