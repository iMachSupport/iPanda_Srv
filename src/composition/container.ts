import { env } from "../config/environment";
import { iMach360HttpAdapterImpl } from "../modules/imach360-connector/adapters/imach360-http.adapter";
import { PinoImachio360AuditService } from "../modules/imach360-connector/audit/pino-imach360-audit.service";
import {
  CredentialAuthStrategy,
  ServiceAccountAuthStrategy,
  TokenPropagationAuthStrategy
} from "../modules/imach360-connector/auth/imach360-auth-strategies";
import { DefaultImachio360AuthStrategyRegistry } from "../modules/imach360-connector/auth/imach360-auth-strategy-registry";
import type { iMach360ConnectorPort } from "../modules/imach360-connector/contracts/imach360-connector.port";
import { DefaultImachio360ConnectorService } from "../modules/imach360-connector/services/default-imach360-connector.service";
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
import { createAssetToolPluginModule } from "../modules/tool-registry/plugins/assets";
import { createHrToolPluginModule } from "../modules/tool-registry/plugins/hr";
import { createItDeskToolPluginModule } from "../modules/tool-registry/plugins/itdesk";
import { InMemoryToolRegistryService } from "../modules/tool-registry/services/in-memory-tool-registry.service";

export interface ApplicationContainer {
  llmProviderFactory: DefaultLlmProviderFactory;
  llmProvider: LlmProviderPort;
  connector: iMach360ConnectorPort;
  toolRegistry: ToolRegistryPort;
  agentRuntime: AgentRuntimePort;
}

export const createApplicationContainer = async (): Promise<ApplicationContainer> => {
  // LLM
  const llmProviderFactory = new DefaultLlmProviderFactory(llmProviderConfig);
  const llmProvider = llmProviderFactory.create();

  // iMach360 Connector
  const authRegistry = new DefaultImachio360AuthStrategyRegistry();
  authRegistry.register(new TokenPropagationAuthStrategy());

  if (env.IMACH360_SERVICE_EMAIL && env.IMACH360_SERVICE_PASSWORD) {
    authRegistry.register(
      new CredentialAuthStrategy(
        env.IMACH360_SERVICE_EMAIL,
        env.IMACH360_SERVICE_PASSWORD,
        `${env.IMACH360_API_URL}/api/auth/login`
      )
    );
  } else if (env.IMACH360_SERVICE_TOKEN) {
    authRegistry.register(new ServiceAccountAuthStrategy(env.IMACH360_SERVICE_TOKEN));
  }

  const httpAdapter = new iMach360HttpAdapterImpl({
    baseUrl: env.IMACH360_API_URL,
    authStrategyRegistry: authRegistry
  });

  const auditService = new PinoImachio360AuditService();

  const connector = new DefaultImachio360ConnectorService(httpAdapter, auditService, {
    leaveAnnualEntitlement: env.IMACH360_LEAVE_ANNUAL_ENTITLEMENT
  });

  // Tool Registry
  const toolRegistry = new InMemoryToolRegistryService();

  await toolRegistry.registerModule(createHrToolPluginModule(connector));
  await toolRegistry.registerModule(createAssetToolPluginModule(connector));
  await toolRegistry.registerModule(createItDeskToolPluginModule(connector));

  // Agent Runtime
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
    connector,
    toolRegistry,
    agentRuntime
  };
};
