export type SapConnectorErrorCode =
  | "SAP_DESTINATION_NOT_FOUND"
  | "SAP_AUTHENTICATION_FAILED"
  | "SAP_AUTH_STRATEGY_NOT_FOUND"
  | "SAP_REQUEST_FAILED"
  | "SAP_RESPONSE_MAPPING_FAILED"
  | "SAP_OPERATION_NOT_IMPLEMENTED";

export class SapConnectorError extends Error {
  public constructor(
    public readonly code: SapConnectorErrorCode,
    message: string,
    public readonly statusCode = 500,
    public readonly details?: unknown
  ) {
    super(message);
  }
}
