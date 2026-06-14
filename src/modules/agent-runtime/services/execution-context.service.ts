import type {
  ExecutionContextService as ExecutionContextServiceContract
} from "../contracts/runtime-orchestration.contracts";

export abstract class ExecutionContextService implements ExecutionContextServiceContract {
  public abstract create: ExecutionContextServiceContract["create"];
  public abstract snapshot: ExecutionContextServiceContract["snapshot"];
  public abstract mergeActionResult: ExecutionContextServiceContract["mergeActionResult"];
}
