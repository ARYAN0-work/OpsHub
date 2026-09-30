import { db } from "../prisma/db";
import { hashPassword } from "./password";
import type { RegisterInput } from "./schema";

export const registerUser = async (input: RegisterInput) => {
  const existingUser = await db.orm.public.User.first({
    email: input.email,
  });

  if (existingUser) {
    throw new Error("User already Exists");
  }

  const hashedPassword = await hashPassword(input.password);

  const user = await db.orm.public.User.create({
    email: input.email,
    password: hashedPassword,
  });

  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    UpdatedAt: user.updatedAt,
  };
};
