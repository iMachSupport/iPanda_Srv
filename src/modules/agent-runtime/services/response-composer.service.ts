import type { ResponseComposerService as ResponseComposerServiceContract } from "../contracts/runtime-orchestration.contracts";

export abstract class ResponseComposerService implements ResponseComposerServiceContract {
  public abstract compose: ResponseComposerServiceContract["compose"];
}
