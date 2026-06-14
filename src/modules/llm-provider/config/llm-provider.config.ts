import { env } from "../../../config/environment";
import type { LlmProviderConfig } from "../contracts/llm-provider-factory.contracts";

export const llmProviderConfig: LlmProviderConfig = {
  provider: env.LLM_PROVIDER,
  defaultModel: env.LLM_DEFAULT_MODEL,
  gemini: {
    apiKey: env.GEMINI_API_KEY,
    baseUrl: env.GEMINI_BASE_URL
  }
};
