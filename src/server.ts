import { createApp } from "./app";
import { env } from "./config/environment";
import { logger } from "./shared/logging/logger";

const bootstrap = async () => {
  const app = await createApp();

  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "iPanda API server started");
  });
};

void bootstrap().catch((error) => {
  logger.fatal({ err: error }, "iPanda API server failed to start");
  process.exit(1);
});
