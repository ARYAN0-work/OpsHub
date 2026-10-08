import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export const addMemberSchema = z.object({
  userId: z.number().int().positive(),
  role: z.enum(["ADMIN", "MEMBER"]),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;
