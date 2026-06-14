// Main panel component
export { IPandaPanel } from "./components/IPandaPanel/IPandaPanel";

// SDK
export { IPandaClient, IPandaClientError } from "./sdk/IPandaClient";

// Public types
export type {
  IPandaClientConfig,
  IPandaPanelProps,
  ExecuteInput,
  ExecuteResult,
  IPandaRuntimeContext,
  IPandaThemeOverride,
  CardRendererMap,
  CardRendererProps,
  CardRenderer,
  SuggestedAction,
  Message,
  Conversation,
  MessageRole,
  ApprovalRequest,
  RuntimeActionResult,
  RuntimeDecision,
  RuntimeActionStatus,
  RuntimeDecisionType,
  RuntimeActionType,
} from "./sdk/ipanda.types";

// Panel open/close control — import this in any component to toggle the panel
export { usePanelStore } from "./store/panel.store";

// Hooks (for custom integrations bypassing IPandaPanel)
export { useIPanda } from "./hooks/useIPanda";
export { useConversation } from "./hooks/useConversation";
export { useExecution } from "./hooks/useExecution";

// Contexts (for advanced custom integrations)
export { IPandaProvider, useIPandaClient, useIPandaConfig } from "./context/IPandaContext";
export {
  CardRendererProvider,
  useCardRenderer,
} from "./context/CardRendererContext";

// Built-in card renderers (for custom wiring)
export { BUILTIN_RENDERERS } from "./components/ToolResultCard/ToolResultCard";
export { LeaveBalanceCard } from "./components/ToolResultCard/renderers/LeaveBalanceCard";
export { EmployeeCard } from "./components/ToolResultCard/renderers/EmployeeCard";
export { LeaveRequestCard } from "./components/ToolResultCard/renderers/LeaveRequestCard";
export { AssetCard } from "./components/ToolResultCard/renderers/AssetCard";
export { TicketCard } from "./components/ToolResultCard/renderers/TicketCard";
export { TicketListCard } from "./components/ToolResultCard/renderers/TicketListCard";
export { GenericDataCard } from "./components/ToolResultCard/renderers/GenericDataCard";
