import { z } from "zod";
import type { ToolExecutionContext, ToolPlugin, ToolPluginFactory } from "../../contracts/tool-plugin.contracts";
import type { ToolDefinition, ToolExecutionRequest, ToolExecutionResult } from "../../contracts/tool-registry.port";

export const CREATE_LEAVE_REQUEST_TOOL_ID = "hr.create-leave-request";

const CreateLeaveRequestInputSchema = z
  .object({
    employeeId: z.string().min(1),
    leaveType: z.string().min(1),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    reason: z.string().optional()
  })
  .strict();

const CreateLeaveRequestOutputSchema = z
  .object({
    requestId: z.string().min(1),
    status: z.enum(["submitted", "pending-approval", "rejected"])
  })
  .strict();

export abstract class CreateLeaveRequestTool implements ToolPlugin {
  public readonly inputValidator = CreateLeaveRequestInputSchema;
  public readonly outputValidator = CreateLeaveRequestOutputSchema;

  public readonly definition: ToolDefinition = {
    id: CREATE_LEAVE_REQUEST_TOOL_ID,
    name: "CreateLeaveRequest",
    description: "Creates a leave request for an employee.",
    version: "1.0.0",
    providerType: "sap" as const,
    executionMode: "sync" as const,
    enabled: true,
    tags: ["hr", "leave", "sap", "transactional"],
    inputSchema: {
      type: "object",
      required: ["employeeId", "leaveType", "startDate", "endDate"],
      additionalProperties: false,
      properties: {
        employeeId: {
          type: "string",
          description: "Enterprise employee identifier."
        },
        leaveType: {
          type: "string",
          description: "Leave type code."
        },
        startDate: {
          type: "string",
          description: "Leave start date in ISO-8601 date format."
        },
        endDate: {
          type: "string",
          description: "Leave end date in ISO-8601 date format."
        },
        reason: {
          type: "string",
          description: "Optional employee-entered reason."
        }
      }
    },
    outputSchema: {
      type: "object",
      required: ["requestId", "status"],
      additionalProperties: false,
      properties: {
        requestId: { type: "string" },
        status: {
          type: "string",
          enum: ["submitted", "pending-approval", "rejected"]
        }
      }
    }
  };

  public abstract execute(
    request: ToolExecutionRequest,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult>;
}

class CreateLeaveRequestToolPlaceholder extends CreateLeaveRequestTool {
  public override async execute(
    request: ToolExecutionRequest,
    _context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    return {
      toolId: this.definition.id,
      executionId: request.correlationId ?? `${this.definition.id}:pending`,
      status: "failed",
      output: null,
      error: {
        code: "TOOL_NOT_IMPLEMENTED",
        message: "CreateLeaveRequest implementation is pending."
      }
    };
  }
}

export const createLeaveRequestToolFactory: ToolPluginFactory = {
  create: () => new CreateLeaveRequestToolPlaceholder()
};
