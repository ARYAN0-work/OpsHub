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
