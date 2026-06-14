import { z } from "zod";
import type { ToolExecutionContext, ToolPlugin, ToolPluginFactory } from "../../contracts/tool-plugin.contracts";
import type { ToolDefinition, ToolExecutionRequest, ToolExecutionResult } from "../../contracts/tool-registry.port";

export const GET_LEAVE_BALANCE_TOOL_ID = "hr.get-leave-balance";

const GetLeaveBalanceInputSchema = z
  .object({
    employeeId: z.string().min(1),
    leaveType: z.string().min(1).optional()
  })
  .strict();

const GetLeaveBalanceOutputSchema = z
  .object({
    balance: z.number()
  })
  .strict();

export abstract class GetLeaveBalanceTool implements ToolPlugin {
  public readonly inputValidator = GetLeaveBalanceInputSchema;
  public readonly outputValidator = GetLeaveBalanceOutputSchema;

  public readonly definition: ToolDefinition = {
    id: GET_LEAVE_BALANCE_TOOL_ID,
    name: "GetLeaveBalance",
    description: "Retrieves the available leave balance for an employee.",
    version: "1.0.0",
    providerType: "internal" as const,
    executionMode: "sync" as const,
    enabled: true,
    tags: ["hr", "leave", "mock"],
    metadata: {
      futureProviderType: "sap"
    },
    inputSchema: {
      type: "object",
      required: ["employeeId"],
      additionalProperties: false,
      properties: {
        employeeId: {
          type: "string",
          description: "Enterprise employee identifier."
        },
        leaveType: {
          type: "string",
          description: "Optional leave type code."
        }
      }
    },
    outputSchema: {
      type: "object",
      required: ["balance"],
      additionalProperties: false,
      properties: {
        balance: { type: "number" }
      }
    }
  };

  public abstract execute(
    request: ToolExecutionRequest,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult>;
}

export class MockGetLeaveBalanceTool extends GetLeaveBalanceTool {
  public override async execute(
    request: ToolExecutionRequest,
    _context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    const input = GetLeaveBalanceInputSchema.parse(request.input);

    return {
      toolId: this.definition.id,
      executionId: request.correlationId ?? `${this.definition.id}:mock`,
      status: "succeeded",
      output: {
        balance: 12
      },
      metadata: {
        source: "mock",
        employeeId: input.employeeId
      }
    };
  }
}

export const getLeaveBalanceToolFactory: ToolPluginFactory = {
  create: () => new MockGetLeaveBalanceTool()
};
