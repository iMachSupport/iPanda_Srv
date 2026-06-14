import { AppError } from "../../../shared/errors/app-error";
import type {
  BatchEmbeddingProviderPort,
  BatchEmbeddingRequest,
  BatchEmbeddingResult,
  EmbeddingProviderPort,
  EmbeddingRequest,
  EmbeddingVector
} from "../contracts/embedding.contracts";

export class EmbeddingProviderPlaceholder implements EmbeddingProviderPort, BatchEmbeddingProviderPort {
  public async embed(_request: EmbeddingRequest): Promise<EmbeddingVector> {
    throw new AppError("Embedding provider is not implemented yet", 501, "EMBEDDING_NOT_IMPLEMENTED");
  }

  public async embedBatch(_request: BatchEmbeddingRequest): Promise<BatchEmbeddingResult[]> {
    throw new AppError("Batch embedding provider is not implemented yet", 501, "EMBEDDING_NOT_IMPLEMENTED");
  }
}
