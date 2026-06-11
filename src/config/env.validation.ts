import { Logger } from '@nestjs/common';
import z from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().min(0).max(65535),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().min(1),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1),
  RESEND_API_KEY: z.string().min(12),
  APP_URL: z.url(),
});

export type EnvConfigType = z.infer<typeof envSchema>;

export const validate = (config: Record<string, any>) => {
  const { data, success, error } = envSchema.safeParse(config);

  if (!success) {
    const logger = new Logger('EnvValidation');
    logger.error(`Env validation failed: \n${z.prettifyError(error)}`);
    process.exit(1);
  }
  return data;
};
