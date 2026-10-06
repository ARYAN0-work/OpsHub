import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
      };
      workspace?: {
        id: number;
        role: "OWNER" | "ADMIN" | "MEMBER";
      };
    }
  }
}
