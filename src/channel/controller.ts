import type { Request, Response } from "express";
import { createChannelSchema, updateChannelSchema } from "./schema";
import {
  createChannel,
  listChannels,
  getChannel,
  updateChannel,
} from "./service";

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

export const list = async (req: Request, res: Response) => {
  const workspaceId = Number(req.params.workspaceId);

  if (!Number.isInteger(workspaceId) || workspaceId <= 0) {
    return res.status(400).json({ error: "Invalid workspace ID" });
  }

  const channels = await listChannels(workspaceId);

  return res.status(200).json({ channels });
};

export const get = async (req: Request, res: Response) => {
  const workspaceId = Number(req.params.workspaceId);
  const channelId = Number(req.params.channelId);

  if (
    !Number.isInteger(workspaceId) ||
    workspaceId <= 0 ||
    !Number.isInteger(channelId) ||
    channelId <= 0
  ) {
    return res.status(400).json({ error: "Invalid workspace or channel ID" });
  }

  const channel = await getChannel(workspaceId, channelId);

  if (!channel) {
    return res.status(404).json({ error: "Channel not found" });
  }

  return res.status(200).json({ channel });
};

export const update = async (req: Request, res: Response) => {
  const workspaceId = Number(req.params.workspaceId);
  const channelId = Number(req.params.channelId);

  if (
    !Number.isInteger(workspaceId) ||
    workspaceId <= 0 ||
    !Number.isInteger(channelId) ||
    channelId <= 0
  ) {
    return res.status(400).json({
      error: "Invalid workspace or channel ID",
    });
  }

  const result = updateChannelSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: result.error.issues,
    });
  }

  try {
    const channel = await updateChannel(workspaceId, channelId, result.data);

    if (!channel) {
      return res.status(404).json({
        error: "Channel not found",
      });
    }

    return res.status(200).json({ channel });
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
