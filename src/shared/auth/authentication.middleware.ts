import type { RequestHandler } from "express";
import { randomUUID } from "crypto";
import { AuthenticationError } from "../errors/app-error";
import type { AuthenticatedRequest, AuthContext } from "./auth-context";

export const authenticationMiddleware: RequestHandler = (req, _res, next) => {
  const tenantId = getHeader(req, "x-tenant-id");
  const userId = getHeader(req, "x-user-id");

  if (!tenantId || !userId) {
    next(
      new AuthenticationError("Missing authentication context", {
        requiredHeaders: ["x-tenant-id", "x-user-id"]
      })
    );
    return;
  }

  const auth: AuthContext = {
    tenantId,
    userId,
    sessionId: getHeader(req, "x-session-id"),
    correlationId: getHeader(req, "x-correlation-id") ?? randomUUID(),
    roles: parseRoles(getHeader(req, "x-user-roles")),
    callerToken: getHeader(req, "x-caller-token") ?? getHeader(req, "x-session-id"),
  };

  (req as AuthenticatedRequest).auth = auth;
  next();
};

const getHeader = (req: Parameters<RequestHandler>[0], name: string): string | undefined => {
  const value = req.headers[name];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const parseRoles = (value: string | undefined): string[] =>
  value
    ?.split(",")
    .map((role) => role.trim())
    .filter(Boolean) ?? [];
