import type { ExecutionContext, ExecutionContextSnapshot } from "./execution-context.types";
import type {
  RuntimeAction,
  RuntimeActionResult,
  RuntimePlan,
  RuntimeRequest,
  RuntimeResponse
} from "./runtime.types";

export interface RuntimeOrchestrator {
  execute(request: RuntimeRequest): Promise<RuntimeResponse>;
}

export interface ExecutionContextService {
  create(request: RuntimeRequest): Promise<ExecutionContext>;
  snapshot(context: ExecutionContext): Promise<ExecutionContextSnapshot>;
  mergeActionResult(context: ExecutionContext, result: RuntimeActionResult): Promise<ExecutionContext>;
}

export interface RequestPlannerService {
  createPlan(context: ExecutionContext): Promise<RuntimePlan>;
}

export interface RuntimeActionExecutorService {
  execute(action: RuntimeAction, context: ExecutionContext): Promise<RuntimeActionResult>;
}

export interface ResponseComposerService {
  compose(context: ExecutionContext, plan: RuntimePlan, results: RuntimeActionResult[]): Promise<RuntimeResponse>;
}
