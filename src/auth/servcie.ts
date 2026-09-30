import { db } from "../prisma/db";
import type { RegisterInput } from "./schema";

export const registerUser = async (input: RegisterInput) => {
  const existingUser = await db.orm.public.User.first({
    email: input.email,
  });

  console.log(existingUser);

  return existingUser;
};
