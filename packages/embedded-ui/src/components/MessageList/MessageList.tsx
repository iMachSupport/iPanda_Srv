import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { useConversationStore } from "../../store/conversation.store";
import { useExecutionStore } from "../../store/execution.store";
import { MessageBubble } from "../MessageBubble/MessageBubble";
import { EmptyState } from "../EmptyState/EmptyState";
import { tokens } from "../../theme/tokens";

export const MessageList: React.FC = () => {
  const { getActiveConversation } = useConversationStore();
  const { status } = useExecutionStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const conversation = getActiveConversation();
  const messages = conversation?.messages ?? [];
  const isExecuting = status === "executing";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isExecuting]);

  if (messages.length === 0 && !isExecuting) {
    return <EmptyState />;
  }

  return (
    <Box
      sx={{
        flex: 1,
        overflowY: "auto",
        px: `${tokens.spacing.panelPadding}px`,
        py: 2,
        display: "flex",
        flexDirection: "column",
        "&::-webkit-scrollbar": { width: 4 },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: "divider",
          borderRadius: 2,
        },
      }}
      role="log"
      aria-live="polite"
      aria-label="Conversation"
    >
      {messages.map((msg, idx) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isLast={idx === messages.length - 1}
          isExecuting={isExecuting && idx === messages.length - 1}
        />
      ))}
      <div ref={bottomRef} />
    </Box>
  );
};
