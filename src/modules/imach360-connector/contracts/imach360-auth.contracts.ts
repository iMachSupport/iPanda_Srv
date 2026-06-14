import type { iMach360RequestContext } from "./imach360-connector.port";

export type iMach360AuthType = "service-account" | "token-propagation" | "credential-login";

export interface iMach360AuthToken {
  value: string;
  type: "Bearer";
  expiresAt?: Date;
}

export interface iMach360AuthStrategy {
  readonly authType: iMach360AuthType;
  supports(context: iMach360RequestContext): boolean;
  authenticate(context: iMach360RequestContext): Promise<iMach360AuthToken>;
}

export interface iMach360AuthStrategyRegistry {
  register(strategy: iMach360AuthStrategy): void;
  resolve(context: iMach360RequestContext): iMach360AuthStrategy;
}
