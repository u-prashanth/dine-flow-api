import { Env } from "./env.schema";
import { buildAppConfig } from "./app.config";
import { buildDatabaseConfig } from "./database.config";
import { buildJwtConfig } from "./jwt.config";
import { buildMessagingConfig } from "./messaging.config";
import { buildRedisConfig } from "./redis.config";

export const buildAppConfiguration = (env: Env) => ({
  app: buildAppConfig(env),
  database: buildDatabaseConfig(env),
  redis: buildRedisConfig(env),
  jwt: buildJwtConfig(env),
  messaging: buildMessagingConfig(env)
});

export type AppConfiguration = ReturnType<typeof buildAppConfiguration>;