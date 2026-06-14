import type { iMach360ConnectorPort } from "../../../imach360-connector/contracts/imach360-connector.port";
import type { ToolPluginModule } from "../../contracts/tool-plugin.contracts";
import { createLeaveRequestToolFactory } from "./create-leave-request.tool";
import { createGetEmployeeDetailsToolFactory } from "./get-employee-details.tool";
import { createGetLeaveBalanceToolFactory } from "./get-leave-balance.tool";

export const createHrToolPluginModule = (connector: iMach360ConnectorPort): ToolPluginModule => ({
  namespace: "hr",
  tools: [
    createGetLeaveBalanceToolFactory(connector),
    createGetEmployeeDetailsToolFactory(connector),
    createLeaveRequestToolFactory(connector)
  ]
});
