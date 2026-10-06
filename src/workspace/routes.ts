import { Router } from "express";
import { requireAuth } from "../auth/middleware";
import { create, get, list } from "./controller";
import { workspaceContext } from "./middleware";

const router = Router();

router.post("/", requireAuth, create);
router.get("/", requireAuth, list);
router.get("/:workspaceId", requireAuth, workspaceContext, get);

export default router;
