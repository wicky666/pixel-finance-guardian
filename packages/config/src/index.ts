import { z } from "zod";

/** 浏览器端可读的公开配置（需在 NEXT_PUBLIC_* 中设置） */
export const webPublicEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z
    .union([z.string().url(), z.literal("")])
    .optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
});

/** 服务端 / Nest 进程环境 */
export const apiEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  API_PORT: z.coerce.number().optional(),
  CORS_ORIGIN: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  OSS_ENDPOINT: z.string().optional(),
  OSS_BUCKET: z.string().optional(),
  OSS_ACCESS_KEY_ID: z.string().optional(),
  OSS_ACCESS_KEY_SECRET: z.string().optional(),
});

/** Admin（Vite）构建时注入 */
export const adminPublicEnvSchema = z.object({
  VITE_API_BASE_URL: z.union([z.string().url(), z.literal("")]).optional(),
});

export type WebPublicEnv = z.infer<typeof webPublicEnvSchema>;
export type ApiEnv = z.infer<typeof apiEnvSchema>;
export type AdminPublicEnv = z.infer<typeof adminPublicEnvSchema>;

export const DEFAULT_API_PORT = 3100;
export const DEFAULT_WEB_DEV_ORIGIN = "http://localhost:3000";
export const DEFAULT_ADMIN_DEV_ORIGIN = "http://localhost:5173";
