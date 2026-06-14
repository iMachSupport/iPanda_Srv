import type {
  SapDestinationRef,
  SapODataRequest,
  SapODataResponse,
  SapRestRequest,
  SapRestResponse
} from "./sap-connector.port";

export interface SapResolvedDestination {
  tenantId: string;
  destinationId: string;
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  authenticationType: SapAuthenticationType;
  metadata?: Record<string, unknown>;
}

export type SapAuthenticationType =
  | "none"
  | "basic"
  | "bearer-token"
  | "oauth2-client-credentials"
  | "principal-propagation";

export interface SapDestinationAdapter {
  resolve(destination: SapDestinationRef): Promise<SapResolvedDestination>;
}

export interface SapODataAdapter {
  execute(request: SapODataRequest): Promise<SapODataResponse>;
}

export interface SapRestAdapter {
  execute(request: SapRestRequest): Promise<SapRestResponse>;
}
