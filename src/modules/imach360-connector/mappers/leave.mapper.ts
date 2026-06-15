import { iMach360ConnectorError } from "../errors/imach360-connector.error";
import type { iMach360Leave, iMach360LeaveBalance } from "../contracts/imach360-domain.types";

interface ApiLeave {
  _id?: string;
  id?: string;
  userId?: string | { _id?: string };
  leaveType?: string;
  fromDate?: string;
  toDate?: string;
  reason?: string;
  status?: string;
  remarks?: string;
  numberOfDays?: number;
  createdAt?: string;
}

const computeWorkingDays = (fromDate: string, toDate: string): number => {
  const start = new Date(fromDate);
  const end = new Date(toDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 0;
  }

  let days = 0;
  const cursor = new Date(start);

  while (cursor <= end) {
    const day = cursor.getDay();

    if (day !== 0 && day !== 6) {
      days++;
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
};

export const mapLeave = (raw: unknown): iMach360Leave => {
  const r = raw as ApiLeave;

  const id = r._id ?? r.id;
  const userId =
    typeof r.userId === "object" && r.userId !== null
      ? (r.userId._id ?? "")
      : (r.userId ?? "");

  if (!id || !r.leaveType || !r.fromDate || !r.toDate) {
    throw new iMach360ConnectorError(
      "IMACH360_RESPONSE_MAPPING_FAILED",
      "Leave record from iMach360 is missing required fields.",
      502,
      { received: raw }
    );
  }

  const validStatuses = new Set(["pending", "approved", "rejected"]);
  const status = validStatuses.has(r.status ?? "")
    ? (r.status as "pending" | "approved" | "rejected")
    : "pending";

  return {
    id,
    userId,
    leaveType: r.leaveType,
    fromDate: r.fromDate,
    toDate: r.toDate,
    numberOfDays: r.numberOfDays ?? computeWorkingDays(r.fromDate, r.toDate),
    reason: r.reason,
    status,
    remarks: r.remarks,
    createdAt: r.createdAt ?? new Date().toISOString()
  };
};

export const mapLeaveList = (raw: unknown): iMach360Leave[] => {
  if (!Array.isArray(raw)) {
    throw new iMach360ConnectorError(
      "IMACH360_RESPONSE_MAPPING_FAILED",
      "Expected an array of leave records from iMach360.",
      502,
      { receivedType: typeof raw }
    );
  }

  return raw.map(mapLeave);
};

export const computeLeaveBalance = (
  leaves: iMach360Leave[],
  userId: string,
  leaveType: string | undefined,
  totalEntitlement: number
): iMach360LeaveBalance => {
  const currentYear = new Date().getFullYear();

  const usedDays = leaves
    .filter(
      (l) =>
        l.userId === userId &&
        l.status === "approved" &&
        new Date(l.fromDate).getFullYear() === currentYear &&
        (!leaveType || l.leaveType === leaveType)
    )
    .reduce((sum, l) => sum + l.numberOfDays, 0);

  return {
    userId,
    leaveType,
    totalEntitlement,
    usedDays,
    remainingDays: Math.max(0, totalEntitlement - usedDays)
  };
};
