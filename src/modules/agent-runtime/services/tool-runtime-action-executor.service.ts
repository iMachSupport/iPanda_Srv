import type { ToolRegistryPort } from "../../tool-registry/contracts/tool-registry.port";
import type { ExecutionContext } from "../contracts/execution-context.types";
import type { RuntimeActionExecutorService } from "../contracts/runtime-orchestration.contracts";
import type { RuntimeAction, RuntimeActionResult } from "../contracts/runtime.types";

export class ToolRuntimeActionExecutorService implements RuntimeActionExecutorService {
  public constructor(private readonly toolRegistry: ToolRegistryPort) {}

  public async execute(action: RuntimeAction, context: ExecutionContext): Promise<RuntimeActionResult> {
    if (action.type !== "execute-tool") {
      return {
        actionId: action.id,
        type: action.type,
        status: "skipped",
        error: {
          code: "UNSUPPORTED_ACTION",
          message: `Action type ${action.type} is not supported by this executor.`
        }
      };
    }

    const toolId = String(action.payload.toolId);
    const input = this.asRecord(action.payload.input);
    const result = await this.toolRegistry.executeTool({
      toolId,
      tenantId: context.request.identity.tenantId,
      userId: context.request.identity.userId,
      correlationId: action.id,
      callerToken: context.request.identity.callerToken,
      input,
      context: {
        runtimeContextId: context.id,
        requestId: context.request.id
      }
    });

    return {
      actionId: action.id,
      type: action.type,
      status: result.status === "succeeded" ? "succeeded" : "failed",
      output: result.output,
      error: result.error
    };
  }

  private asRecord(value: unknown): Record<string, unknown> {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }

    return {};
  }
}
