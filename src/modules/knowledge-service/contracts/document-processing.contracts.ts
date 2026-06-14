import type { KnowledgeIngestionStatus } from "./knowledge-service.port";

export interface KnowledgeSourceDocument {
  id: string;
  tenantId: string;
  fileName: string;
  contentType: string;
  source: string;
  storageUri: string;
  status: KnowledgeIngestionStatus;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParsedDocument {
  documentId: string;
  tenantId: string;
  title?: string;
  text: string;
  metadata?: Record<string, unknown>;
}

export interface DocumentProcessor {
  supports(contentType: string): boolean;
  parse(document: KnowledgeSourceDocument): Promise<ParsedDocument>;
}

export interface DocumentProcessingPipeline {
  process(document: KnowledgeSourceDocument): Promise<ParsedDocument>;
}

export interface IngestionJob {
  id: string;
  tenantId: string;
  documentId: string;
  status: KnowledgeIngestionStatus;
  error?: {
    code: string;
    message: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
