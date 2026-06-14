export interface iMach360Employee {
  id: string;
  empId: string;
  displayName: string;
  email?: string;
  department?: string;
  jobTitle?: string;
  managerId?: string;
  employmentStatus?: "active" | "inactive";
}

export interface iMach360Leave {
  id: string;
  userId: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  numberOfDays: number;
  reason?: string;
  status: "pending" | "approved" | "rejected";
  remarks?: string;
  createdAt: string;
}

export interface iMach360LeaveBalance {
  userId: string;
  leaveType?: string;
  totalEntitlement: number;
  usedDays: number;
  remainingDays: number;
}

export interface iMach360Asset {
  id: string;
  assetCode: string;
  assetName: string;
  assetType: string;
  status: "available" | "assigned" | "maintenance" | "retired";
  assignedTo?: string;
  assignedUserName?: string;
}

export interface iMach360Ticket {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "resolved" | "closed";
  raisedBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}
