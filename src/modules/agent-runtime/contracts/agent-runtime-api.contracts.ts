import type { RuntimeRequest, RuntimeResponse } from "./runtime.types";

export const AGENT_RUNTIME_API = {
  basePath: "/api/v1/agent-runtime",
  execute: {
    method: "POST",
    path: "/execute"
  },
  getContext: {
    method: "GET",
    path: "/contexts/:contextId"
  },
  getContextSnapshot: {
    method: "GET",
    path: "/contexts/:contextId/snapshots/:snapshotId"
  }
} as const;

export type ExecuteAgentRuntimeRequestDto = RuntimeRequest;
export type ExecuteAgentRuntimeResponseDto = RuntimeResponse;

export interface GetExecutionContextParamsDto {
  contextId: string;
}

export interface GetExecutionContextSnapshotParamsDto {
  contextId: string;
  snapshotId: string;
}
