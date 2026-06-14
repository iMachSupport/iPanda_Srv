import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import type { CardRendererProps } from "../../../sdk/ipanda.types";

interface Ticket {
  ticketId?: string;
  title?: string;
  status?: string;
  priority?: string;
  createdAt?: string;
}

interface TicketListOutput {
  tickets?: Ticket[];
}

export const TicketListCard: React.FC<CardRendererProps<TicketListOutput>> = ({ data }) => {
  const tickets = data.tickets ?? [];

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
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "secondary.main",
        }}
      >
        <SupportAgentIcon sx={{ fontSize: 18, color: "text.secondary" }} />
        <Typography variant="body2" fontWeight={600} color="text.primary">
          Support Tickets ({tickets.length})
        </Typography>
      </Box>

      {tickets.length === 0 ? (
        <Box sx={{ px: 2, py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No tickets found.
          </Typography>
        </Box>
      ) : (
        tickets.map((ticket, i) => {
          const priorityColor =
            ticket.priority === "Critical" || ticket.priority === "High"
              ? "error"
              : ticket.priority === "Medium"
              ? "warning"
              : "default";

          return (
            <Box
              key={ticket.ticketId ?? i}
              sx={{
                px: 2,
                py: 1.25,
                borderBottom: i < tickets.length - 1 ? "1px solid" : "none",
                borderColor: "divider",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 1,
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {ticket.title ?? ticket.ticketId ?? "Ticket"}
                </Typography>
                {ticket.createdAt && (
                  <Typography variant="caption" color="text.disabled">
                    {ticket.createdAt}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                {ticket.priority && (
                  <Chip label={ticket.priority} size="small" color={priorityColor} variant="outlined" />
                )}
                {ticket.status && (
                  <Chip label={ticket.status} size="small" variant="outlined" />
                )}
              </Box>
            </Box>
          );
        })
      )}
    </Box>
  );
};
