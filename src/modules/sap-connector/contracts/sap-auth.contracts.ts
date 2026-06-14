import type { SapResolvedDestination } from "./sap-adapter.contracts";
import type { SapRequestContext } from "./sap-connector.port";

export interface SapAuthToken {
  type: "basic" | "bearer";
  value: string;
  expiresAt?: Date;
}

export interface SapAuthRequest {
  context: SapRequestContext;
  destination: SapResolvedDestination;
}

export interface SapAuthStrategy {
  supports(destination: SapResolvedDestination): boolean;
  authenticate(request: SapAuthRequest): Promise<SapAuthToken | null>;
}

export interface SapAuthStrategyRegistry {
  register(strategy: SapAuthStrategy): void;
  resolve(destination: SapResolvedDestination): SapAuthStrategy;
}

export interface SapAuthenticatedRequestHeaders {
  headers: Record<string, string>;
}
