import { create } from "zustand";
import type { ApprovalRequest } from "../sdk/ipanda.types";

export type ExecutionStatus = "idle" | "executing" | "awaiting-approval" | "error";

interface ExecutionStore {
  status: ExecutionStatus;
  currentOperation: string | null;
  pendingApproval: ApprovalRequest | null;
  error: string | null;

  setExecuting: (operation?: string) => void;
  setAwaitingApproval: (request: ApprovalRequest) => void;
  confirmApproval: () => void;
  cancelApproval: () => void;
  setError: (message: string) => void;
  reset: () => void;
}

export const useExecutionStore = create<ExecutionStore>((set) => ({
  status: "idle",
  currentOperation: null,
  pendingApproval: null,
  error: null,

  setExecuting: (operation) => {
    set({ status: "executing", currentOperation: operation ?? null, error: null });
  },

  setAwaitingApproval: (request) => {
    set({ status: "awaiting-approval", pendingApproval: request, currentOperation: null });
  },

  confirmApproval: () => {
    set({ status: "idle", pendingApproval: null });
  },

  cancelApproval: () => {
    set({ status: "idle", pendingApproval: null });
  },

  setError: (message) => {
    set({ status: "error", error: message, currentOperation: null });
  },

  reset: () => {
    set({ status: "idle", currentOperation: null, pendingApproval: null, error: null });
  },
}));
