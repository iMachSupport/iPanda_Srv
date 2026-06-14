import { AppError } from "../../../../shared/errors/app-error";
import type { LlmCompletionRequest, LlmCompletionResponse, LlmProviderPort } from "../../contracts/llm-provider.port";

export class ClaudeProviderPlaceholder implements LlmProviderPort {
  public readonly providerName = "claude" as const;

  public async complete(_request: LlmCompletionRequest): Promise<LlmCompletionResponse> {
    throw new AppError("Claude provider is not implemented yet", 501, "LLM_PROVIDER_NOT_IMPLEMENTED");
  }
}
