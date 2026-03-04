import { Env } from "./env.schema";

export const buildJwtConfig = (env: Env) => ({
  secret: env.JWT_SECRET,
  refreshSecret: env.JWT_REFRESH_SECRET
});

export type JwtConfig = ReturnType<typeof buildJwtConfig>;