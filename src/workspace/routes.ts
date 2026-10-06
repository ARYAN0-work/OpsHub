import { Router } from "express";
import { requireAuth } from "../auth/middleware";
import { create, get, list, remove } from "./controller";
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

export default router;
