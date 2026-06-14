export type ToolProviderType = "internal" | "sap" | "external";

export type ToolExecutionMode = "sync" | "async";

export interface JsonSchema {
  type: string;
  title?: string;
  description?: string;
  properties?: Record<string, JsonSchema | Record<string, unknown>>;
  required?: string[];
  additionalProperties?: boolean;
  items?: JsonSchema | Record<string, unknown>;
  enum?: unknown[];
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  providerType: ToolProviderType;
  executionMode: ToolExecutionMode;
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
  enabled: boolean;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface ToolExecutionRequest {
  toolId: string;
  tenantId: string;
  userId: string;
  correlationId?: string;
  callerToken?: string;
  input: Record<string, unknown>;
  context?: Record<string, unknown>;
}

export interface ToolExecutionResult {
  toolId: string;
  executionId: string;
  status: "succeeded" | "failed";
  output: unknown;
  error?: {
    code: string;
    message: string;
  };
  metadata?: Record<string, unknown>;
}

export interface ToolRegistryPort {
  listTools(tenantId: string): Promise<ToolDefinition[]>;
  getTool(toolId: string, tenantId: string): Promise<ToolDefinition | null>;
  executeTool(request: ToolExecutionRequest): Promise<ToolExecutionResult>;
}
