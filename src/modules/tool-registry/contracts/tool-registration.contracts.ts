import type { ToolDefinition, ToolExecutionRequest, ToolExecutionResult } from "./tool-registry.port";
import type { ToolPlugin, ToolPluginModule } from "./tool-plugin.contracts";

export interface ToolRegistrationOptions {
  overrideExisting?: boolean;
  tenantIds?: string[];
}

export interface ToolRegistrar {
  register(plugin: ToolPlugin, options?: ToolRegistrationOptions): Promise<void>;
  registerModule(module: ToolPluginModule, options?: ToolRegistrationOptions): Promise<void>;
}

export interface ToolCatalog {
  discover(tenantId: string): Promise<ToolDefinition[]>;
  findById(toolId: string, tenantId: string): Promise<ToolDefinition | null>;
  has(toolId: string): Promise<boolean>;
}

export interface ToolExecutor {
  execute(request: ToolExecutionRequest): Promise<ToolExecutionResult>;
}
