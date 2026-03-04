import { Env } from "./env.schema";

export const buildPasswordConfig = (env: Env) => ({
  saltRounds: env.PASSWORD_SALT_ROUNDS
});

export type PasswordConfig = ReturnType<typeof buildPasswordConfig>;