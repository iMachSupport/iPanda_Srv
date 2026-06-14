import React from "react";
import { Box, IconButton, Typography, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import AddCommentIcon from "@mui/icons-material/AddComment";
import { usePanelStore } from "../../store/panel.store";
import { useConversationStore } from "../../store/conversation.store";
import { useExecutionStore } from "../../store/execution.store";
import { useIPandaConfig } from "../../context/IPandaContext";
import { tokens } from "../../theme/tokens";

export const ConversationHeader: React.FC = () => {
  const { close } = usePanelStore();
  const { createConversation } = useConversationStore();
  const { reset, status } = useExecutionStore();
  const config = useIPandaConfig();
  const name = config.theme?.branding?.assistantName ?? "iPanda";

  const handleNewConversation = () => {
    reset();
    createConversation();
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        height: tokens.headerHeight,
        px: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
        flexShrink: 0,
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
        {config.theme?.branding?.assistantAvatar ? (
          <img
            src={config.theme.branding.assistantAvatar}
            alt={name}
            style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <SmartToyIcon color="primary" sx={{ fontSize: 22 }} />
        )}
        <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
          {name}
        </Typography>
      </Box>

      <Tooltip title="New conversation">
        <span>
          <IconButton
            size="small"
            onClick={handleNewConversation}
            disabled={status === "executing"}
            aria-label="Start new conversation"
            sx={{ mr: 0.5 }}
          >
            <AddCommentIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Close">
        <IconButton
          size="small"
          onClick={close}
          aria-label="Close assistant panel"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
