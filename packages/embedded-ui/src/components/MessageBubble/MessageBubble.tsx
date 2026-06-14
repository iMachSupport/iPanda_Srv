import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import type { Message } from "../../sdk/ipanda.types";
import { ToolResultCard } from "../ToolResultCard/ToolResultCard";
import { ApprovalDialog } from "../ApprovalDialog/ApprovalDialog";
import { TypingIndicator } from "../TypingIndicator/TypingIndicator";
import { useIPandaConfig } from "../../context/IPandaContext";

interface MessageBubbleProps {
  message: Message;
  isLast?: boolean;
  isExecuting?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isLast = false,
  isExecuting = false,
}) => {
  const config = useIPandaConfig();
  const isUser = message.role === "user";
  const avatarSrc = config.theme?.branding?.assistantAvatar;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-start",
        gap: 1,
        mb: 1.5,
      }}
      role="article"
      aria-label={`${isUser ? "Your" : "Assistant"} message`}
    >
      <Avatar
        sx={{
          width: 30,
          height: 30,
          bgcolor: isUser ? "secondary.main" : "primary.main",
          flexShrink: 0,
          mt: 0.25,
        }}
        src={!isUser && avatarSrc ? avatarSrc : undefined}
        aria-hidden="true"
      >
        {isUser ? (
          <PersonIcon sx={{ fontSize: 18 }} />
        ) : !avatarSrc ? (
          <SmartToyIcon sx={{ fontSize: 18 }} />
        ) : null}
      </Avatar>

      <Box sx={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: 1 }}>
        <Box
          sx={{
            px: 1.75,
            py: 1.25,
            borderRadius: isUser
              ? "16px 4px 16px 16px"
              : "4px 16px 16px 16px",
            bgcolor: isUser ? "primary.main" : "background.paper",
            color: isUser ? "primary.contrastText" : "text.primary",
            boxShadow: isUser ? "none" : "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          {isLast && isExecuting && !isUser ? (
            <TypingIndicator />
          ) : (
            <Typography
              variant="body2"
              sx={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                lineHeight: 1.55,
              }}
            >
              {message.content}
            </Typography>
          )}
        </Box>

        {message.actions && message.actions.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {message.actions
              .filter((a) => a.status === "succeeded" && a.output)
              .map((action) => (
                <ToolResultCard key={action.actionId} action={action} />
              ))}
          </Box>
        )}

        {message.pendingApproval && (
          <ApprovalDialog
            request={message.pendingApproval}
            messageId={message.id}
          />
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ alignSelf: isUser ? "flex-end" : "flex-start", px: 0.5 }}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Typography>
      </Box>
    </Box>
  );
};
