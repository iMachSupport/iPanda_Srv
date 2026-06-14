import { ZodError } from "zod";
import { env } from "../../config/environment";
import { AppError, ValidationError } from "./app-error";

export interface MappedError {
  statusCode: number;
  body: {
    error: {
      code: string;
      message: string;
      details?: unknown;
    };
  };
}

export const mapErrorToHttpResponse = (error: unknown): MappedError => {
  const normalizedError = normalizeError(error);
  const shouldExposeDetails = normalizedError.exposeDetails || env.NODE_ENV !== "production";

  return {
    statusCode: normalizedError.statusCode,
    body: {
      error: {
        code: normalizedError.code,
        message: normalizedError.message,
        details: shouldExposeDetails ? normalizedError.details : undefined
      }
    }
  };
};

const normalizeError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new ValidationError("Request validation failed", error.flatten());
  }

  if (isSapConnectorError(error)) {
    return new AppError(error.message, error.statusCode, error.code, error.details, false);
  }

  return new AppError("Unexpected server error", 500, "INTERNAL_ERROR");
};

const isSapConnectorError = (
  error: unknown
): error is { code: string; statusCode: number; message: string; details?: unknown } =>
  error !== null &&
  typeof error === "object" &&
  "code" in error &&
  "statusCode" in error &&
  "message" in error;
