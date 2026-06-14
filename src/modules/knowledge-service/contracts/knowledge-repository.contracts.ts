import type { IngestionJob, KnowledgeSourceDocument } from "./document-processing.contracts";
import type { KnowledgeIngestionStatus, KnowledgeUploadRequest } from "./knowledge-service.port";

export interface KnowledgeDocumentRepository {
  create(request: KnowledgeUploadRequest): Promise<KnowledgeSourceDocument>;
  findById(documentId: string, tenantId: string): Promise<KnowledgeSourceDocument | null>;
  updateStatus(documentId: string, tenantId: string, status: KnowledgeIngestionStatus): Promise<void>;
}

export interface IngestionJobRepository {
  create(documentId: string, tenantId: string): Promise<IngestionJob>;
  updateStatus(jobId: string, tenantId: string, status: KnowledgeIngestionStatus): Promise<void>;
  fail(jobId: string, tenantId: string, error: IngestionJob["error"]): Promise<void>;
}
