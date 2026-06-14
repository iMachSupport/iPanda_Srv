// ─── Backend contract types (mirroring server RuntimeResponse) ───────────────

export type RuntimeDecisionType =
  | "knowledge-retrieval"
  | "tool-execution"
  | "direct-llm-response";

export type RuntimeActionType = "retrieve-knowledge" | "execute-tool" | "invoke-llm";

export type RuntimeActionStatus = "pending" | "succeeded" | "failed" | "skipped";

export interface RuntimeDecision {
  type: RuntimeDecisionType;
  required: boolean;
  reason: string;
  confidence?: number;
}

export interface RuntimeActionResult {
  actionId: string;
  type: RuntimeActionType;
  status: RuntimeActionStatus;
  toolId?: string;
  output?: unknown;
  error?: { code: string; message: string };
  requiresApproval?: boolean;
}

export interface RuntimeResponse {
  id: string;
  requestId: string;
  finalMessage: string;
  decisions: RuntimeDecision[];
  actions: RuntimeActionResult[];
}

// ─── Runtime context (Frontend Context Contract) ──────────────────────────────

export interface IPandaRuntimeContext {
  application: string;
  module?: string;
  page?: string;
  entityId?: string;
}

// ─── Client config ────────────────────────────────────────────────────────────

export interface IPandaClientConfig {
  apiUrl: string;
  tenantId: string;
  userId: string;
  sessionId?: string;
  callerToken?: string;
}

// ─── Client I/O ───────────────────────────────────────────────────────────────

export interface ExecuteInput {
  message: string;
  context?: IPandaRuntimeContext;
  conversationId?: string;
}

export interface ExecuteResult {
  id: string;
  message: string;
  actions: RuntimeActionResult[];
}

// ─── Conversation / Message types ─────────────────────────────────────────────

export type MessageRole = "user" | "assistant";

export interface ApprovalRequest {
  messageId: string;
  summary: string;
  toolId: string;
  details: Record<string, unknown>;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  actions?: RuntimeActionResult[];
  timestamp: Date;
  pendingApproval?: ApprovalRequest;
}

export interface Conversation {
  id: string;
  messages: Message[];
  createdAt: Date;
}

// ─── Suggested actions ────────────────────────────────────────────────────────

export interface SuggestedAction {
  label: string;
  message: string;
}

// ─── Card renderer extension ──────────────────────────────────────────────────

export interface CardRendererProps<T = unknown> {
  data: T;
  status: RuntimeActionStatus;
}

export type CardRenderer<T = unknown> = React.ComponentType<CardRendererProps<T>>;

export type CardRendererMap = Record<string, CardRenderer>;

// ─── Theme override ───────────────────────────────────────────────────────────

export interface IPandaThemeOverride {
  mode?: "light" | "dark";
  palette?: {
    primary?: string;
    background?: string;
    surface?: string;
  };
  typography?: {
    fontFamily?: string;
  };
  branding?: {
    assistantName?: string;
    assistantAvatar?: string;
  };
}

// ─── Panel props (public API) ─────────────────────────────────────────────────

export interface IPandaPanelProps extends IPandaClientConfig {
  context?: IPandaRuntimeContext;
  theme?: IPandaThemeOverride;
  position?: "right" | "left";
  defaultOpen?: boolean;
  showFab?: boolean;
  cardRenderers?: CardRendererMap;
  suggestedActions?: SuggestedAction[];
  onAction?: (action: RuntimeActionResult) => void;
}
