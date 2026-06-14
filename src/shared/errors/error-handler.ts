import type { ErrorRequestHandler } from "express";
import { logger } from "../logging/logger";
import { mapErrorToHttpResponse } from "./error-mapper";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const response = mapErrorToHttpResponse(error);

  logger.error({ err: error }, response.body.error.message);
  res.status(response.statusCode).json(response.body);
};
