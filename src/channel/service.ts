import { db } from "../prisma/db";
import type { CreateChannelInput, UpdateChannelInput } from "./schema";

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

export const getChannel = async (workspaceId: number, channelId: number) => {
  return db.orm.public.Channel.where({ workspaceId, id: channelId })
    .all()
    .first();
};

export const updateChannel = async (
  workspaceId: number,
  channelId: number,
  input: UpdateChannelInput,
) => {
  const channel = await getChannel(workspaceId, channelId);

  if (!channel) {
    return null;
  }

  return db.orm.public.Channel.where({ id: channelId, workspaceId }).update(
    input,
  );
};

export const deleteChannel = async (workspaceId: number, channelId: number) => {
  const channel = await getChannel(workspaceId, channelId);

  if (!channel) {
    return null;
  }

  await db.orm.public.Channel.where({
    workspaceId,
    id: channelId,
  }).delete();

  return channel;
};
