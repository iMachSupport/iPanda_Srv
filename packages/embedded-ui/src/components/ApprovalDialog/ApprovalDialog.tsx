import React from "react";
import { Box, Button, Divider, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import type { ApprovalRequest } from "../../sdk/ipanda.types";
import { useExecutionStore } from "../../store/execution.store";
import { useConversationStore } from "../../store/conversation.store";

interface ApprovalDialogProps {
  request: ApprovalRequest;
  messageId: string;
}

export const ApprovalDialog: React.FC<ApprovalDialogProps> = ({ request, messageId }) => {
  const { confirmApproval, cancelApproval } = useExecutionStore();
  const { updateMessage, activeConversationId } = useConversationStore();

  const handleConfirm = () => {
    updateMessage(activeConversationId, messageId, { pendingApproval: undefined });
    confirmApproval();
  };

  const handleCancel = () => {
    updateMessage(activeConversationId, messageId, { pendingApproval: undefined });
    cancelApproval();
  };

  const detailEntries = Object.entries(request.details);

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: "warning.main",
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
      role="alertdialog"
      aria-label="Action confirmation required"
    >
      <Box
        sx={{
          px: 2,
          py: 1.25,
          bgcolor: "warning.light",
          color: "warning.contrastText",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <WarningAmberIcon sx={{ fontSize: 18 }} />
        <Typography variant="body2" fontWeight={600}>
          Confirmation Required
        </Typography>
      </Box>

      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="body2" sx={{ mb: 1.25 }}>
          {request.summary}
        </Typography>

        {detailEntries.length > 0 && (
          <>
            <Divider sx={{ mb: 1.25 }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 1.5 }}>
              {detailEntries.map(([key, val]) => (
                <Box key={key} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                    {key}
                  </Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {String(val ?? "")}
                  </Typography>
                </Box>
              ))}
            </Box>
          </>
        )}

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            color="primary"
            startIcon={<CheckCircleOutlineIcon />}
            onClick={handleConfirm}
            sx={{ flex: 1 }}
          >
            Confirm
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="inherit"
            startIcon={<CancelOutlinedIcon />}
            onClick={handleCancel}
            sx={{ flex: 1 }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
