import type { SapResolvedDestination } from "../contracts/sap-adapter.contracts";
import type { SapAuthRequest, SapAuthStrategy, SapAuthToken } from "../contracts/sap-auth.contracts";

export class NoSapAuthStrategy implements SapAuthStrategy {
  public supports(destination: SapResolvedDestination): boolean {
    return destination.authenticationType === "none";
  }

  public async authenticate(_request: SapAuthRequest): Promise<SapAuthToken | null> {
    return null;
  }
}

export abstract class BasicSapAuthStrategy implements SapAuthStrategy {
  public supports(destination: SapResolvedDestination): boolean {
    return destination.authenticationType === "basic";
  }

  public abstract authenticate(request: SapAuthRequest): Promise<SapAuthToken>;
}

export abstract class BearerTokenSapAuthStrategy implements SapAuthStrategy {
  public supports(destination: SapResolvedDestination): boolean {
    return destination.authenticationType === "bearer-token";
  }

  public abstract authenticate(request: SapAuthRequest): Promise<SapAuthToken>;
}

export abstract class OAuthClientCredentialsSapAuthStrategy implements SapAuthStrategy {
  public supports(destination: SapResolvedDestination): boolean {
    return destination.authenticationType === "oauth2-client-credentials";
  }

  public abstract authenticate(request: SapAuthRequest): Promise<SapAuthToken>;
}

export abstract class PrincipalPropagationSapAuthStrategy implements SapAuthStrategy {
  public supports(destination: SapResolvedDestination): boolean {
    return destination.authenticationType === "principal-propagation";
  }

  public abstract authenticate(request: SapAuthRequest): Promise<SapAuthToken>;
}
