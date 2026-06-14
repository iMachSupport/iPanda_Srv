import { z } from "zod";
import type { ToolExecutionContext, ToolPlugin, ToolPluginFactory } from "../../contracts/tool-plugin.contracts";
import type { ToolDefinition, ToolExecutionRequest, ToolExecutionResult } from "../../contracts/tool-registry.port";

export const GET_EMPLOYEE_DETAILS_TOOL_ID = "hr.get-employee-details";

const GetEmployeeDetailsInputSchema = z
  .object({
    employeeId: z.string().min(1)
  })
  .strict();

const GetEmployeeDetailsOutputSchema = z
  .object({
    employeeId: z.string().min(1),
    displayName: z.string().min(1),
    email: z.string().optional(),
    department: z.string().optional(),
    managerId: z.string().optional()
  })
  .strict();

export abstract class GetEmployeeDetailsTool implements ToolPlugin {
  public readonly inputValidator = GetEmployeeDetailsInputSchema;
  public readonly outputValidator = GetEmployeeDetailsOutputSchema;

  public readonly definition: ToolDefinition = {
    id: GET_EMPLOYEE_DETAILS_TOOL_ID,
    name: "GetEmployeeDetails",
    description: "Retrieves employee profile and organizational assignment details.",
    version: "1.0.0",
    providerType: "sap" as const,
    executionMode: "sync" as const,
    enabled: true,
    tags: ["hr", "employee", "sap"],
    inputSchema: {
      type: "object",
      required: ["employeeId"],
      additionalProperties: false,
      properties: {
        employeeId: {
          type: "string",
          description: "Enterprise employee identifier."
        }
      }
    },
    outputSchema: {
      type: "object",
      required: ["employeeId", "displayName"],
      additionalProperties: false,
      properties: {
        employeeId: { type: "string" },
        displayName: { type: "string" },
        email: { type: "string" },
        department: { type: "string" },
        managerId: { type: "string" }
      }
    }
  };

  public abstract execute(
    request: ToolExecutionRequest,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult>;
}

class GetEmployeeDetailsToolPlaceholder extends GetEmployeeDetailsTool {
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
        message: "GetEmployeeDetails implementation is pending."
      }
    };
  }
}

export const getEmployeeDetailsToolFactory: ToolPluginFactory = {
  create: () => new GetEmployeeDetailsToolPlaceholder()
};
