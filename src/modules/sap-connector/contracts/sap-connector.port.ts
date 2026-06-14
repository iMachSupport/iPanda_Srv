export type SapOperation = "read" | "create" | "update" | "delete" | "action";

export type SapProtocol = "odata" | "rest";

export interface SapDestinationRef {
  tenantId: string;
  destinationId: string;
}

export interface SapRequestContext extends SapDestinationRef {
  correlationId?: string;
  userId?: string;
}

export interface SapODataRequest extends SapRequestContext {
  entitySet: string;
  operation: SapOperation;
  key?: string | Record<string, string | number | boolean>;
  actionName?: string;
  payload?: Record<string, unknown>;
  query?: Record<string, string | number | boolean>;
}

export interface SapODataResponse {
  statusCode: number;
  data: unknown;
  metadata?: Record<string, unknown>;
}

export interface SapRestRequest extends SapRequestContext {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  headers?: Record<string, string>;
  payload?: unknown;
  query?: Record<string, string | number | boolean>;
}

export interface SapRestResponse {
  statusCode: number;
  data: unknown;
  headers?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

export interface GetLeaveBalanceRequest extends SapRequestContext {
  employeeId: string;
  leaveType?: string;
}

export interface GetLeaveBalanceResponse {
  employeeId: string;
  balance: number;
  unit: "days" | "hours";
  sourceSystem?: string;
}

export interface CreateLeaveRequestRequest extends SapRequestContext {
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface CreateLeaveRequestResponse {
  requestId: string;
  status: "submitted" | "pending-approval" | "rejected";
  sourceSystem?: string;
}

export interface GetEmployeeDetailsRequest extends SapRequestContext {
  employeeId: string;
}

export interface GetEmployeeDetailsResponse {
  employeeId: string;
  displayName: string;
  email?: string;
  department?: string;
  managerId?: string;
  sourceSystem?: string;
}

export interface SapConnectorPort {
  executeOData(request: SapODataRequest): Promise<SapODataResponse>;
  executeRest(request: SapRestRequest): Promise<SapRestResponse>;
  getLeaveBalance(request: GetLeaveBalanceRequest): Promise<GetLeaveBalanceResponse>;
  createLeaveRequest(request: CreateLeaveRequestRequest): Promise<CreateLeaveRequestResponse>;
  getEmployeeDetails(request: GetEmployeeDetailsRequest): Promise<GetEmployeeDetailsResponse>;
}
