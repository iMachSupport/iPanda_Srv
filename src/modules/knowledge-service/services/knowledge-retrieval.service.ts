import type { KnowledgeDocument, KnowledgeQuery } from "../contracts/knowledge-service.port";

export interface KnowledgeRetrievalService {
  retrieve(query: KnowledgeQuery): Promise<KnowledgeDocument[]>;
}
