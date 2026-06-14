import type { VectorStorePort } from "../contracts/vector-store.contracts";

export abstract class PostgresPgVectorStore implements VectorStorePort {
  public abstract upsert: VectorStorePort["upsert"];
  public abstract search: VectorStorePort["search"];
  public abstract deleteByDocument: VectorStorePort["deleteByDocument"];
}
