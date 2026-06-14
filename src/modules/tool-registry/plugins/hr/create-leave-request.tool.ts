import { z } from "zod";
import type { iMach360ConnectorPort } from "../../../imach360-connector/contracts/imach360-connector.port";
import type { ToolExecutionContext, ToolPlugin, ToolPluginFactory } from "../../contracts/tool-plugin.contracts";
import type { ToolDefinition, ToolExecutionRequest, ToolExecutionResult } from "../../contracts/tool-registry.port";

export const CREATE_LEAVE_REQUEST_TOOL_ID = "hr.create-leave-request";

const CreateLeaveRequestInputSchema = z
  .object({
    employeeId: z.string().min(1),
    leaveType: z.string().min(1),
    fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "fromDate must be in ISO-8601 date format (YYYY-MM-DD)"),
    toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "toDate must be in ISO-8601 date format (YYYY-MM-DD)"),
    reason: z.string().optional()
  })
  .strict();

const CreateLeaveRequestOutputSchema = z
  .object({
    leaveId: z.string().min(1),
    status: z.enum(["submitted", "pending-approval"])
  })
  .strict();

export abstract class CreateLeaveRequestTool implements ToolPlugin {
  public readonly inputValidator = CreateLeaveRequestInputSchema;
  public readonly outputValidator = CreateLeaveRequestOutputSchema;

  public readonly definition: ToolDefinition = {
    id: CREATE_LEAVE_REQUEST_TOOL_ID,
    name: "CreateLeaveRequest",
    description:
      "Submits a new leave request for an employee. Use only when the user explicitly asks to apply for, book, or request leave. Requires approval before the leave is confirmed.",
    version: "2.0.0",
    providerType: "internal" as const,
    executionMode: "sync" as const,
    enabled: true,
    tags: ["hr", "leave", "transactional"],
    metadata: {
      domain: "leave",
      sourceSystem: "imach360",
      requiresApproval: true
    },
    inputSchema: {
      type: "object",
      required: ["employeeId", "leaveType", "fromDate", "toDate"],
      additionalProperties: false,
      properties: {
        employeeId: {
          type: "string",
          description: "The employee identifier submitting the leave request."
        },
        leaveType: {
          type: "string",
          description: "Leave type code (e.g. 'annual', 'sick', 'casual')."
        },
        fromDate: {
          type: "string",
          description: "Leave start date in ISO-8601 format (YYYY-MM-DD)."
        },
        toDate: {
          type: "string",
          description: "Leave end date in ISO-8601 format (YYYY-MM-DD)."
        },
        reason: {
          type: "string",
          description: "Optional reason for the leave request."
        }
      }
    },
    outputSchema: {
      type: "object",
      required: ["leaveId", "status"],
      additionalProperties: false,
      properties: {
        leaveId: { type: "string", description: "The created leave request ID." },
        status: {
          type: "string",
          enum: ["submitted", "pending-approval"],
          description: "Submission status. Leave requires manager approval."
        }
      }
    }
  };

  public abstract execute(
    request: ToolExecutionRequest,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult>;
}

export class iMach360CreateLeaveRequestTool extends CreateLeaveRequestTool {
  public constructor(private readonly connector: iMach360ConnectorPort) {
    super();
  }

  public override async execute(
    request: ToolExecutionRequest,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    const input = CreateLeaveRequestInputSchema.parse(request.input);

    const response = await this.connector.createLeaveRequest({
      tenantId: context.tenantId,
      userId: context.userId,
      correlationId: context.correlationId,
      callerToken: context.callerToken,
      employeeId: input.employeeId,
      leaveType: input.leaveType,
      fromDate: input.fromDate,
      toDate: input.toDate,
      reason: input.reason
    });

    return {
      toolId: this.definition.id,
      executionId: context.correlationId ?? `${this.definition.id}:${Date.now()}`,
      status: "succeeded",
      output: {
        leaveId: response.leaveId,
        status: response.status
      },
      metadata: {
        sourceSystem: response.sourceSystem,
        employeeId: input.employeeId
      }
    };
  }
}

export const createLeaveRequestToolFactory = (connector: iMach360ConnectorPort): ToolPluginFactory => ({
  create: () => new iMach360CreateLeaveRequestTool(connector)
});
