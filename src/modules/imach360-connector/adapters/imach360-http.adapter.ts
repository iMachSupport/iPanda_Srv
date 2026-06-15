import { iMach360ConnectorError } from "../errors/imach360-connector.error";
import type { iMach360HttpAdapter, iMach360HttpRequest, iMach360HttpResponse } from "../contracts/imach360-adapter.contracts";
import type { iMach360AuthStrategyRegistry } from "../contracts/imach360-auth.contracts";

export interface iMach360HttpAdapterOptions {
  baseUrl: string;
  authStrategyRegistry: iMach360AuthStrategyRegistry;
  fetchClient?: typeof fetch;
}

export class iMach360HttpAdapterImpl implements iMach360HttpAdapter {
  private readonly fetchClient: typeof fetch;

  public constructor(private readonly options: iMach360HttpAdapterOptions) {
    this.fetchClient = options.fetchClient ?? fetch;
  }

  public async execute<T = unknown>(request: iMach360HttpRequest): Promise<iMach360HttpResponse<T>> {
    const strategy = this.options.authStrategyRegistry.resolve(request.context);
    const token = await strategy.authenticate(request.context);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Accept-Encoding": "identity",
      "Authorization": `${token.type} ${token.value}`,
      ...request.headers
    };

    if (request.context.correlationId) {
      headers["X-Correlation-ID"] = request.context.correlationId;
    }

    const url = this.buildUrl(request.path, request.query);
    let response: Response;

    try {
      response = await this.fetchClient(url, {
        method: request.method,
        headers,
        body: request.body !== undefined ? JSON.stringify(request.body) : undefined
      });
    } catch (cause) {
      throw new iMach360ConnectorError(
        "IMACH360_REQUEST_FAILED",
        `Network error calling iMach360 ${request.method} ${request.path}`,
        503,
        { cause: cause instanceof Error ? cause.message : String(cause) }
      );
    }

    if (!response.ok) {
      throw this.mapHttpError(response.status, request);
    }

    let data: T;

    let rawText: string;
    try {
      rawText = await response.text();
    } catch (cause) {
      throw new iMach360ConnectorError(
        "IMACH360_RESPONSE_MAPPING_FAILED",
        `Failed to read response body from iMach360 for ${request.method} ${request.path}`,
        502,
        { cause: cause instanceof Error ? cause.message : String(cause) }
      );
    }

    try {
      data = JSON.parse(rawText) as T;
    } catch {
      throw new iMach360ConnectorError(
        "IMACH360_RESPONSE_MAPPING_FAILED",
        `iMach360 returned non-JSON for ${request.method} ${request.path}`,
        502,
        { responsePreview: rawText.slice(0, 400) }
      );
    }

    return { statusCode: response.status, data };
  }

  private buildUrl(path: string, query?: Record<string, string | number | boolean>): string {
    const base = this.options.baseUrl.endsWith("/")
      ? this.options.baseUrl.slice(0, -1)
      : this.options.baseUrl;

    const url = new URL(`${base}${path}`);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        url.searchParams.set(key, String(value));
      }
    }

    return url.toString();
  }

  private mapHttpError(statusCode: number, request: iMach360HttpRequest): iMach360ConnectorError {
    const ctx = { path: request.path, method: request.method };

    switch (statusCode) {
      case 401:
        return new iMach360ConnectorError(
          "IMACH360_UNAUTHORIZED",
          "iMach360 rejected the authentication credential. Verify IMACH360_SERVICE_TOKEN is valid.",
          401,
          ctx
        );
      case 403:
        return new iMach360ConnectorError(
          "IMACH360_FORBIDDEN",
          "The service account does not have permission for this iMach360 operation.",
          403,
          ctx
        );
      case 404:
        return new iMach360ConnectorError(
          "IMACH360_NOT_FOUND",
          `Requested resource was not found in iMach360: ${request.path}`,
          404,
          ctx
        );
      case 409:
        return new iMach360ConnectorError(
          "IMACH360_CONFLICT",
          "iMach360 returned a conflict. The resource may already exist.",
          409,
          ctx
        );
      default:
        return new iMach360ConnectorError(
          "IMACH360_REQUEST_FAILED",
          `iMach360 API returned HTTP ${statusCode} for ${request.method} ${request.path}`,
          statusCode,
          ctx
        );
    }
  }
}
