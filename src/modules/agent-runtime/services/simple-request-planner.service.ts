import { randomUUID } from "crypto";
import type { ToolRegistryPort } from "../../tool-registry/contracts/tool-registry.port";
import type { ExecutionContext } from "../contracts/execution-context.types";
import type { RequestPlannerService } from "../contracts/runtime-orchestration.contracts";
import type { RuntimePlan } from "../contracts/runtime.types";

export class SimpleRequestPlannerService implements RequestPlannerService {
  public constructor(private readonly toolRegistry: ToolRegistryPort) {}

  public async createPlan(context: ExecutionContext): Promise<RuntimePlan> {
    const normalizedMessage = context.request.input.message.toLowerCase();
    const shouldGetLeaveBalance =
      normalizedMessage.includes("leave") && normalizedMessage.includes("balance");

    if (shouldGetLeaveBalance) {
      const leaveBalanceTool = await this.findTool(context.request.identity.tenantId, "GetLeaveBalance");

      if (!leaveBalanceTool) {
        return this.createNoToolPlan(context);
      }

      return {
        requestId: context.request.id,
        decisions: [
          {
            type: "tool-execution",
            required: true,
            reason: "The user is asking for leave balance, which is available through a registered HR tool.",
            confidence: 1
          }
        ],
        actions: [
          {
            id: randomUUID(),
            type: "execute-tool",
            payload: {
              toolId: leaveBalanceTool.id,
              input: {
                employeeId: context.request.identity.userId
              }
            }
          }
        ]
      };
    }

    return this.createNoToolPlan(context);
  }

  private async findTool(tenantId: string, name: string) {
    const tools = await this.toolRegistry.listTools(tenantId);

    return tools.find((tool) => tool.name === name && tool.enabled);
  }

  private createNoToolPlan(context: ExecutionContext): RuntimePlan {
    return {
      requestId: context.request.id,
      decisions: [
        {
          type: "direct-llm-response",
          required: true,
          reason: "No matching deterministic tool route was selected.",
          confidence: 0
        }
      ],
      actions: []
    };
  }
}
