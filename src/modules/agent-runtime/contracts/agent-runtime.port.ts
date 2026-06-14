import type { RuntimeRequest, RuntimeResponse } from "./runtime.types";

export interface AgentRuntimePort {
  execute(request: RuntimeRequest): Promise<RuntimeResponse>;
}
