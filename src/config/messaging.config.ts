import { Env } from "./env.schema";

export const buildMessagingConfig = (env: Env) => ({
  provider: env.MESSAGING_PROVIDER
});

export type MessagingConfig = ReturnType<typeof buildMessagingConfig>;