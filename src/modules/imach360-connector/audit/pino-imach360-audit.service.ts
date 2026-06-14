import { logger } from "../../../shared/logging/logger";
import type { iMach360AuditEvent, iMach360AuditPort } from "./imach360-audit.port";

export class PinoImachio360AuditService implements iMach360AuditPort {
  public async emit(event: iMach360AuditEvent): Promise<void> {
    const logPayload = {
      audit: true,
      eventId: event.eventId,
      eventType: event.eventType,
      operation: event.operation,
      tenantId: event.tenantId,
      userId: event.userId,
      correlationId: event.correlationId,
      durationMs: event.durationMs,
      statusCode: event.statusCode,
      error: event.error,
      timestamp: event.timestamp.toISOString()
    };

    if (event.eventType === "connector.call.failed") {
      logger.error(logPayload, "iMach360 connector call failed");
    } else {
      logger.info(logPayload, `iMach360 connector: ${event.operation} ${event.eventType}`);
    }
  }
}
