import { Env } from "./env.schema";

export const buildDatabaseConfig = (env: Env) => ({
  url: env.DATABASE_URL
});

export type DatabaseConfig = ReturnType<typeof buildDatabaseConfig>;