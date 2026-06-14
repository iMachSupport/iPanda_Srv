import { useExecutionStore } from "../store/execution.store";

export const useExecution = () => {
  const { status, currentOperation, pendingApproval, error } = useExecutionStore();

  return {
    status,
    currentOperation,
    pendingApproval,
    error,
    isExecuting: status === "executing",
    isAwaitingApproval: status === "awaiting-approval",
    hasError: status === "error",
  };
};
