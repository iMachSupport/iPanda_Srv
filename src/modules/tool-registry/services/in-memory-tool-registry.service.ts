import { AppError, ValidationError } from "../../../shared/errors/app-error";
import type { ToolPlugin, ToolPluginModule } from "../contracts/tool-plugin.contracts";
import type {
  ToolCatalog,
  ToolExecutor,
  ToolRegistrar,
  ToolRegistrationOptions
} from "../contracts/tool-registration.contracts";
import type {
  ToolDefinition,
  ToolExecutionRequest,
  ToolExecutionResult,
  ToolRegistryPort
} from "../contracts/tool-registry.port";

interface RegisteredToolPlugin {
  plugin: ToolPlugin;
  tenantIds?: Set<string>;
}

export class InMemoryToolRegistryService implements ToolRegistryPort, ToolRegistrar, ToolCatalog, ToolExecutor {
  private readonly plugins = new Map<string, RegisteredToolPlugin>();

  public async register(plugin: ToolPlugin, options?: ToolRegistrationOptions): Promise<void> {
    if (this.plugins.has(plugin.definition.id) && !options?.overrideExisting) {
      throw new AppError("Tool is already registered", 409, "TOOL_ALREADY_REGISTERED", {
        toolId: plugin.definition.id
      });
    }

    this.plugins.set(plugin.definition.id, {
      plugin,
      tenantIds: options?.tenantIds ? new Set(options.tenantIds) : undefined
    });
  }

  public async registerModule(module: ToolPluginModule, options?: ToolRegistrationOptions): Promise<void> {
    for (const factory of module.tools) {
      await this.register(factory.create(), options);
    }
  }

  public async discover(tenantId: string): Promise<ToolDefinition[]> {
    return this.listTools(tenantId);
  }

  public async findById(toolId: string, tenantId: string): Promise<ToolDefinition | null> {
    return this.getTool(toolId, tenantId);
  }

  public async has(toolId: string): Promise<boolean> {
    return this.plugins.has(toolId);
  }

  public async listTools(tenantId: string): Promise<ToolDefinition[]> {
    return Array.from(this.plugins.values())
      .filter((entry) => this.isEnabledForTenant(entry, tenantId))
      .map((entry) => entry.plugin.definition)
      .filter((definition) => definition.enabled);
  }

  public async getTool(toolId: string, tenantId: string): Promise<ToolDefinition | null> {
    const entry = this.plugins.get(toolId);

    if (!entry?.plugin.definition.enabled || !this.isEnabledForTenant(entry, tenantId)) {
      return null;
    }

    return entry.plugin.definition;
  }

  public async executeTool(request: ToolExecutionRequest): Promise<ToolExecutionResult> {
    return this.execute(request);
  }

  public async execute(request: ToolExecutionRequest): Promise<ToolExecutionResult> {
    const entry = this.plugins.get(request.toolId);

    if (!entry?.plugin.definition.enabled || !this.isEnabledForTenant(entry, request.tenantId)) {
      throw new AppError("Tool is not registered or enabled", 404, "TOOL_NOT_FOUND", {
        toolId: request.toolId
      });
    }

    const input = this.validateToolInput(entry.plugin, request);
    const result = await entry.plugin.execute(
      {
        ...request,
        input
      },
      {
        tenantId: request.tenantId,
        userId: request.userId,
        correlationId: request.correlationId,
        callerToken: request.callerToken,
        runtimeContext: request.context,
      }
    );

    this.validateToolOutput(entry.plugin, result);

    return result;
  }

  private isEnabledForTenant(entry: RegisteredToolPlugin, tenantId: string): boolean {
    return !entry.tenantIds || entry.tenantIds.has(tenantId);
  }

  private validateToolInput(plugin: ToolPlugin, request: ToolExecutionRequest): Record<string, unknown> {
    if (!plugin.inputValidator) {
      return request.input;
    }

    const parsedInput = plugin.inputValidator.safeParse(request.input);

    if (!parsedInput.success) {
      throw new ValidationError("Tool input validation failed", {
        toolId: plugin.definition.id,
        issues: parsedInput.error.flatten()
      });
    }

    return parsedInput.data;
  }

  private validateToolOutput(plugin: ToolPlugin, result: ToolExecutionResult): void {
    if (!plugin.outputValidator || result.status !== "succeeded") {
      return;
    }

    const parsedOutput = plugin.outputValidator.safeParse(result.output);

    if (!parsedOutput.success) {
      throw new ValidationError("Tool output validation failed", {
        toolId: plugin.definition.id,
        issues: parsedOutput.error.flatten()
      });
    }
  }
}
