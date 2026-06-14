# Agent Runtime Request Flow

1. The API receives a versioned runtime request at `POST /api/v1/agent-runtime/execute`.
2. The runtime creates an `ExecutionContext` with tenant, user, session, request input, memory placeholders, knowledge placeholders, and trace variables.
3. The planner evaluates the context and creates a `RuntimePlan`.
4. The plan may include knowledge retrieval, tool execution, direct LLM response, or a combination of these actions.
5. The action executor dispatches each action through module ports only.
6. The context service merges action results back into the execution context.
7. The response composer produces the final runtime response.
8. The runtime snapshots the context for auditability, replay, and future multi-agent extensions.

## Extensibility Points

- `KnowledgeServicePort` supports future RAG without coupling the runtime to retrieval implementation.
- `ToolRegistryPort` supports governed tool discovery and execution.
- `MemoryServicePort` supports short-term and long-term context persistence.
- `LlmProviderPort` keeps model vendors replaceable.
- `SapConnectorPort` remains a future integration boundary and is not invoked directly by the runtime yet.
