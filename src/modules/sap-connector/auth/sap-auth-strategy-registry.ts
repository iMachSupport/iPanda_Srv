import { SapConnectorError } from "../errors/sap-connector.error";
import type {
  SapAuthStrategy,
  SapAuthStrategyRegistry
} from "../contracts/sap-auth.contracts";
import type { SapResolvedDestination } from "../contracts/sap-adapter.contracts";

export class DefaultSapAuthStrategyRegistry implements SapAuthStrategyRegistry {
  private readonly strategies: SapAuthStrategy[] = [];

  public register(strategy: SapAuthStrategy): void {
    this.strategies.push(strategy);
  }

  public resolve(destination: SapResolvedDestination): SapAuthStrategy {
    const strategy = this.strategies.find((candidate) => candidate.supports(destination));

    if (!strategy) {
      throw new SapConnectorError(
        "SAP_AUTH_STRATEGY_NOT_FOUND",
        "No SAP authentication strategy is registered for the destination.",
        500,
        {
          destinationId: destination.destinationId,
          authenticationType: destination.authenticationType
        }
      );
    }

    return strategy;
  }
}
