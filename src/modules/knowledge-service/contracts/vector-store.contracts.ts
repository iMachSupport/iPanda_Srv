import type { KnowledgeChunk } from "./chunking.contracts";
import type { EmbeddingVector } from "./embedding.contracts";

export interface VectorRecord {
  id: string;
  tenantId: string;
  documentId: string;
  chunkId: string;
  content: string;
  embedding: EmbeddingVector;
  metadata?: Record<string, unknown>;
}

export interface VectorSearchRequest {
  tenantId: string;
  embedding: EmbeddingVector;
  filters?: Record<string, unknown>;
  limit?: number;
  minScore?: number;
}

export interface VectorSearchResult {
  id: string;
  tenantId: string;
  documentId: string;
  chunkId: string;
  content: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface VectorStorePort {
  upsert(records: VectorRecord[]): Promise<void>;
  search(request: VectorSearchRequest): Promise<VectorSearchResult[]>;
  deleteByDocument(documentId: string, tenantId: string): Promise<void>;
}

export interface KnowledgeChunkRepository {
  saveMany(chunks: KnowledgeChunk[]): Promise<void>;
  findByDocument(documentId: string, tenantId: string): Promise<KnowledgeChunk[]>;
}
