import type { LlmProviderName, LlmProviderPort } from "./llm-provider.port";

export interface LlmProviderConfig {
  provider: LlmProviderName;
  defaultModel: string;
  gemini: {
    apiKey?: string;
    baseUrl: string;
  };
}

export interface LlmProviderFactory {
  create(providerName?: LlmProviderName): LlmProviderPort;
}
