import { z } from "zod";
import type { iMach360ConnectorPort } from "../../../imach360-connector/contracts/imach360-connector.port";
import type { ToolExecutionContext, ToolPlugin, ToolPluginFactory } from "../../contracts/tool-plugin.contracts";
import type { ToolDefinition, ToolExecutionRequest, ToolExecutionResult } from "../../contracts/tool-registry.port";

export const LIST_TICKETS_TOOL_ID = "itdesk.list-tickets";

const ListTicketsInputSchema = z
  .object({
    status: z.enum(["open", "in-progress", "resolved", "closed"]).optional(),
    priority: z.enum(["low", "medium", "high", "critical"]).optional()
  })
  .strict();

const ListTicketsOutputSchema = z
  .object({
    tickets: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        type: z.string(),
        priority: z.string(),
        status: z.string(),
        raisedBy: z.string(),
        assignedTo: z.string().optional(),
        createdAt: z.string()
      })
    ),
    total: z.number()
  })
  .strict();

export class ListTicketsTool implements ToolPlugin {
  public readonly inputValidator = ListTicketsInputSchema;
  public readonly outputValidator = ListTicketsOutputSchema;

  public readonly definition: ToolDefinition = {
    id: LIST_TICKETS_TOOL_ID,
    name: "ListTickets",
    description:
      "Lists IT support tickets visible to the current user. Can be filtered by status (open, in-progress, resolved, closed) or priority (low, medium, high, critical). Use when a user asks about their support tickets, IT requests, or help desk issues.",
    version: "1.0.0",
    providerType: "internal" as const,
    executionMode: "sync" as const,
    enabled: true,
    tags: ["itdesk", "tickets"],
    metadata: {
      domain: "itdesk",
      sourceSystem: "imach360"
    },
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        status: {
          type: "string",
          enum: ["open", "in-progress", "resolved", "closed"],
          description: "Filter tickets by status."
        },
        priority: {
          type: "string",
          enum: ["low", "medium", "high", "critical"],
          description: "Filter tickets by priority."
        }
      }
    },
    outputSchema: {
      type: "object",
      required: ["tickets", "total"],
      additionalProperties: false,
      properties: {
        tickets: { type: "array" },
        total: { type: "number" }
      }
    }
  };

  public constructor(private readonly connector: iMach360ConnectorPort) {}

  public async execute(
    request: ToolExecutionRequest,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    const input = ListTicketsInputSchema.parse(request.input);

    const response = await this.connector.listTickets({
      tenantId: context.tenantId,
      userId: context.userId,
      correlationId: context.correlationId,
      callerToken: context.callerToken,
      status: input.status,
      priority: input.priority
    });

    return {
      toolId: this.definition.id,
      executionId: context.correlationId ?? `${this.definition.id}:${Date.now()}`,
      status: "succeeded",
      output: {
        tickets: response.tickets,
        total: response.total
      },
      metadata: {
        sourceSystem: response.sourceSystem
      }
    };
  }
}

export const createListTicketsToolFactory = (connector: iMach360ConnectorPort): ToolPluginFactory => ({
  create: () => new ListTicketsTool(connector)
});
