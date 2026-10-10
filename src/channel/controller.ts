import type { Request, Response } from "express";
import { createChannelSchema } from "./schema";
import { createChannel } from "./service";

export const create = async (req: Request, res: Response) => {
  const workspaceId = Number(req.params.workspaceId);

  if (!Number.isInteger(workspaceId) || workspaceId <= 0) {
    return res.status(400).json({
      error: "Invalid workspace ID",
    });
  }

  const result = createChannelSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: result.error.issues,
    });
  }

  try {
    const channel = await createChannel(workspaceId, result.data);
    return res.status(201).json({ channel });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "sqlState" in error &&
      error.sqlState === "23505"
    ) {
      return res.status(409).json({
        error: "A channel with this name already exists in this workspace",
      });
    }

    throw error;
  }
};
