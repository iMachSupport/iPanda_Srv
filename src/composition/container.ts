import { llmProviderConfig } from "../modules/llm-provider/config/llm-provider.config";
import type { LlmProviderPort } from "../modules/llm-provider/contracts/llm-provider.port";
import { DefaultLlmProviderFactory } from "../modules/llm-provider/llm-provider.factory";
import type { AgentRuntimePort } from "../modules/agent-runtime/contracts/agent-runtime.port";
import { SimpleAgentRuntimeService } from "../modules/agent-runtime/services/simple-agent-runtime.service";
import { SimpleExecutionContextService } from "../modules/agent-runtime/services/simple-execution-context.service";
import { SimpleRequestPlannerService } from "../modules/agent-runtime/services/simple-request-planner.service";
import { SimpleResponseComposerService } from "../modules/agent-runtime/services/simple-response-composer.service";
import { ToolRuntimeActionExecutorService } from "../modules/agent-runtime/services/tool-runtime-action-executor.service";
import type { ToolRegistryPort } from "../modules/tool-registry/contracts/tool-registry.port";
import { hrToolPluginModule } from "../modules/tool-registry/plugins/hr";
import { InMemoryToolRegistryService } from "../modules/tool-registry/services/in-memory-tool-registry.service";

export interface ApplicationContainer {
  llmProviderFactory: DefaultLlmProviderFactory;
  llmProvider: LlmProviderPort;
  toolRegistry: ToolRegistryPort;
  agentRuntime: AgentRuntimePort;
}

export const createApplicationContainer = async (): Promise<ApplicationContainer> => {
  const llmProviderFactory = new DefaultLlmProviderFactory(llmProviderConfig);
  const llmProvider = llmProviderFactory.create();
  const toolRegistry = new InMemoryToolRegistryService();

  await toolRegistry.registerModule(hrToolPluginModule);

  const agentRuntime = new SimpleAgentRuntimeService({
    contextService: new SimpleExecutionContextService(),
    plannerService: new SimpleRequestPlannerService(toolRegistry),
    actionExecutorService: new ToolRuntimeActionExecutorService(toolRegistry),
    responseComposerService: new SimpleResponseComposerService(),
    llmProvider
  });

  return {
    llmProviderFactory,
    llmProvider,
    toolRegistry,
    agentRuntime
  };
};
