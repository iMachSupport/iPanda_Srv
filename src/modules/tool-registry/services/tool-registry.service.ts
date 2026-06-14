import type {
  ToolCatalog,
  ToolExecutor,
  ToolRegistrar,
  ToolRegistrationOptions
} from "../contracts/tool-registration.contracts";
import type { ToolPlugin, ToolPluginModule } from "../contracts/tool-plugin.contracts";
import type { ToolDefinition, ToolExecutionRequest, ToolExecutionResult, ToolRegistryPort } from "../contracts/tool-registry.port";

export abstract class ToolRegistryService implements ToolRegistryPort, ToolRegistrar, ToolCatalog, ToolExecutor {
  public abstract register(plugin: ToolPlugin, options?: ToolRegistrationOptions): Promise<void>;
  public abstract registerModule(module: ToolPluginModule, options?: ToolRegistrationOptions): Promise<void>;
  public abstract discover(tenantId: string): Promise<ToolDefinition[]>;
  public abstract findById(toolId: string, tenantId: string): Promise<ToolDefinition | null>;
  public abstract has(toolId: string): Promise<boolean>;
  public abstract listTools(tenantId: string): Promise<ToolDefinition[]>;
  public abstract getTool(toolId: string, tenantId: string): Promise<ToolDefinition | null>;
  public abstract executeTool(request: ToolExecutionRequest): Promise<ToolExecutionResult>;
  public abstract execute(request: ToolExecutionRequest): Promise<ToolExecutionResult>;
}
