import type {
  CreateLeaveRequestRequest,
  CreateLeaveRequestResponse,
  GetEmployeeDetailsRequest,
  GetEmployeeDetailsResponse,
  GetLeaveBalanceRequest,
  GetLeaveBalanceResponse,
  SapODataRequest,
  SapODataResponse,
  SapRestRequest,
  SapRestResponse,
  SapConnectorPort
} from "../contracts/sap-connector.port";

export abstract class SapConnectorService implements SapConnectorPort {
  public abstract executeOData(request: SapODataRequest): Promise<SapODataResponse>;
  public abstract executeRest(request: SapRestRequest): Promise<SapRestResponse>;
  public abstract getLeaveBalance(request: GetLeaveBalanceRequest): Promise<GetLeaveBalanceResponse>;
  public abstract createLeaveRequest(request: CreateLeaveRequestRequest): Promise<CreateLeaveRequestResponse>;
  public abstract getEmployeeDetails(request: GetEmployeeDetailsRequest): Promise<GetEmployeeDetailsResponse>;
}
