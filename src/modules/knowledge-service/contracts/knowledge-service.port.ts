export interface KnowledgeQuery {
  tenantId: string;
  query: string;
  filters?: Record<string, unknown>;
  limit?: number;
  minScore?: number;
}

export interface KnowledgeDocument {
  id: string;
  tenantId?: string;
  source: string;
  title?: string;
  content: string;
  score?: number;
  metadata?: Record<string, unknown>;
}

export interface KnowledgeUploadRequest {
  tenantId: string;
  uploadedBy: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  source: string;
  storageUri: string;
  metadata?: Record<string, unknown>;
}

export interface KnowledgeUploadResponse {
  documentId: string;
  ingestionJobId: string;
  status: KnowledgeIngestionStatus;
}

export type KnowledgeIngestionStatus =
  | "uploaded"
  | "queued"
  | "processing"
  | "processed"
  | "indexed"
  | "failed";

export interface KnowledgeServicePort {
  uploadDocument(request: KnowledgeUploadRequest): Promise<KnowledgeUploadResponse>;
  processDocument(documentId: string, tenantId: string): Promise<void>;
  retrieve(query: KnowledgeQuery): Promise<KnowledgeDocument[]>;
}
