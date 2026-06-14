import type { z } from "zod";
import type { ToolDefinition, ToolExecutionRequest, ToolExecutionResult } from "./tool-registry.port";

export interface ToolExecutionContext {
  tenantId: string;
  userId: string;
  correlationId?: string;
  callerToken?: string;
  runtimeContext?: Record<string, unknown>;
}

export interface ToolPlugin {
  definition: ToolDefinition;
  inputValidator?: z.ZodType<Record<string, unknown>>;
  outputValidator?: z.ZodType<unknown>;
  execute(request: ToolExecutionRequest, context: ToolExecutionContext): Promise<ToolExecutionResult>;
}

export interface ToolPluginFactory {
  create(): ToolPlugin;
}

export interface ToolPluginModule {
  namespace: string;
  tools: ToolPluginFactory[];
}
