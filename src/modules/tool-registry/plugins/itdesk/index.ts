import type { iMach360ConnectorPort } from "../../../imach360-connector/contracts/imach360-connector.port";
import type { ToolPluginModule } from "../../contracts/tool-plugin.contracts";
import { createCreateTicketToolFactory } from "./create-ticket.tool";
import { createListTicketsToolFactory } from "./list-tickets.tool";

export const createItDeskToolPluginModule = (connector: iMach360ConnectorPort): ToolPluginModule => ({
  namespace: "itdesk",
  tools: [createListTicketsToolFactory(connector), createCreateTicketToolFactory(connector)]
});
