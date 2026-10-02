import { db } from "../prisma/db";
import { comparePassword } from "./password";
import { signAccessToken } from "./jwt";

export const loginUser = async (email: string, password: string) => {
  const user = await db.orm.public.User.first({
    email,
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const passwordMatches = await comparePassword(password, user.password);

  const accessToken = signAccessToken(user.id);

  if (!passwordMatches) {
    throw new Error("Invalid credentials");
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    accessToken,
  };
};
