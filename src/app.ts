import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { createApplicationContainer } from "./composition/container";
import { env } from "./config/environment";
import { authenticationMiddleware } from "./shared/auth/authentication.middleware";
import { errorHandler } from "./shared/errors/error-handler";
import { logger } from "./shared/logging/logger";
import { createV1Router } from "./routes/v1";

export const createApp = async () => {
  const app = express();
  const container = await createApplicationContainer();

  app.locals.container = container;

  const allowedOrigins = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : true; // allow all in development

  app.use(
    cors({
      origin: allowedOrigins,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "x-tenant-id",
        "x-user-id",
        "x-session-id",
        "x-correlation-id",
        "x-user-roles",
        "x-caller-token",
      ],
      maxAge: 600, // cache preflight for 10 minutes
    })
  );
  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(pinoHttp({ logger }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use(`${env.API_PREFIX}/${env.API_VERSION}`, authenticationMiddleware, createV1Router());
  app.use(errorHandler);

  return app;
};
