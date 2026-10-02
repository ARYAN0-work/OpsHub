import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env["JWT_SECRET"]!;

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    if (typeof payload === "string" || !payload.sub) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    req.user = {
      id: Number(payload.sub),
    };

    next();
  } catch {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
};
