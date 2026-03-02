import { Env } from "./env.schema";

export const buildJwtConfig = (env: Env) => ({
  secret: env.JWT_SECRET,
  expiresIn: env.JWT_EXPIRES_IN
});

export type JwtConfig = ReturnType<typeof buildJwtConfig>;