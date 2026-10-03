import { Router } from "express";
import { requireAuth } from "../auth/middleware";
import { create } from "./controller";

const router = Router();

router.post("/", requireAuth, create);

export default router;
