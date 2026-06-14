import { useCallback } from "react";
import { useIPandaClient, useIPandaConfig } from "../context/IPandaContext";
import { useConversationStore } from "../store/conversation.store";
import { useExecutionStore } from "../store/execution.store";
import { useContextStore } from "../store/context.store";
import type { Message, RuntimeActionResult } from "../sdk/ipanda.types";

const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const inferOperation = (message: string): string => {
  const lower = message.toLowerCase();
  if (lower.includes("leave") && (lower.includes("balance") || lower.includes("remaining"))) {
    return "Checking leave balance...";
  }
  if (lower.includes("leave") && lower.includes("request")) return "Creating leave request...";
  if (lower.includes("asset") || lower.includes("laptop") || lower.includes("equipment")) {
    return "Retrieving asset information...";
  }
  if (lower.includes("ticket") || lower.includes("support") || lower.includes("it help")) {
    return "Accessing IT desk...";
  }
  if (lower.includes("employee") || lower.includes("profile") || lower.includes("who is")) {
    return "Looking up employee details...";
  }
  return "Processing your request...";
};

export const useIPanda = () => {
  const client = useIPandaClient();
  const config = useIPandaConfig();
  const { addMessage, activeConversationId } = useConversationStore();
  const { setExecuting, setError, reset } = useExecutionStore();
  const { runtimeContext } = useContextStore();

  const submit = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed) return;

      const userMessageId = generateId();
      const userMessage: Message = {
        id: userMessageId,
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      addMessage(activeConversationId, userMessage);
      setExecuting(inferOperation(trimmed));

      const assistantMessageId = generateId();

      try {
        const result = await client.execute({
          message: trimmed,
          context: runtimeContext ?? undefined,
          conversationId: activeConversationId,
        });

        const approvalAction = result.actions.find((a) => a.requiresApproval);

        const assistantMessage: Message = {
          id: assistantMessageId,
          role: "assistant",
          content: result.message,
          actions: result.actions,
          timestamp: new Date(),
          pendingApproval: approvalAction
            ? {
                messageId: assistantMessageId,
                summary: result.message,
                toolId: approvalAction.toolId ?? "",
                details: (approvalAction.output as Record<string, unknown>) ?? {},
              }
            : undefined,
        };

        addMessage(activeConversationId, assistantMessage);

        result.actions
          .filter((a): a is RuntimeActionResult & { output: unknown } => a.output !== undefined)
          .forEach((action) => config.onAction?.(action));

        reset();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred.";

        addMessage(activeConversationId, {
          id: assistantMessageId,
          role: "assistant",
          content: "I encountered an error processing your request. Please try again.",
          timestamp: new Date(),
        });

        setError(errorMessage);
      }
    },
    [client, config, addMessage, activeConversationId, setExecuting, setError, reset, runtimeContext]
  );

  return { submit };
};
