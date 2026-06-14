import type { RequestPlannerService as RequestPlannerServiceContract } from "../contracts/runtime-orchestration.contracts";

export abstract class RequestPlannerService implements RequestPlannerServiceContract {
  public abstract createPlan: RequestPlannerServiceContract["createPlan"];
}
