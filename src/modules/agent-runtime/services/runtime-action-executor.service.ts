import type {
  RuntimeActionExecutorService as RuntimeActionExecutorServiceContract
} from "../contracts/runtime-orchestration.contracts";

export abstract class RuntimeActionExecutorService implements RuntimeActionExecutorServiceContract {
  public abstract execute: RuntimeActionExecutorServiceContract["execute"];
}
