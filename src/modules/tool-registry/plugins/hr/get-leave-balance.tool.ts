import { z } from "zod";
import type { iMach360ConnectorPort } from "../../../imach360-connector/contracts/imach360-connector.port";
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
    balance: z.number(),
    totalEntitlement: z.number(),
    usedDays: z.number(),
    remainingDays: z.number(),
    leaveType: z.string().optional()
  })
  .strict();

export abstract class GetLeaveBalanceTool implements ToolPlugin {
  public readonly inputValidator = GetLeaveBalanceInputSchema;
  public readonly outputValidator = GetLeaveBalanceOutputSchema;

  public readonly definition: ToolDefinition = {
    id: GET_LEAVE_BALANCE_TOOL_ID,
    name: "GetLeaveBalance",
    description:
      "Retrieves the available leave balance for an employee. Returns total entitlement, days used, and remaining days for the current year. Optionally filtered by leave type.",
    version: "2.0.0",
    providerType: "internal" as const,
    executionMode: "sync" as const,
    enabled: true,
    tags: ["hr", "leave"],
    metadata: {
      domain: "leave",
      sourceSystem: "imach360"
    },
    inputSchema: {
      type: "object",
      required: ["employeeId"],
      additionalProperties: false,
      properties: {
        employeeId: {
          type: "string",
          description: "The employee identifier to query leave balance for."
        },
        leaveType: {
          type: "string",
          description: "Optional leave type code (e.g. 'annual', 'sick'). Omit to return balance across all types."
        }
      }
    },
    outputSchema: {
      type: "object",
      required: ["balance", "totalEntitlement", "usedDays", "remainingDays"],
      additionalProperties: false,
      properties: {
        balance: { type: "number", description: "Remaining leave days (alias for remainingDays)." },
        totalEntitlement: { type: "number", description: "Total annual leave days the employee is entitled to." },
        usedDays: { type: "number", description: "Days of approved leave taken this year." },
        remainingDays: { type: "number", description: "Days remaining for the current year." },
        leaveType: { type: "string", description: "The leave type filter applied, if any." }
      }
    }
  };

  public abstract execute(
    request: ToolExecutionRequest,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult>;
}

export class iMach360GetLeaveBalanceTool extends GetLeaveBalanceTool {
  public constructor(private readonly connector: iMach360ConnectorPort) {
    super();
  }

  public override async execute(
    request: ToolExecutionRequest,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    const input = GetLeaveBalanceInputSchema.parse(request.input);

    const response = await this.connector.getLeaveBalance({
      tenantId: context.tenantId,
      userId: context.userId,
      correlationId: context.correlationId,
      callerToken: context.callerToken,
      employeeId: input.employeeId,
      leaveType: input.leaveType
    });

    const { balance } = response;

    return {
      toolId: this.definition.id,
      executionId: context.correlationId ?? `${this.definition.id}:${Date.now()}`,
      status: "succeeded",
      output: {
        balance: balance.remainingDays,
        totalEntitlement: balance.totalEntitlement,
        usedDays: balance.usedDays,
        remainingDays: balance.remainingDays,
        leaveType: balance.leaveType
      },
      metadata: {
        sourceSystem: response.sourceSystem,
        employeeId: input.employeeId
      }
    };
  }
}

export const createGetLeaveBalanceToolFactory = (connector: iMach360ConnectorPort): ToolPluginFactory => ({
  create: () => new iMach360GetLeaveBalanceTool(connector)
});
