import { SapConnectorError } from "../errors/sap-connector.error";
import { SapConnectorService } from "./sap-connector.service";
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
  SapRestResponse
} from "../contracts/sap-connector.port";

export abstract class SapHrConnectorService extends SapConnectorService {
  public abstract override executeOData(request: SapODataRequest): Promise<SapODataResponse>;
  public abstract override executeRest(request: SapRestRequest): Promise<SapRestResponse>;

  public override async getLeaveBalance(_request: GetLeaveBalanceRequest): Promise<GetLeaveBalanceResponse> {
    throw new SapConnectorError(
      "SAP_OPERATION_NOT_IMPLEMENTED",
      "SAP getLeaveBalance operation is designed but not implemented.",
      501
    );
  }

  public override async createLeaveRequest(
    _request: CreateLeaveRequestRequest
  ): Promise<CreateLeaveRequestResponse> {
    throw new SapConnectorError(
      "SAP_OPERATION_NOT_IMPLEMENTED",
      "SAP createLeaveRequest operation is designed but not implemented.",
      501
    );
  }

  public override async getEmployeeDetails(
    _request: GetEmployeeDetailsRequest
  ): Promise<GetEmployeeDetailsResponse> {
    throw new SapConnectorError(
      "SAP_OPERATION_NOT_IMPLEMENTED",
      "SAP getEmployeeDetails operation is designed but not implemented.",
      501
    );
  }
}
