export interface EmbeddingRequest {
  tenantId: string;
  input: string;
  model?: string;
  metadata?: Record<string, unknown>;
}

export interface EmbeddingVector {
  values: number[];
  dimensions: number;
  model: string;
}

export interface EmbeddingProviderPort {
  embed(request: EmbeddingRequest): Promise<EmbeddingVector>;
}

export interface BatchEmbeddingRequest {
  tenantId: string;
  inputs: Array<{
    id: string;
    text: string;
    metadata?: Record<string, unknown>;
  }>;
  model?: string;
}

export interface BatchEmbeddingResult {
  id: string;
  embedding: EmbeddingVector;
}

export interface BatchEmbeddingProviderPort {
  embedBatch(request: BatchEmbeddingRequest): Promise<BatchEmbeddingResult[]>;
}
