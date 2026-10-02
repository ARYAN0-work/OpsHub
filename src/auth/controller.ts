import type { Request, Response } from "express";
import { registerSchema } from "./schema";
import { registerUser } from "./servcie";
import { loginUser } from "./login";

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

export const login = async (req: Request, res: Response) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: result.error.issues,
    });
  }

  try {
    const user = await loginUser(result.data.email, result.data.password);

    return res.status(200).json({
      user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid credentials") {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    throw error;
  }
};
