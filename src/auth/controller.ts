import type { Request, Response } from "express";
import { registerSchema } from "./schema";
import { registerUser } from "./servcie";

export const register = async (req: Request, res: Response) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: result.error.issues,
    });
  }

  try {
    const user = await registerUser(result.data);

    return res.status(201).json({
      user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "User already Exists") {
      return res.status(409).json({
        error: "User already exists",
      });
    }

    throw error;
  }
};
