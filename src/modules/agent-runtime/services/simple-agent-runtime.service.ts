import type { AgentRuntimeDependencies } from "./agent-runtime.service";
import { AgentRuntimeService } from "./agent-runtime.service";
import type { RuntimeActionResult, RuntimeRequest, RuntimeResponse } from "../contracts/runtime.types";

export class SimpleAgentRuntimeService extends AgentRuntimeService {
  public constructor(dependencies: AgentRuntimeDependencies) {
    super(dependencies);
  }

  public override async execute(request: RuntimeRequest): Promise<RuntimeResponse> {
    let context = await this.dependencies.contextService.create(request);
    const plan = await this.dependencies.plannerService.createPlan(context);
    const results: RuntimeActionResult[] = [];

    for (const action of plan.actions) {
      const result = await this.dependencies.actionExecutorService.execute(action, context);
      results.push(result);
      context = await this.dependencies.contextService.mergeActionResult(context, result);
    }

    const snapshot = await this.dependencies.contextService.snapshot(context);
    const response = await this.dependencies.responseComposerService.compose(context, plan, results);

    return {
      ...response,
      contextSnapshotId: snapshot.id
    };
  }
}
