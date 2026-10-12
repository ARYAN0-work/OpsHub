import { db } from "../prisma/db";
import type { CreateChannelInput } from "./schema";

export const createChannel = async (
  workspaceId: number,
  input: CreateChannelInput,
) => {
  return db.orm.public.Channel.create({
    name: input.name,
    description: input.description ?? null,
    workspaceId,
  });
};

export const listChannels = async (workspaceId: number) => {
  return db.orm.public.Channel.where({ workspaceId }).all();
};
