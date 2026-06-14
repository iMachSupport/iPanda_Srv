import { z } from "zod";
import type { iMach360ConnectorPort } from "../../../imach360-connector/contracts/imach360-connector.port";
import type { ToolExecutionContext, ToolPlugin, ToolPluginFactory } from "../../contracts/tool-plugin.contracts";
import type { ToolDefinition, ToolExecutionRequest, ToolExecutionResult } from "../../contracts/tool-registry.port";

export const CREATE_TICKET_TOOL_ID = "itdesk.create-ticket";

const CreateTicketInputSchema = z
  .object({
    title: z.string().min(1).max(200),
    description: z.string().min(1),
    type: z.string().min(1),
    priority: z.enum(["low", "medium", "high", "critical"]),
    assignedTo: z.string().optional()
  })
  .strict();

const CreateTicketOutputSchema = z
  .object({
    ticketId: z.string().min(1),
    status: z.literal("open")
  })
  .strict();

export class CreateTicketTool implements ToolPlugin {
  public readonly inputValidator = CreateTicketInputSchema;
  public readonly outputValidator = CreateTicketOutputSchema;

  public readonly definition: ToolDefinition = {
    id: CREATE_TICKET_TOOL_ID,
    name: "CreateTicket",
    description:
      "Creates a new IT support ticket or help desk request. Use only when the user explicitly asks to raise, create, or log an IT issue or support request. Do not use for general questions about existing tickets.",
    version: "1.0.0",
    providerType: "internal" as const,
    executionMode: "sync" as const,
    enabled: true,
    tags: ["itdesk", "tickets", "transactional"],
    metadata: {
      domain: "itdesk",
      sourceSystem: "imach360",
      requiresApproval: false
    },
    inputSchema: {
      type: "object",
      required: ["title", "description", "type", "priority"],
      additionalProperties: false,
      properties: {
        title: {
          type: "string",
          description: "Short summary of the issue (max 200 characters)."
        },
        description: {
          type: "string",
          description: "Detailed description of the issue or request."
        },
        type: {
          type: "string",
          description: "Ticket category (e.g. 'hardware', 'software', 'access', 'network')."
        },
        priority: {
          type: "string",
          enum: ["low", "medium", "high", "critical"],
          description: "Priority level for the ticket."
        },
        assignedTo: {
          type: "string",
          description: "Optional user ID to assign the ticket to."
        }
      }
    },
    outputSchema: {
      type: "object",
      required: ["ticketId", "status"],
      additionalProperties: false,
      properties: {
        ticketId: { type: "string", description: "The created ticket ID." },
        status: { type: "string", enum: ["open"] }
      }
    }
  };

  public constructor(private readonly connector: iMach360ConnectorPort) {}

  public async execute(
    request: ToolExecutionRequest,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    const input = CreateTicketInputSchema.parse(request.input);

    const response = await this.connector.createTicket({
      tenantId: context.tenantId,
      userId: context.userId,
      correlationId: context.correlationId,
      callerToken: context.callerToken,
      title: input.title,
      description: input.description,
      type: input.type,
      priority: input.priority,
      assignedTo: input.assignedTo
    });

    return {
      toolId: this.definition.id,
      executionId: context.correlationId ?? `${this.definition.id}:${Date.now()}`,
      status: "succeeded",
      output: {
        ticketId: response.ticketId,
        status: response.status
      },
      metadata: {
        sourceSystem: response.sourceSystem
      }
    };
  }
}

export const createCreateTicketToolFactory = (connector: iMach360ConnectorPort): ToolPluginFactory => ({
  create: () => new CreateTicketTool(connector)
});
