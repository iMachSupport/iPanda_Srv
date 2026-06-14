export type iMach360ConnectorErrorCode =
  | "IMACH360_AUTH_STRATEGY_NOT_FOUND"
  | "IMACH360_AUTHENTICATION_FAILED"
  | "IMACH360_REQUEST_FAILED"
  | "IMACH360_RESPONSE_MAPPING_FAILED"
  | "IMACH360_NOT_FOUND"
  | "IMACH360_UNAUTHORIZED"
  | "IMACH360_FORBIDDEN"
  | "IMACH360_CONFLICT"
  | "IMACH360_OPERATION_NOT_IMPLEMENTED";

export class iMach360ConnectorError extends Error {
  public constructor(
    public readonly code: iMach360ConnectorErrorCode,
    message: string,
    public readonly statusCode = 500,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "iMach360ConnectorError";
  }
}
