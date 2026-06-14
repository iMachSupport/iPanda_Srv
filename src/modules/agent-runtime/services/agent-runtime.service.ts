import type { AgentRuntimePort } from "../contracts/agent-runtime.port";
import type {
  ExecutionContextService,
  RequestPlannerService,
  ResponseComposerService,
  RuntimeActionExecutorService,
  RuntimeOrchestrator
} from "../contracts/runtime-orchestration.contracts";
import type { RuntimeRequest, RuntimeResponse } from "../contracts/runtime.types";
import type { LlmProviderPort } from "../../llm-provider/contracts/llm-provider.port";

export interface AgentRuntimeDependencies {
  contextService: ExecutionContextService;
  plannerService: RequestPlannerService;
  actionExecutorService: RuntimeActionExecutorService;
  responseComposerService: ResponseComposerService;
  llmProvider: LlmProviderPort;
}

export abstract class AgentRuntimeService implements AgentRuntimePort, RuntimeOrchestrator {
  protected constructor(protected readonly dependencies: AgentRuntimeDependencies) {}

  public abstract execute(request: RuntimeRequest): Promise<RuntimeResponse>;
}
