# Tool Registry Execution Flow

1. Tool plugins expose a `ToolDefinition` and an `execute` method.
2. A plugin module groups related tools under a namespace, such as `hr`.
3. The application composition root registers plugin modules through `ToolRegistrar`.
4. Agent Runtime discovers available tools through `ToolRegistryPort.listTools`.
5. Planner selects a tool and emits a runtime action of type `execute-tool`.
6. Runtime action executor calls `ToolRegistryPort.executeTool`.
7. Tool Registry validates tool availability and dispatches the request to the registered `ToolPlugin.execute` method.
8. Tool result is returned to Agent Runtime and merged into execution context.

## SAP Extension Path

Future SAP-backed tools should remain ordinary `ToolPlugin` implementations with `providerType: "sap"`.

SAP connection, destination, authentication, and OData concerns must stay behind `SapConnectorPort`; tool plugins should depend on that port instead of calling SAP directly from the runtime.
