import type { ParsedDocument } from "./document-processing.contracts";

export interface KnowledgeChunk {
  id: string;
  tenantId: string;
  documentId: string;
  content: string;
  sequence: number;
  tokenCount?: number;
  metadata?: Record<string, unknown>;
}

export interface ChunkingOptions {
  maxTokens: number;
  overlapTokens: number;
}

export interface ChunkingStrategy {
  chunk(document: ParsedDocument, options?: Partial<ChunkingOptions>): Promise<KnowledgeChunk[]>;
}
