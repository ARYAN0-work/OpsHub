import { Router } from "express";
import { requireAuth } from "../auth/middleware";
import {
  create,
  get,
  list,
  remove,
  add,
  members,
  updateRole,
  removeMember,
  leave,
} from "./controller";
import { workspaceContext } from "./middleware";
import { requireRole } from "./rbac";

const router = Router();

router.post("/", requireAuth, create);
router.get("/", requireAuth, list);
router.get("/:workspaceId", requireAuth, workspaceContext, get);
router.delete(
  "/:workspaceId",
  requireAuth,
  workspaceContext,
  requireRole("OWNER"),
  remove,
);
router.post(
  "/:workspaceId/members",
  requireAuth,
  workspaceContext,
  requireRole("OWNER", "ADMIN"),
  add,
);
router.get("/:workspaceId/members", requireAuth, workspaceContext, members);
router.patch(
  "/:workspaceId/members/:userId",
  requireAuth,
  workspaceContext,
  requireRole("OWNER"),
  updateRole,
);
router.delete(
  "/:workspaceId/members/:userId",
  requireAuth,
  workspaceContext,
  requireRole("OWNER", "ADMIN"),
  removeMember,
);
router.delete("/:workspaceId/leave", requireAuth, workspaceContext, leave);

export default router;
