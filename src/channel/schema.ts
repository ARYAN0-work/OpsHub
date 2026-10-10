import { z } from "zod";

export const createChannelSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).optional(),
});

export type CreateChannelInput = z.infer<typeof createChannelSchema>;
