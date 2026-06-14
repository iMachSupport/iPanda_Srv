import { iMach360ConnectorError } from "../errors/imach360-connector.error";
import type { iMach360Ticket } from "../contracts/imach360-domain.types";

interface ApiTicket {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  type?: string;
  priority?: string;
  status?: string;
  raisedBy?: string | { _id?: string };
  assignedTo?: string | { _id?: string };
  createdAt?: string;
  updatedAt?: string;
}

const validPriorities = new Set(["low", "medium", "high", "critical"]);
const validStatuses = new Set(["open", "in-progress", "resolved", "closed"]);

export const mapTicket = (raw: unknown): iMach360Ticket => {
  const r = raw as ApiTicket;

  const id = r._id ?? r.id;

  if (!id || !r.title || !r.description || !r.type) {
    throw new iMach360ConnectorError(
      "IMACH360_RESPONSE_MAPPING_FAILED",
      "Ticket record from iMach360 is missing required fields.",
      502,
      { received: raw }
    );
  }

  const priority = validPriorities.has(r.priority ?? "")
    ? (r.priority as iMach360Ticket["priority"])
    : "medium";

  const status = validStatuses.has(r.status ?? "")
    ? (r.status as iMach360Ticket["status"])
    : "open";

  const raisedBy =
    typeof r.raisedBy === "object" && r.raisedBy !== null
      ? (r.raisedBy._id ?? "")
      : (r.raisedBy ?? "");

  const assignedTo =
    typeof r.assignedTo === "object" && r.assignedTo !== null
      ? (r.assignedTo._id ?? undefined)
      : (r.assignedTo ?? undefined);

  return {
    id,
    title: r.title,
    description: r.description,
    type: r.type,
    priority,
    status,
    raisedBy,
    assignedTo,
    createdAt: r.createdAt ?? new Date().toISOString(),
    updatedAt: r.updatedAt ?? new Date().toISOString()
  };
};

export const mapTicketList = (raw: unknown): iMach360Ticket[] => {
  if (!Array.isArray(raw)) {
    throw new iMach360ConnectorError(
      "IMACH360_RESPONSE_MAPPING_FAILED",
      "Expected an array of ticket records from iMach360.",
      502,
      { receivedType: typeof raw }
    );
  }

  return raw.map(mapTicket);
};
