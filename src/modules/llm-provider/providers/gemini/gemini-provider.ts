import { AppError } from "../../../../shared/errors/app-error";
import type {
  LlmCompletionRequest,
  LlmCompletionResponse,
  LlmMessage,
  LlmProviderPort
} from "../../contracts/llm-provider.port";
import type {
  GeminiContent,
  GeminiGenerateContentRequest,
  GeminiGenerateContentResponse
} from "./gemini.types";

export interface GeminiProviderOptions {
  apiKey?: string;
  baseUrl: string;
  defaultModel: string;
  fetchClient?: typeof fetch;
}

export class GeminiProvider implements LlmProviderPort {
  public readonly providerName = "gemini" as const;

  private readonly fetchClient: typeof fetch;

  public constructor(private readonly options: GeminiProviderOptions) {
    this.fetchClient = options.fetchClient ?? fetch;
  }

  public async complete(request: LlmCompletionRequest): Promise<LlmCompletionResponse> {
    if (!this.options.apiKey) {
      throw new AppError("Gemini API key is not configured", 500, "LLM_PROVIDER_NOT_CONFIGURED");
    }

    const model = encodeURIComponent(request.model ?? this.options.defaultModel);
    const endpoint = `${this.options.baseUrl}/models/${model}:generateContent?key=${this.options.apiKey}`;
    const response = await this.fetchClient(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(this.toGeminiRequest(request))
    });

    if (!response.ok) {
      throw new AppError("Gemini completion request failed", response.status, "LLM_PROVIDER_REQUEST_FAILED", {
        provider: this.providerName,
        status: response.status
      });
    }

    const payload = (await response.json()) as GeminiGenerateContentResponse;

    return this.toCompletionResponse(payload);
  }

  private toGeminiRequest(request: LlmCompletionRequest): GeminiGenerateContentRequest {
    const systemMessages = request.messages.filter((message) => message.role === "system");
    const conversationMessages = request.messages.filter((message) => message.role !== "system");

    return {
      contents: conversationMessages.map((message) => this.toGeminiContent(message)),
      systemInstruction: systemMessages.length
        ? {
            parts: systemMessages.map((message) => ({ text: message.content }))
          }
        : undefined,
      generationConfig: {
        temperature: request.temperature,
        maxOutputTokens: request.maxOutputTokens
      },
      tools: request.tools?.length
        ? [
            {
              functionDeclarations: request.tools.map((tool) => ({
                name: tool.name,
                description: tool.description,
                parameters: tool.inputSchema
              }))
            }
          ]
        : undefined
    };
  }

  private toGeminiContent(message: LlmMessage): GeminiContent {
    return {
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }]
    };
  }

  private toCompletionResponse(response: GeminiGenerateContentResponse): LlmCompletionResponse {
    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const content = parts
      .map((part) => part.text)
      .filter((text): text is string => typeof text === "string")
      .join("");
    const toolCalls = parts
      .map((part) => part.functionCall)
      .filter((functionCall): functionCall is NonNullable<typeof functionCall> => Boolean(functionCall));

    return {
      content,
      toolCalls: toolCalls.length ? toolCalls : undefined,
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount,
        outputTokens: response.usageMetadata?.candidatesTokenCount,
        totalTokens: response.usageMetadata?.totalTokenCount
      }
    };
  }
}
