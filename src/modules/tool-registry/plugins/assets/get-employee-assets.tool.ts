import { z } from "zod";
import type { iMach360ConnectorPort } from "../../../imach360-connector/contracts/imach360-connector.port";
import type { ToolExecutionContext, ToolPlugin, ToolPluginFactory } from "../../contracts/tool-plugin.contracts";
import type { ToolDefinition, ToolExecutionRequest, ToolExecutionResult } from "../../contracts/tool-registry.port";

export const GET_EMPLOYEE_ASSETS_TOOL_ID = "assets.get-employee-assets";

const GetEmployeeAssetsInputSchema = z
  .object({
    employeeId: z.string().min(1)
  })
  .strict();

const GetEmployeeAssetsOutputSchema = z
  .object({
    assets: z.array(
      z.object({
        id: z.string(),
        assetCode: z.string(),
        assetName: z.string(),
        assetType: z.string(),
        status: z.enum(["available", "assigned", "maintenance", "retired"]),
        assignedUserName: z.string().optional()
      })
    ),
    total: z.number()
  })
  .strict();

export class GetEmployeeAssetsTool implements ToolPlugin {
  public readonly inputValidator = GetEmployeeAssetsInputSchema;
  public readonly outputValidator = GetEmployeeAssetsOutputSchema;

  public readonly definition: ToolDefinition = {
    id: GET_EMPLOYEE_ASSETS_TOOL_ID,
    name: "GetEmployeeAssets",
    description:
      "Lists all IT assets and equipment currently assigned to an employee, including laptops, phones, and peripherals. Use when a user asks what equipment they have or what assets are assigned to someone.",
    version: "1.0.0",
    providerType: "internal" as const,
    executionMode: "sync" as const,
    enabled: true,
    tags: ["assets", "employee"],
    metadata: {
      domain: "assets",
      sourceSystem: "imach360"
    },
    inputSchema: {
      type: "object",
      required: ["employeeId"],
      additionalProperties: false,
      properties: {
        employeeId: {
          type: "string",
          description: "The employee identifier to retrieve assets for."
        }
      }
    },
    outputSchema: {
      type: "object",
      required: ["assets", "total"],
      additionalProperties: false,
      properties: {
        assets: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              assetCode: { type: "string" },
              assetName: { type: "string" },
              assetType: { type: "string" },
              status: { type: "string" },
              assignedUserName: { type: "string" }
            }
          }
        },
        total: { type: "number" }
      }
    }
  };

  public constructor(private readonly connector: iMach360ConnectorPort) {}

  public async execute(
    request: ToolExecutionRequest,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    const input = GetEmployeeAssetsInputSchema.parse(request.input);

    const response = await this.connector.getEmployeeAssets({
      tenantId: context.tenantId,
      userId: context.userId,
      correlationId: context.correlationId,
      callerToken: context.callerToken,
      employeeId: input.employeeId
    });

    return {
      toolId: this.definition.id,
      executionId: context.correlationId ?? `${this.definition.id}:${Date.now()}`,
      status: "succeeded",
      output: {
        assets: response.assets,
        total: response.total
      },
      metadata: {
        sourceSystem: response.sourceSystem,
        employeeId: input.employeeId
      }
    };
  }
}

export const createGetEmployeeAssetsToolFactory = (connector: iMach360ConnectorPort): ToolPluginFactory => ({
  create: () => new GetEmployeeAssetsTool(connector)
});
