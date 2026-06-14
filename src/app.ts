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

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(pinoHttp({ logger }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use(`${env.API_PREFIX}/${env.API_VERSION}`, authenticationMiddleware, createV1Router());
  app.use(errorHandler);

  return app;
};
