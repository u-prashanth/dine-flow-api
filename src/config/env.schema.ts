import z from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string().min(1),
  DATABASE_POOL_SIZE: z.coerce.number().default(10),
  DATABASE_ENABLE_SSL: z.enum(['true', 'false']).transform((val) => val === 'true'),

  REDIS_URL: z.string().min(1),

  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),

  MESSAGING_PROVIDER: z.enum(['mock', 'whatsapp', 'sms']),
});

export type Env = z.infer<typeof envSchema>;