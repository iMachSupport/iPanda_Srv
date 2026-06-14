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
  iMach360ConnectorPort
} from "../contracts/imach360-connector.port";

export abstract class iMach360ConnectorService implements iMach360ConnectorPort {
  public abstract getEmployeeById(request: GetEmployeeByIdRequest): Promise<GetEmployeeByIdResponse>;
  public abstract listEmployees(request: ListEmployeesRequest): Promise<ListEmployeesResponse>;

  public abstract getLeaveBalance(request: GetLeaveBalanceRequest): Promise<GetLeaveBalanceResponse>;
  public abstract listLeaves(request: ListLeavesRequest): Promise<ListLeavesResponse>;
  public abstract createLeaveRequest(request: CreateLeaveRequestRequest): Promise<CreateLeaveRequestResponse>;

  public abstract getEmployeeAssets(request: GetEmployeeAssetsRequest): Promise<GetEmployeeAssetsResponse>;
  public abstract listAssets(request: ListAssetsRequest): Promise<ListAssetsResponse>;

  public abstract listTickets(request: ListTicketsRequest): Promise<ListTicketsResponse>;
  public abstract getTicketById(request: GetTicketByIdRequest): Promise<GetTicketByIdResponse>;
  public abstract createTicket(request: CreateTicketRequest): Promise<CreateTicketResponse>;
}
