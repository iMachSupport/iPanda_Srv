# Tool Registry Design

## Purpose

Tool Registry makes enterprise capabilities discoverable and executable by Agent Runtime without coupling the runtime to SAP, HR, finance, or external systems.

## Tool Contract

Every tool exposes:

- `name`
- `description`
- `inputSchema`
- `outputSchema`
- `execute`

The registry treats SAP-backed tools and non-SAP tools the same. SAP tools are marked with `providerType: "sap"` and should depend on `SapConnectorPort` when implementation is added.

## Plugin Architecture

- `ToolPlugin` is the executable unit.
- `ToolPluginFactory` creates a tool plugin instance.
- `ToolPluginModule` groups related tools under a namespace.
- `ToolRegistrar` registers individual plugins or complete modules.
- `ToolCatalog` supports discovery.
- `ToolExecutor` dispatches execution requests.

## Example HR Tools

- `GetLeaveBalance`
- `GetEmployeeDetails`
- `CreateLeaveRequest`

These are declared as SAP-capable plugin contracts only. Their factories intentionally throw until actual SAP-backed implementations are added.

## Execution Flow

1. Agent Runtime calls `listTools` to discover available tools.
2. Planner selects a tool and emits an `execute-tool` runtime action.
3. Runtime executor calls `executeTool`.
4. Tool Registry locates the registered plugin.
5. Registry invokes the plugin's `execute` method.
6. Result is returned to Agent Runtime and merged into execution context.
