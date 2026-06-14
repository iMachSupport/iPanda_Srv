export type LlmProviderName = "gemini" | "openai" | "claude";

export interface LlmMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
}

export interface LlmToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface LlmCompletionRequest {
  tenantId: string;
  model?: string;
  messages: LlmMessage[];
  tools?: LlmToolDefinition[];
  temperature?: number;
  maxOutputTokens?: number;
  metadata?: Record<string, unknown>;
}

export interface LlmCompletionResponse {
  content: string;
  toolCalls?: Record<string, unknown>[];
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}

export interface LlmProviderPort {
  readonly providerName: LlmProviderName;
  complete(request: LlmCompletionRequest): Promise<LlmCompletionResponse>;
}
