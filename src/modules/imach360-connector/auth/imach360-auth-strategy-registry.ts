import { iMach360ConnectorError } from "../errors/imach360-connector.error";
import type { iMach360AuthStrategy, iMach360AuthStrategyRegistry } from "../contracts/imach360-auth.contracts";
import type { iMach360RequestContext } from "../contracts/imach360-connector.port";

export class DefaultImachio360AuthStrategyRegistry implements iMach360AuthStrategyRegistry {
  private readonly strategies: iMach360AuthStrategy[] = [];

  public register(strategy: iMach360AuthStrategy): void {
    this.strategies.push(strategy);
  }

  public resolve(context: iMach360RequestContext): iMach360AuthStrategy {
    const strategy = this.strategies.find((candidate) => candidate.supports(context));

    if (!strategy) {
      throw new iMach360ConnectorError(
        "IMACH360_AUTH_STRATEGY_NOT_FOUND",
        "No authentication strategy matched the request context. Ensure a ServiceAccountAuthStrategy or TokenPropagationAuthStrategy is registered.",
        500,
        { hasCallerToken: Boolean(context.callerToken) }
      );
    }

    return strategy;
  }
}
