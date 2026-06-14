# LLM Provider Design

## Purpose

Agent Runtime depends on `LlmProviderPort`, not on Gemini, OpenAI, Claude, SDKs, or vendor-specific request formats.

## Providers

- `GeminiProvider`: current implementation.
- `OpenAiProviderPlaceholder`: future provider boundary.
- `ClaudeProviderPlaceholder`: future provider boundary.

## Configuration

Provider selection is controlled by environment:

- `LLM_PROVIDER`
- `LLM_DEFAULT_MODEL`
- `GEMINI_BASE_URL`
- `GEMINI_API_KEY`

## Dependency Injection

`DefaultLlmProviderFactory` creates the configured provider.

`createApplicationContainer` owns provider construction and exposes `llmProvider` as an application dependency. Runtime services should receive this dependency through constructors or module wiring.

## Runtime Rule

Agent Runtime must only call `LlmProviderPort.complete`.

It must never import:

- `GeminiProvider`
- Gemini request/response types
- Gemini SDKs
- Gemini REST endpoint details
