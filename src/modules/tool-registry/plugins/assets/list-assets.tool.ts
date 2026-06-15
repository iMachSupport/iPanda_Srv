import { z } from "zod";
import type { iMach360ConnectorPort } from "../../../imach360-connector/contracts/imach360-connector.port";
import type { ToolExecutionContext, ToolPlugin, ToolPluginFactory } from "../../contracts/tool-plugin.contracts";
import type { ToolDefinition, ToolExecutionRequest, ToolExecutionResult } from "../../contracts/tool-registry.port";

export const LIST_ASSETS_TOOL_ID = "assets.list-assets";

const ListAssetsInputSchema = z
  .object({
    status: z.enum(["available", "assigned", "maintenance", "retired"]).optional(),
    assetType: z.string().min(1).optional()
  })
  .strict();

const ListAssetsOutputSchema = z
  .object({
    assets: z.array(
      z.object({
        id: z.string(),
        assetCode: z.string(),
        assetName: z.string(),
        assetType: z.string(),
        status: z.enum(["available", "assigned", "maintenance", "retired"]),
        assignedTo: z.string().optional(),
        assignedUserName: z.string().optional()
      })
    ),
    total: z.number()
  })
  .strict();

export class ListAssetsTool implements ToolPlugin {
  public readonly inputValidator = ListAssetsInputSchema;
  public readonly outputValidator = ListAssetsOutputSchema;

  public readonly definition: ToolDefinition = {
    id: LIST_ASSETS_TOOL_ID,
    name: "ListAssets",
    description:
      "Lists all company IT assets and equipment. Can be filtered by status (available, assigned, maintenance, retired) or asset type (e.g. laptop, phone). Use when a user asks about available equipment, asset inventory, or wants to see all assets of a certain type.",
    version: "1.0.0",
    providerType: "internal" as const,
    executionMode: "sync" as const,
    enabled: true,
    tags: ["assets"],
    metadata: {
      domain: "assets",
      sourceSystem: "imach360"
    },
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        status: {
          type: "string",
          enum: ["available", "assigned", "maintenance", "retired"],
          description: "Filter assets by status."
        },
        assetType: {
          type: "string",
          description: "Filter assets by type (e.g. 'laptop', 'phone', 'monitor')."
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
              assignedTo: { type: "string" },
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
    const input = ListAssetsInputSchema.parse(request.input);

    const response = await this.connector.listAssets({
      tenantId: context.tenantId,
      userId: context.userId,
      correlationId: context.correlationId,
      callerToken: context.callerToken,
      status: input.status,
      assetType: input.assetType
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
        sourceSystem: response.sourceSystem
      }
    };
  }
}

export const createListAssetsToolFactory = (connector: iMach360ConnectorPort): ToolPluginFactory => ({
  create: () => new ListAssetsTool(connector)
});
