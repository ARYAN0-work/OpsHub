import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export const hashedPassword = async (password: string) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
) => {
  return bcrypt.compare(password, hashedPassword);
};
