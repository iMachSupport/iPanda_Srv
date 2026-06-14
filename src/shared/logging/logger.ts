import pino from "pino";
import { env } from "../../config/environment";

export const logger = pino({
  level: env.LOG_LEVEL,
  base: undefined,
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "GEMINI_API_KEY", "DATABASE_URL"],
    remove: true
  }
});
