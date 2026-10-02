import jwt from "jsonwebtoken";

const JWT_SECRET = process.env["JWT_SECRET"]!;

export const signAccessToken = (userId: number) => {
  return jwt.sign(
    {
      sub: userId,
    },
    JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );
};
