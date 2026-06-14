import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvironmentSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
    API_PREFIX: z.string().default("/api"),
    API_VERSION: z.string().default("v1"),

    // LLM
    LLM_PROVIDER: z.enum(["gemini", "openai", "claude"]).default("gemini"),
    LLM_DEFAULT_MODEL: z.string().default("gemini-1.5-flash"),
    GEMINI_BASE_URL: z.string().url().default("https://generativelanguage.googleapis.com/v1beta"),
    GEMINI_API_KEY: z.string().optional(),

    // iMach360 Connector
    IMACH360_API_URL: z.string().url(),

    // Option A: credential login (auto-refreshes — recommended for production)
    IMACH360_SERVICE_EMAIL: z.string().email().optional(),
    IMACH360_SERVICE_PASSWORD: z.string().min(1).optional(),

    // Option B: static JWT (requires manual rotation when token expires)
    IMACH360_SERVICE_TOKEN: z.string().min(1).optional(),

    IMACH360_LEAVE_ANNUAL_ENTITLEMENT: z.coerce.number().int().positive().default(20),

    // CORS — comma-separated list of allowed origins. Omit to allow all (development only).
    ALLOWED_ORIGINS: z.string().optional(),

    // Storage
    DATABASE_URL: z.string().optional()
  });
  // No service-account validation: when neither credentials nor token are set,
  // the platform runs in token-propagation-only mode — every request must supply
  // x-caller-token carrying the user's own iMach360 JWT.

export type Environment = z.infer<typeof EnvironmentSchema>;

export const env: Environment = EnvironmentSchema.parse(process.env);
