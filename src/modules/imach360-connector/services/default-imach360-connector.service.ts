import { randomUUID } from "crypto";
import type { iMach360HttpAdapter } from "../contracts/imach360-adapter.contracts";
import type {
  CreateLeaveRequestRequest,
  CreateLeaveRequestResponse,
  CreateTicketRequest,
  CreateTicketResponse,
  GetEmployeeAssetsRequest,
  GetEmployeeAssetsResponse,
  GetEmployeeByIdRequest,
  GetEmployeeByIdResponse,
  GetLeaveBalanceRequest,
  GetLeaveBalanceResponse,
  GetTicketByIdRequest,
  GetTicketByIdResponse,
  ListAssetsRequest,
  ListAssetsResponse,
  ListEmployeesRequest,
  ListEmployeesResponse,
  ListLeavesRequest,
  ListLeavesResponse,
  ListTicketsRequest,
  ListTicketsResponse,
  iMach360RequestContext
} from "../contracts/imach360-connector.port";
import { iMach360ConnectorError } from "../errors/imach360-connector.error";
import type { iMach360AuditPort } from "../audit/imach360-audit.port";
import { mapEmployee, mapEmployeeList } from "../mappers/employee.mapper";
import { computeLeaveBalance, mapLeaveList } from "../mappers/leave.mapper";
import { mapAssetList } from "../mappers/asset.mapper";
import { mapTicket, mapTicketList } from "../mappers/ticket.mapper";
import { iMach360ConnectorService } from "./imach360-connector.service";

export interface DefaultImachio360ConnectorOptions {
  leaveAnnualEntitlement?: number;
}

export class DefaultImachio360ConnectorService extends iMach360ConnectorService {
  private readonly leaveAnnualEntitlement: number;

  public constructor(
    private readonly httpAdapter: iMach360HttpAdapter,
    private readonly auditService: iMach360AuditPort,
    options: DefaultImachio360ConnectorOptions = {}
  ) {
    super();
    this.leaveAnnualEntitlement = options.leaveAnnualEntitlement ?? 20;
  }

  // ─── Employee ───────────────────────────────────────────────────────────────

  public override async getEmployeeById(request: GetEmployeeByIdRequest): Promise<GetEmployeeByIdResponse> {
    return this.withAudit("getEmployeeById", request, async () => {
      const response = await this.httpAdapter.execute({
        context: this.toRequestContext(request),
        method: "GET",
        path: `/api/hr/employee/${encodeURIComponent(request.employeeId)}`
      });

      return {
        employee: mapEmployee(response.data),
        sourceSystem: "imach360" as const
      };
    });
  }

  public override async listEmployees(request: ListEmployeesRequest): Promise<ListEmployeesResponse> {
    return this.withAudit("listEmployees", request, async () => {
      const query: Record<string, string | number | boolean> = {};

      if (request.search) query["search"] = request.search;
      if (request.department) query["department"] = request.department;

      const response = await this.httpAdapter.execute({
        context: this.toRequestContext(request),
        method: "GET",
        path: "/api/hr",
        query
      });

      const employees = mapEmployeeList(response.data);

      return {
        employees,
        total: employees.length,
        sourceSystem: "imach360" as const
      };
    });
  }

  // ─── Leave ──────────────────────────────────────────────────────────────────

  public override async getLeaveBalance(request: GetLeaveBalanceRequest): Promise<GetLeaveBalanceResponse> {
    return this.withAudit("getLeaveBalance", request, async () => {
      const response = await this.httpAdapter.execute({
        context: this.toRequestContext(request),
        method: "GET",
        path: `/api/leaves/user/${encodeURIComponent(request.employeeId)}`
      });

      const leaves = mapLeaveList(response.data);
      const balance = computeLeaveBalance(
        leaves,
        request.employeeId,
        request.leaveType,
        this.leaveAnnualEntitlement
      );

      return {
        balance,
        sourceSystem: "imach360" as const
      };
    });
  }

  public override async listLeaves(request: ListLeavesRequest): Promise<ListLeavesResponse> {
    return this.withAudit("listLeaves", request, async () => {
      const path = request.employeeId
        ? `/api/leaves/user/${encodeURIComponent(request.employeeId)}`
        : "/api/leaves";

      const query: Record<string, string | number | boolean> = {};

      if (request.status) query["status"] = request.status;

      const response = await this.httpAdapter.execute({
        context: this.toRequestContext(request),
        method: "GET",
        path,
        query
      });

      const leaves = mapLeaveList(response.data);
      const filtered = request.status
        ? leaves.filter((l) => l.status === request.status)
        : leaves;

      return {
        leaves: filtered,
        total: filtered.length,
        sourceSystem: "imach360" as const
      };
    });
  }

  public override async createLeaveRequest(
    request: CreateLeaveRequestRequest
  ): Promise<CreateLeaveRequestResponse> {
    return this.withAudit("createLeaveRequest", request, async () => {
      const response = await this.httpAdapter.execute<{ _id?: string; id?: string; status?: string }>({
        context: this.toRequestContext(request),
        method: "POST",
        path: "/api/leaves",
        body: {
          leaveType: request.leaveType,
          fromDate: request.fromDate,
          toDate: request.toDate,
          reason: request.reason
        }
      });

      const id = response.data._id ?? response.data.id;

      if (!id) {
        throw new iMach360ConnectorError(
          "IMACH360_RESPONSE_MAPPING_FAILED",
          "iMach360 did not return an ID for the created leave request.",
          502
        );
      }

      return {
        leaveId: id,
        status: "pending-approval" as const,
        sourceSystem: "imach360" as const
      };
    });
  }

