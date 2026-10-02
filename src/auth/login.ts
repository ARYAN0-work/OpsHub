import { db } from "../prisma/db";
import { comparePassword } from "./password";

export const loginUser = async (email: string, password: string) => {
  const user = await db.orm.public.User.first({
    email,
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const passwordMatches = await comparePassword(password, user.password);

  if (!passwordMatches) {
    throw new Error("Invalid credentials");
  }

  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
