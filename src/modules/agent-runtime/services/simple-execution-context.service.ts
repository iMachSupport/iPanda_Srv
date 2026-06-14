import { randomUUID } from "crypto";
import type { ExecutionContext, ExecutionContextSnapshot } from "../contracts/execution-context.types";
import type { ExecutionContextService } from "../contracts/runtime-orchestration.contracts";
import type { RuntimeActionResult, RuntimeRequest } from "../contracts/runtime.types";

export class SimpleExecutionContextService implements ExecutionContextService {
  public async create(request: RuntimeRequest): Promise<ExecutionContext> {
    const now = new Date();

    return {
      id: randomUUID(),
      request,
      memory: [],
      knowledge: [],
      variables: {},
      createdAt: now,
      updatedAt: now
    };
  }

  public async snapshot(context: ExecutionContext): Promise<ExecutionContextSnapshot> {
    return {
      id: randomUUID(),
      contextId: context.id,
      version: 1,
      state: context,
      createdAt: new Date()
    };
  }

  public async mergeActionResult(
    context: ExecutionContext,
    result: RuntimeActionResult
  ): Promise<ExecutionContext> {
    return {
      ...context,
      variables: {
        ...context.variables,
        [`action:${result.actionId}`]: result
      },
      updatedAt: new Date()
    };
  }
}
