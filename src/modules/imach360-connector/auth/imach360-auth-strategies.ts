import { logger } from "../../../shared/logging/logger";
import { iMach360ConnectorError } from "../errors/imach360-connector.error";
import type { iMach360AuthStrategy, iMach360AuthToken } from "../contracts/imach360-auth.contracts";
import type { iMach360RequestContext } from "../contracts/imach360-connector.port";

/**
 * Authenticates using a long-lived service account token from the environment.
 * All agent-initiated requests use this identity; per-user context is conveyed
 * via the userId field in request payloads, not via the HTTP credential.
 */
export class ServiceAccountAuthStrategy implements iMach360AuthStrategy {
  public readonly authType = "service-account" as const;

  public constructor(private readonly serviceToken: string) {}

  public supports(context: iMach360RequestContext): boolean {
    return !context.callerToken;
  }

  public async authenticate(_context: iMach360RequestContext): Promise<iMach360AuthToken> {
    if (!this.serviceToken) {
      throw new iMach360ConnectorError(
        "IMACH360_AUTHENTICATION_FAILED",
        "IMACH360_SERVICE_TOKEN is not configured.",
        500
      );
    }

    return { type: "Bearer", value: this.serviceToken };
  }
}

/**
 * Propagates the caller's own JWT token to iMach360.
 * Used when the side panel passes through the end-user's session token
 * via runtimeContext so operations execute under the user's identity.
 */
export class TokenPropagationAuthStrategy implements iMach360AuthStrategy {
  public readonly authType = "token-propagation" as const;

  public supports(context: iMach360RequestContext): boolean {
    return typeof context.callerToken === "string" && context.callerToken.length > 0;
  }

  public async authenticate(context: iMach360RequestContext): Promise<iMach360AuthToken> {
    if (!context.callerToken) {
      throw new iMach360ConnectorError(
        "IMACH360_AUTHENTICATION_FAILED",
        "Token propagation requested but no callerToken was provided in the request context.",
        401
      );
    }

    return { type: "Bearer", value: context.callerToken };
  }
}

/**
 * Authenticates with iMach360 using email and password credentials.
 * Caches the returned JWT and re-authenticates automatically 5 minutes
 * before expiry — no manual token rotation required.
 */
export class CredentialAuthStrategy implements iMach360AuthStrategy {
  public readonly authType = "credential-login" as const;

  private cachedToken: { value: string; expiresAt: Date } | null = null;

  public constructor(
    private readonly email: string,
    private readonly password: string,
    private readonly loginUrl: string,
    private readonly fetchClient: typeof fetch = fetch
  ) {}

  public supports(context: iMach360RequestContext): boolean {
    return !context.callerToken;
  }

  public async authenticate(_context: iMach360RequestContext): Promise<iMach360AuthToken> {
    if (this.cachedToken && this.isTokenValid(this.cachedToken.expiresAt)) {
      return { type: "Bearer", value: this.cachedToken.value, expiresAt: this.cachedToken.expiresAt };
    }

    return this.login();
  }

  private async login(): Promise<iMach360AuthToken> {
    logger.info({ loginUrl: this.loginUrl }, "iMach360 service account: acquiring token");

    let response: Response;

    try {
      response = await this.fetchClient(this.loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: this.email, password: this.password })
      });
    } catch (cause) {
      throw new iMach360ConnectorError(
        "IMACH360_AUTHENTICATION_FAILED",
        "Network error reaching iMach360 login endpoint.",
        503,
        { cause: cause instanceof Error ? cause.message : String(cause) }
      );
    }

    if (!response.ok) {
      throw new iMach360ConnectorError(
        "IMACH360_AUTHENTICATION_FAILED",
        `Service account login failed (HTTP ${response.status}). Check IMACH360_SERVICE_EMAIL and IMACH360_SERVICE_PASSWORD.`,
        401
      );
    }

    const body = (await response.json()) as { token?: string };

    if (!body.token) {
      throw new iMach360ConnectorError(
        "IMACH360_AUTHENTICATION_FAILED",
        "iMach360 login response did not contain a token.",
        502
      );
    }

    const expiresAt = this.parseExpiry(body.token);
    this.cachedToken = { value: body.token, expiresAt };

    logger.info({ expiresAt }, "iMach360 service account: token acquired");

    return { type: "Bearer", value: body.token, expiresAt };
  }

  private isTokenValid(expiresAt: Date): boolean {
    return expiresAt.getTime() - Date.now() > 5 * 60 * 1000;
  }

  private parseExpiry(jwt: string): Date {
    try {
      const segment = jwt.split(".")[1];

      if (segment) {
        const payload = JSON.parse(Buffer.from(segment, "base64url").toString()) as { exp?: unknown };

        if (typeof payload.exp === "number") {
          return new Date(payload.exp * 1000);
        }
      }
    } catch {
      // fall through to safe default
    }

    return new Date(Date.now() + 6 * 60 * 60 * 1000);
  }
}
