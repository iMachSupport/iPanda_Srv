import type { iMach360RequestContext } from "./imach360-connector.port";

export interface iMach360HttpRequest {
  context: iMach360RequestContext;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  query?: Record<string, string | number | boolean>;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface iMach360HttpResponse<T = unknown> {
  statusCode: number;
  data: T;
  headers?: Record<string, string>;
}

export interface iMach360HttpAdapter {
  execute<T = unknown>(request: iMach360HttpRequest): Promise<iMach360HttpResponse<T>>;
}
