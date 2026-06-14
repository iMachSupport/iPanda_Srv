import { randomUUID } from "crypto";
import type { ExecutionContext } from "../contracts/execution-context.types";
import type { ResponseComposerService } from "../contracts/runtime-orchestration.contracts";
import type { RuntimeActionResult, RuntimePlan, RuntimeResponse } from "../contracts/runtime.types";

export class SimpleResponseComposerService implements ResponseComposerService {
  public async compose(
    context: ExecutionContext,
    plan: RuntimePlan,
    results: RuntimeActionResult[]
  ): Promise<RuntimeResponse> {
    const balance = this.findLeaveBalance(results);

    return {
      id: randomUUID(),
      requestId: context.request.id,
      finalMessage:
        typeof balance === "number"
          ? `You currently have ${balance} leave days available.`
          : "I could not determine your leave balance from the available tools.",
      decisions: plan.decisions,
      actions: results
    };
  }

  private findLeaveBalance(results: RuntimeActionResult[]): number | undefined {
    for (const result of results) {
      const output = result.output;

      if (output && typeof output === "object" && "balance" in output) {
        const balance = (output as { balance?: unknown }).balance;

        if (typeof balance === "number") {
          return balance;
        }
      }
    }

    return undefined;
  }
}
