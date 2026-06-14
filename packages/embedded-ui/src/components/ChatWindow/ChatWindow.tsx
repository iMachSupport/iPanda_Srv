import React from "react";
import { Box } from "@mui/material";
import { ConversationHeader } from "../ConversationHeader/ConversationHeader";
import { MessageList } from "../MessageList/MessageList";
import { ExecutionStatus } from "../ExecutionStatus/ExecutionStatus";
import { ErrorState } from "../ErrorState/ErrorState";
import { SuggestedActions } from "../SuggestedActions/SuggestedActions";
import { ChatInput } from "../ChatInput/ChatInput";
import { useExecutionStore } from "../../store/execution.store";
import { useConversationStore } from "../../store/conversation.store";
import { useIPandaConfig } from "../../context/IPandaContext";
import type { SuggestedAction } from "../../sdk/ipanda.types";

interface ChatWindowProps {
  onSubmit: (message: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onSubmit }) => {
  const { status } = useExecutionStore();
  const { getActiveConversation } = useConversationStore();
  const config = useIPandaConfig();

  const isExecuting = status === "executing";
  const isAwaitingApproval = status === "awaiting-approval";
  const isInputDisabled = isExecuting || isAwaitingApproval;

  const conversation = getActiveConversation();
  const hasMessages = (conversation?.messages.length ?? 0) > 0;
  const suggestedActions: SuggestedAction[] = config.suggestedActions ?? [];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      <ConversationHeader />

      <MessageList />

      <ExecutionStatus />

      <ErrorState />

      {!hasMessages && !isExecuting && suggestedActions.length > 0 && (
        <SuggestedActions
          actions={suggestedActions}
          onSelect={onSubmit}
          disabled={isInputDisabled}
        />
      )}

      <ChatInput
        onSubmit={onSubmit}
        disabled={isInputDisabled}
        placeholder={
          isExecuting
            ? "Processing..."
            : isAwaitingApproval
            ? "Waiting for your confirmation..."
            : "Ask me anything..."
        }
      />
    </Box>
  );
};
