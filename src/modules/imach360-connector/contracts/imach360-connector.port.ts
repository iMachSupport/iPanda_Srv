import type {
  iMach360Asset,
  iMach360Employee,
  iMach360Leave,
  iMach360LeaveBalance,
  iMach360Ticket
} from "./imach360-domain.types";

export interface iMach360RequestContext {
  tenantId: string;
  userId: string;
  correlationId?: string;
  callerToken?: string;
}

// ─── Employee ─────────────────────────────────────────────────────────────────

export interface GetEmployeeByIdRequest extends iMach360RequestContext {
  employeeId: string;
}

export interface GetEmployeeByIdResponse {
  employee: iMach360Employee;
  sourceSystem: "imach360";
}

export interface ListEmployeesRequest extends iMach360RequestContext {
  search?: string;
  department?: string;
  limit?: number;
}

export interface ListEmployeesResponse {
  employees: iMach360Employee[];
  total: number;
  sourceSystem: "imach360";
}

// ─── Leave ────────────────────────────────────────────────────────────────────

export interface GetLeaveBalanceRequest extends iMach360RequestContext {
  employeeId: string;
  leaveType?: string;
}

export interface GetLeaveBalanceResponse {
  balance: iMach360LeaveBalance;
  sourceSystem: "imach360";
}

export interface ListLeavesRequest extends iMach360RequestContext {
  employeeId?: string;
  status?: "pending" | "approved" | "rejected";
  limit?: number;
}

export interface ListLeavesResponse {
  leaves: iMach360Leave[];
  total: number;
  sourceSystem: "imach360";
}

export interface CreateLeaveRequestRequest extends iMach360RequestContext {
  employeeId: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason?: string;
}

export interface CreateLeaveRequestResponse {
  leaveId: string;
  status: "submitted" | "pending-approval";
  sourceSystem: "imach360";
}

// ─── Asset ────────────────────────────────────────────────────────────────────

export interface GetEmployeeAssetsRequest extends iMach360RequestContext {
  employeeId: string;
}

export interface GetEmployeeAssetsResponse {
  assets: iMach360Asset[];
  total: number;
  sourceSystem: "imach360";
}

export interface ListAssetsRequest extends iMach360RequestContext {
  status?: string;
  assetType?: string;
}

export interface ListAssetsResponse {
  assets: iMach360Asset[];
  total: number;
  sourceSystem: "imach360";
}

// ─── IT Desk ──────────────────────────────────────────────────────────────────

export interface ListTicketsRequest extends iMach360RequestContext {
  status?: string;
  priority?: string;
}

export interface ListTicketsResponse {
  tickets: iMach360Ticket[];
  total: number;
  sourceSystem: "imach360";
}

export interface GetTicketByIdRequest extends iMach360RequestContext {
  ticketId: string;
}

export interface GetTicketByIdResponse {
  ticket: iMach360Ticket;
  sourceSystem: "imach360";
}

export interface CreateTicketRequest extends iMach360RequestContext {
  title: string;
  description: string;
  type: string;
  priority: "low" | "medium" | "high" | "critical";
  assignedTo?: string;
}

export interface CreateTicketResponse {
  ticketId: string;
  status: "open";
  sourceSystem: "imach360";
}

// ─── Port Interfaces ──────────────────────────────────────────────────────────

export interface iMach360EmployeeConnectorPort {
  getEmployeeById(request: GetEmployeeByIdRequest): Promise<GetEmployeeByIdResponse>;
  listEmployees(request: ListEmployeesRequest): Promise<ListEmployeesResponse>;
}

export interface iMach360LeaveConnectorPort {
  getLeaveBalance(request: GetLeaveBalanceRequest): Promise<GetLeaveBalanceResponse>;
  listLeaves(request: ListLeavesRequest): Promise<ListLeavesResponse>;
  createLeaveRequest(request: CreateLeaveRequestRequest): Promise<CreateLeaveRequestResponse>;
}

export interface iMach360AssetConnectorPort {
  getEmployeeAssets(request: GetEmployeeAssetsRequest): Promise<GetEmployeeAssetsResponse>;
  listAssets(request: ListAssetsRequest): Promise<ListAssetsResponse>;
}

export interface iMach360ItDeskConnectorPort {
  listTickets(request: ListTicketsRequest): Promise<ListTicketsResponse>;
  getTicketById(request: GetTicketByIdRequest): Promise<GetTicketByIdResponse>;
  createTicket(request: CreateTicketRequest): Promise<CreateTicketResponse>;
}

export interface iMach360ConnectorPort
  extends iMach360EmployeeConnectorPort,
    iMach360LeaveConnectorPort,
    iMach360AssetConnectorPort,
    iMach360ItDeskConnectorPort {}
