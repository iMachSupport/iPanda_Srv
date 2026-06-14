import type { iMach360ConnectorPort } from "../../../imach360-connector/contracts/imach360-connector.port";
import type { ToolPluginModule } from "../../contracts/tool-plugin.contracts";
import { createGetEmployeeAssetsToolFactory } from "./get-employee-assets.tool";

export const createAssetToolPluginModule = (connector: iMach360ConnectorPort): ToolPluginModule => ({
  namespace: "assets",
  tools: [createGetEmployeeAssetsToolFactory(connector)]
});
