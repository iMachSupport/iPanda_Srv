import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
  API_PREFIX: z.string().default("/api"),
  API_VERSION: z.string().default("v1"),
  LLM_PROVIDER: z.enum(["gemini", "openai", "claude"]).default("gemini"),
  LLM_DEFAULT_MODEL: z.string().default("gemini-1.5-flash"),
  GEMINI_BASE_URL: z.string().url().default("https://generativelanguage.googleapis.com/v1beta"),
  GEMINI_API_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional()
});

export type Environment = z.infer<typeof EnvironmentSchema>;

export const env: Environment = EnvironmentSchema.parse(process.env);
