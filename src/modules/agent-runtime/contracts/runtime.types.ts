export type RuntimeDecisionType = "knowledge-retrieval" | "tool-execution" | "direct-llm-response";

export type RuntimeActionType = "retrieve-knowledge" | "execute-tool" | "invoke-llm";

export interface RuntimeIdentity {
  tenantId: string;
  userId: string;
  sessionId?: string;
}

export interface RuntimeRequest {
  id: string;
  identity: RuntimeIdentity;
  input: {
    message: string;
    attachments?: RuntimeAttachment[];
    metadata?: Record<string, unknown>;
  };
  options?: RuntimeOptions;
}

export interface RuntimeAttachment {
  id: string;
  name: string;
  contentType: string;
  uri: string;
}

export interface RuntimeOptions {
  allowKnowledgeRetrieval?: boolean;
  allowToolExecution?: boolean;
  allowMemoryWrites?: boolean;
  preferredModel?: string;
  trace?: boolean;
}

export interface RuntimeResponse {
  id: string;
  requestId: string;
  finalMessage: string;
  decisions: RuntimeDecision[];
  actions: RuntimeActionResult[];
  contextSnapshotId?: string;
  usage?: RuntimeUsage;
}

export interface RuntimeUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

export interface RuntimeDecision {
  type: RuntimeDecisionType;
  required: boolean;
  reason: string;
  confidence?: number;
}

export interface RuntimePlan {
  requestId: string;
  decisions: RuntimeDecision[];
  actions: RuntimeAction[];
}

export interface RuntimeAction {
  id: string;
  type: RuntimeActionType;
  dependsOn?: string[];
  payload: Record<string, unknown>;
}

export interface RuntimeActionResult {
  actionId: string;
  type: RuntimeActionType;
  status: "pending" | "succeeded" | "failed" | "skipped";
  output?: unknown;
  error?: {
    code: string;
    message: string;
  };
}
