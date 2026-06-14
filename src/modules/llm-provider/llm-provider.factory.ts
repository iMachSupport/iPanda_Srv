import type { LlmProviderConfig, LlmProviderFactory } from "./contracts/llm-provider-factory.contracts";
import type { LlmProviderName, LlmProviderPort } from "./contracts/llm-provider.port";
import { ClaudeProviderPlaceholder } from "./providers/claude/claude-provider.placeholder";
import { GeminiProvider } from "./providers/gemini/gemini-provider";
import { OpenAiProviderPlaceholder } from "./providers/openai/openai-provider.placeholder";

export class DefaultLlmProviderFactory implements LlmProviderFactory {
  public constructor(private readonly config: LlmProviderConfig) {}

  public create(providerName: LlmProviderName = this.config.provider): LlmProviderPort {
    switch (providerName) {
      case "gemini":
        return new GeminiProvider({
          apiKey: this.config.gemini.apiKey,
          baseUrl: this.config.gemini.baseUrl,
          defaultModel: this.config.defaultModel
        });
      case "openai":
        return new OpenAiProviderPlaceholder();
      case "claude":
        return new ClaudeProviderPlaceholder();
    }
  }
}
