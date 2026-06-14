import { z } from "zod";
import type { iMach360ConnectorPort } from "../../../imach360-connector/contracts/imach360-connector.port";
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
    empId: z.string().min(1),
    displayName: z.string().min(1),
    email: z.string().optional(),
    department: z.string().optional(),
    jobTitle: z.string().optional(),
    managerId: z.string().optional(),
    employmentStatus: z.enum(["active", "inactive"]).optional()
  })
  .strict();

export abstract class GetEmployeeDetailsTool implements ToolPlugin {
  public readonly inputValidator = GetEmployeeDetailsInputSchema;
  public readonly outputValidator = GetEmployeeDetailsOutputSchema;

  public readonly definition: ToolDefinition = {
    id: GET_EMPLOYEE_DETAILS_TOOL_ID,
    name: "GetEmployeeDetails",
    description:
      "Retrieves the full employee profile including name, email, department, job title, and manager. Use when the user asks about a specific person's details or organizational assignment.",
    version: "2.0.0",
    providerType: "internal" as const,
    executionMode: "sync" as const,
    enabled: true,
    tags: ["hr", "employee"],
    metadata: {
      domain: "employee",
      sourceSystem: "imach360"
    },
    inputSchema: {
      type: "object",
      required: ["employeeId"],
      additionalProperties: false,
      properties: {
        employeeId: {
          type: "string",
          description: "The employee identifier (MongoDB _id or emp_id)."
        }
      }
    },
    outputSchema: {
      type: "object",
      required: ["employeeId", "empId", "displayName"],
      additionalProperties: false,
      properties: {
        employeeId: { type: "string" },
        empId: { type: "string" },
        displayName: { type: "string" },
        email: { type: "string" },
        department: { type: "string" },
        jobTitle: { type: "string" },
        managerId: { type: "string" },
        employmentStatus: { type: "string", enum: ["active", "inactive"] }
      }
    }
  };

  public abstract execute(
    request: ToolExecutionRequest,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult>;
}

export class iMach360GetEmployeeDetailsTool extends GetEmployeeDetailsTool {
  public constructor(private readonly connector: iMach360ConnectorPort) {
    super();
  }

  public override async execute(
    request: ToolExecutionRequest,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    const input = GetEmployeeDetailsInputSchema.parse(request.input);

    const response = await this.connector.getEmployeeById({
      tenantId: context.tenantId,
      userId: context.userId,
      correlationId: context.correlationId,
      callerToken: context.callerToken,
      employeeId: input.employeeId
    });

    const { employee } = response;

    return {
      toolId: this.definition.id,
      executionId: context.correlationId ?? `${this.definition.id}:${Date.now()}`,
      status: "succeeded",
      output: {
        employeeId: employee.id,
        empId: employee.empId,
        displayName: employee.displayName,
        email: employee.email,
        department: employee.department,
        jobTitle: employee.jobTitle,
        managerId: employee.managerId,
        employmentStatus: employee.employmentStatus
      },
      metadata: {
        sourceSystem: response.sourceSystem
      }
    };
  }
}

export const createGetEmployeeDetailsToolFactory = (connector: iMach360ConnectorPort): ToolPluginFactory => ({
  create: () => new iMach360GetEmployeeDetailsTool(connector)
});
