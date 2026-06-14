import type { KnowledgeServicePort } from "../contracts/knowledge-service.port";

export abstract class KnowledgeService implements KnowledgeServicePort {
  public abstract uploadDocument: KnowledgeServicePort["uploadDocument"];
  public abstract processDocument: KnowledgeServicePort["processDocument"];
  public abstract retrieve: KnowledgeServicePort["retrieve"];
}
