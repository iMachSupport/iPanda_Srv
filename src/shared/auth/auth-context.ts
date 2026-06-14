import type { Request } from "express";
import { AuthenticationError } from "../errors/app-error";

export interface AuthContext {
  tenantId: string;
  userId: string;
  sessionId?: string;
  correlationId?: string;
  roles: string[];
  callerToken?: string;
}

export type AuthenticatedRequest = Request & {
  auth?: AuthContext;
};

export const getRequiredAuthContext = (request: Request): AuthContext => {
  const auth = (request as AuthenticatedRequest).auth;

  if (!auth) {
    throw new AuthenticationError();
  }

  return auth;
};
