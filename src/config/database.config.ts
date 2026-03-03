import { Env } from "./env.schema";

export const buildDatabaseConfig = (env: Env) => ({
  url: env.DATABASE_URL,
  poolSize: env.DATABASE_POOL_SIZE,
  enableSSL: env.DATABASE_ENABLE_SSL
});

export type DatabaseConfig = ReturnType<typeof buildDatabaseConfig>;