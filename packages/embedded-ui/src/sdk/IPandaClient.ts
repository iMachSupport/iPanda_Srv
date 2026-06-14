import type {
  ExecuteInput,
  ExecuteResult,
  IPandaClientConfig,
  RuntimeResponse,
} from "./ipanda.types";

export class IPandaClientError extends Error {
  public readonly statusCode: number;
  public readonly body: string;

  public constructor(statusCode: number, body: string) {
    super(`iPanda API error ${statusCode}: ${body}`);
    this.name = "IPandaClientError";
    this.statusCode = statusCode;
    this.body = body;
  }
}

export class IPandaClient {
  public constructor(private readonly config: IPandaClientConfig) {}

  public async execute(input: ExecuteInput): Promise<ExecuteResult> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-tenant-id": this.config.tenantId,
      "x-user-id": this.config.userId,
    };

    if (this.config.sessionId) {
      headers["x-session-id"] = this.config.sessionId;
    }

    if (this.config.callerToken) {
      headers["x-caller-token"] = this.config.callerToken;
    }

    let response: Response;

    try {
      response = await fetch(`${this.config.apiUrl}/api/v1/agent-runtime/execute`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: input.message,
          input: {
            message: input.message,
            metadata: {
              runtimeContext: input.context,
              conversationId: input.conversationId,
            },
          },
        }),
      });
    } catch (cause) {
      throw new IPandaClientError(
        0,
        cause instanceof Error ? cause.message : "Network error"
      );
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new IPandaClientError(response.status, text);
    }

    const data = (await response.json()) as RuntimeResponse;

    return {
      id: data.id,
      message: data.finalMessage,
      actions: data.actions,
    };
  }

  public async health(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
