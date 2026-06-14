export type iMach360AuditEventType =
  | "connector.call.started"
  | "connector.call.succeeded"
  | "connector.call.failed";

export interface iMach360AuditEvent {
  eventId: string;
  eventType: iMach360AuditEventType;
  operation: string;
  tenantId: string;
  userId: string;
  correlationId?: string;
  durationMs?: number;
  statusCode?: number;
  error?: {
    code: string;
    message: string;
  };
  timestamp: Date;
}

export interface iMach360AuditPort {
  emit(event: iMach360AuditEvent): Promise<void>;
}
