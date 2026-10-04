import { Router } from "express";
import { requireAuth } from "../auth/middleware";
import { create, list } from "./controller";

const router = Router();

router.post("/", requireAuth, create);
router.get("/", requireAuth, list);

export default router;
