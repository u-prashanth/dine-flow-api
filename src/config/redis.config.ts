import { Env } from "./env.schema";

export const buildRedisConfig = (env: Env) => ({
  url: env.REDIS_URL
});

export type RedisConfig = ReturnType<typeof buildRedisConfig>;