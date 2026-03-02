import { Env } from "./env.schema";

export const buildAppConfig = (env: Env) => ({
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  isProduction: env.NODE_ENV === 'production'
});

export type AppConfig = ReturnType<typeof buildAppConfig>;