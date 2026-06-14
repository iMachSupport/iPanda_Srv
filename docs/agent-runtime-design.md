# Agent Runtime Design

## Purpose

The Agent Runtime is the orchestration boundary for iPanda. It receives user requests, builds execution context, decides which capabilities are required, coordinates module ports, and returns a final response.

The runtime does not own SAP, memory, knowledge, tools, or model-provider implementation details. It talks to those modules through ports so each capability can evolve independently.

## Request Flow

1. Receive `RuntimeRequest` through the versioned API contract.
2. Create `ExecutionContext` for tenant, user, session, request input, memory, retrieved knowledge, variables, and trace state.
3. Ask `RequestPlannerService` to produce a `RuntimePlan`.
4. Planner determines whether the request requires knowledge retrieval, tool execution, a direct LLM response, or a combined flow.
5. `RuntimeActionExecutorService` executes plan actions through ports:
   - `KnowledgeServicePort`
   - `ToolRegistryPort`
   - `MemoryServicePort`
   - `LlmProviderPort`
6. Merge each `RuntimeActionResult` into the context.
7. Compose the final `RuntimeResponse`.
8. Snapshot context for audit, replay, and future multi-agent coordination.

## Service Contracts

- `RuntimeOrchestrator`: top-level use case boundary.
- `ExecutionContextService`: creates, updates, and snapshots runtime context.
- `RequestPlannerService`: converts context into executable decisions and actions.
- `RuntimeActionExecutorService`: dispatches actions to module ports.
- `ResponseComposerService`: turns context, plan, and results into the final response.

## Extensibility

- RAG can be introduced behind `KnowledgeServicePort`.
- Governed enterprise tools can be introduced behind `ToolRegistryPort`.
- Gemini or future model vendors can be swapped behind `LlmProviderPort`.
- SAP OData can be introduced behind `SapConnectorPort` without changing runtime API contracts.
- Multi-agent orchestration can be added by treating agent handoffs as additional `RuntimeActionType` values or separate runtime plans.

## Current Non-Goals

- No SAP integration implementation.
- No retrieval implementation.
- No LLM provider implementation.
- No business logic inside route handlers.
- No persistence schema yet.
