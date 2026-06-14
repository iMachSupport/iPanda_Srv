import { iMach360ConnectorError } from "../errors/imach360-connector.error";
import type { iMach360Employee } from "../contracts/imach360-domain.types";

interface ApiEmployee {
  _id?: string;
  id?: string;
  emp_id?: string;
  empId?: string;
  name?: string;
  displayName?: string;
  email?: string;
  department?: string;
  jobTitle?: string;
  designation?: string;
  managerId?: string;
  manager?: string;
  status?: string;
}

export const mapEmployee = (raw: unknown): iMach360Employee => {
  const r = raw as ApiEmployee;

  const id = r._id ?? r.id;
  const displayName = r.displayName ?? r.name;

  if (!id || !displayName) {
    throw new iMach360ConnectorError(
      "IMACH360_RESPONSE_MAPPING_FAILED",
      "Employee record from iMach360 is missing required fields (id, displayName).",
      502,
      { received: raw }
    );
  }

  return {
    id,
    empId: r.emp_id ?? r.empId ?? id,
    displayName,
    email: r.email,
    department: r.department,
    jobTitle: r.jobTitle ?? r.designation,
    managerId: r.managerId ?? r.manager,
    employmentStatus: r.status === "inactive" ? "inactive" : "active"
  };
};

export const mapEmployeeList = (raw: unknown): iMach360Employee[] => {
  if (!Array.isArray(raw)) {
    throw new iMach360ConnectorError(
      "IMACH360_RESPONSE_MAPPING_FAILED",
      "Expected an array of employees from iMach360.",
      502,
      { receivedType: typeof raw }
    );
  }

  return raw.map(mapEmployee);
};
