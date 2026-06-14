import type { MemoryRecord } from "../../memory-service/contracts/memory-service.port";
import type { KnowledgeDocument } from "../../knowledge-service/contracts/knowledge-service.port";
import type { RuntimeRequest } from "./runtime.types";

export interface ExecutionContext {
  id: string;
  request: RuntimeRequest;
  memory: MemoryRecord[];
  knowledge: KnowledgeDocument[];
  variables: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExecutionContextSnapshot {
  id: string;
  contextId: string;
  version: number;
  state: Readonly<ExecutionContext>;
  createdAt: Date;
}