  // ─── Asset ──────────────────────────────────────────────────────────────────

  public override async getEmployeeAssets(
    request: GetEmployeeAssetsRequest
  ): Promise<GetEmployeeAssetsResponse> {
    return this.withAudit("getEmployeeAssets", request, async () => {
      const response = await this.httpAdapter.execute({
        context: this.toRequestContext(request),
        method: "GET",
        path: `/api/assets/user/${encodeURIComponent(request.employeeId)}`
      });

      const assets = mapAssetList(response.data);

      return {
        assets,
        total: assets.length,
        sourceSystem: "imach360" as const
      };
    });
  }

  public override async listAssets(request: ListAssetsRequest): Promise<ListAssetsResponse> {
    return this.withAudit("listAssets", request, async () => {
      const query: Record<string, string | number | boolean> = {};

      if (request.status) query["status"] = request.status;
      if (request.assetType) query["assetType"] = request.assetType;

      const response = await this.httpAdapter.execute({
        context: this.toRequestContext(request),
        method: "GET",
        path: "/api/assets",
        query
      });

      const assets = mapAssetList(response.data);

      return {
        assets,
        total: assets.length,
        sourceSystem: "imach360" as const
      };
    });
  }

  // ─── IT Desk ────────────────────────────────────────────────────────────────

  public override async listTickets(request: ListTicketsRequest): Promise<ListTicketsResponse> {
    return this.withAudit("listTickets", request, async () => {
      const query: Record<string, string | number | boolean> = {};

      if (request.status) query["status"] = request.status;
      if (request.priority) query["priority"] = request.priority;

      const response = await this.httpAdapter.execute({
        context: this.toRequestContext(request),
        method: "GET",
        path: "/api/tickets",
        query
      });

      const tickets = mapTicketList(response.data);

      return {
        tickets,
        total: tickets.length,
        sourceSystem: "imach360" as const
      };
    });
  }

  public override async getTicketById(request: GetTicketByIdRequest): Promise<GetTicketByIdResponse> {
    return this.withAudit("getTicketById", request, async () => {
      const response = await this.httpAdapter.execute({
        context: this.toRequestContext(request),
        method: "GET",
        path: `/api/tickets/${encodeURIComponent(request.ticketId)}`
      });

      return {
        ticket: mapTicket(response.data),
        sourceSystem: "imach360" as const
      };
    });
  }

  public override async createTicket(request: CreateTicketRequest): Promise<CreateTicketResponse> {
    return this.withAudit("createTicket", request, async () => {
      const response = await this.httpAdapter.execute<{ _id?: string; id?: string }>({
        context: this.toRequestContext(request),
        method: "POST",
        path: "/api/tickets",
        body: {
          title: request.title,
          description: request.description,
          type: request.type,
          priority: request.priority,
          assignedTo: request.assignedTo
        }
      });

      const id = response.data._id ?? response.data.id;

      if (!id) {
        throw new iMach360ConnectorError(
          "IMACH360_RESPONSE_MAPPING_FAILED",
          "iMach360 did not return an ID for the created ticket.",
          502
        );
      }

      return {
        ticketId: id,
        status: "open" as const,
        sourceSystem: "imach360" as const
      };
    });
  }

  // ─── Internals ──────────────────────────────────────────────────────────────

  private toRequestContext(request: iMach360RequestContext): iMach360RequestContext {
    return {
      tenantId: request.tenantId,
      userId: request.userId,
      correlationId: request.correlationId,
      callerToken: request.callerToken
    };
  }

  private async withAudit<T>(
    operation: string,
    context: iMach360RequestContext,
    fn: () => Promise<T>
  ): Promise<T> {
    const eventId = randomUUID();
    const startedAt = Date.now();

    await this.auditService.emit({
      eventId,
      eventType: "connector.call.started",
      operation,
      tenantId: context.tenantId,
      userId: context.userId,
      correlationId: context.correlationId,
      timestamp: new Date()
    });

    try {
      const result = await fn();

      await this.auditService.emit({
        eventId: randomUUID(),
        eventType: "connector.call.succeeded",
        operation,
        tenantId: context.tenantId,
        userId: context.userId,
        correlationId: context.correlationId,
        durationMs: Date.now() - startedAt,
        timestamp: new Date()
      });

      return result;
    } catch (error) {
      const err = error instanceof iMach360ConnectorError
        ? { code: error.code, message: error.message }
        : { code: "IMACH360_REQUEST_FAILED", message: String(error) };

      await this.auditService.emit({
        eventId: randomUUID(),
        eventType: "connector.call.failed",
        operation,
        tenantId: context.tenantId,
        userId: context.userId,
        correlationId: context.correlationId,
        durationMs: Date.now() - startedAt,
        error: err,
        timestamp: new Date()
      });

      throw error;
    }
  }
}
