import type {
  KnowledgeUploadRequest,
  KnowledgeUploadResponse
} from "../contracts/knowledge-service.port";

export interface KnowledgeIngestionService {
  upload(request: KnowledgeUploadRequest): Promise<KnowledgeUploadResponse>;
  process(documentId: string, tenantId: string): Promise<void>;
}
