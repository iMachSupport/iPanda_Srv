import type { ToolPluginModule } from "../../contracts/tool-plugin.contracts";
import { createLeaveRequestToolFactory } from "./create-leave-request.tool";
import { getEmployeeDetailsToolFactory } from "./get-employee-details.tool";
import { getLeaveBalanceToolFactory } from "./get-leave-balance.tool";

export const hrToolPluginModule: ToolPluginModule = {
  namespace: "hr",
  tools: [
    getLeaveBalanceToolFactory,
    getEmployeeDetailsToolFactory,
    createLeaveRequestToolFactory
  ]
};
