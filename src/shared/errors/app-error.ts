export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly exposeDetails: boolean;

  public constructor(
    message: string,
    statusCode = 500,
    code = "INTERNAL_ERROR",
    details?: unknown,
    exposeDetails = false
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.exposeDetails = exposeDetails;
  }
}

export class ValidationError extends AppError {
  public constructor(message: string, details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details, true);
  }
}

export class AuthenticationError extends AppError {
  public constructor(message = "Authentication is required", details?: unknown) {
    super(message, 401, "AUTHENTICATION_REQUIRED", details, false);
  }
}

export class AuthorizationError extends AppError {
  public constructor(message = "Access is forbidden", details?: unknown) {
    super(message, 403, "ACCESS_FORBIDDEN", details, false);
  }
}

export class NotFoundError extends AppError {
  public constructor(message: string, details?: unknown) {
    super(message, 404, "NOT_FOUND", details, false);
  }
}
