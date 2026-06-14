import type { DocumentProcessor } from "../contracts/document-processing.contracts";

export interface DocumentProcessorRegistry {
  register(processor: DocumentProcessor): void;
  resolve(contentType: string): DocumentProcessor | null;
}
