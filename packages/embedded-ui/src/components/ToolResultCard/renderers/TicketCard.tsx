import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import type { CardRendererProps } from "../../../sdk/ipanda.types";

interface Ticket {
  ticketId?: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  category?: string;
  createdAt?: string;
}

export const TicketCard: React.FC<CardRendererProps<Ticket>> = ({ data }) => {
  const priorityColor =
    data.priority === "Critical" || data.priority === "High"
      ? "error"
      : data.priority === "Medium"
      ? "warning"
      : "default";

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.25,
          bgcolor: "info.light",
          color: "info.contrastText",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <SupportAgentIcon sx={{ fontSize: 18 }} />
        <Typography variant="body2" fontWeight={600}>
          Support Ticket Created
        </Typography>
      </Box>

      <Box sx={{ px: 2, py: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
        {data.title && (
          <Typography variant="body2" fontWeight={600}>
            {data.title}
          </Typography>
        )}
        {data.description && (
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
            {data.description}
          </Typography>
        )}

        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 0.25 }}>
          {data.status && (
            <Chip label={data.status} size="small" color="info" variant="outlined" />
          )}
          {data.priority && (
            <Chip label={data.priority} size="small" color={priorityColor} variant="outlined" />
          )}
          {data.category && (
            <Chip label={data.category} size="small" variant="outlined" />
          )}
        </Box>

        {(data.ticketId ?? data.createdAt) && (
          <Typography variant="caption" color="text.disabled">
            {data.ticketId ? `#${data.ticketId}` : ""}
            {data.ticketId && data.createdAt ? " · " : ""}
            {data.createdAt ?? ""}
          </Typography>
        )}
      </Box>
    </Box>
  );
};
