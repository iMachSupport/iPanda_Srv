import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import type { CardRendererProps } from "../../../sdk/ipanda.types";

interface LeaveRequest {
  leaveId?: string;
  leaveType?: string;
  fromDate?: string;
  toDate?: string;
  numberOfDays?: number;
  reason?: string;
  status?: string;
}

export const LeaveRequestCard: React.FC<CardRendererProps<LeaveRequest>> = ({ data }) => (
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
        bgcolor: "success.light",
        color: "success.contrastText",
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <EventAvailableIcon sx={{ fontSize: 18 }} />
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Leave Request Submitted
      </Typography>
    </Box>

    <Box sx={{ px: 2, py: 1.5, display: "flex", flexDirection: "column", gap: 0.75 }}>
      {data.leaveType && (
        <Row label="Type" value={data.leaveType} />
      )}
      {data.fromDate && <Row label="From" value={data.fromDate} />}
      {data.toDate && <Row label="To" value={data.toDate} />}
      {data.numberOfDays !== undefined && (
        <Row label="Duration" value={`${data.numberOfDays} day${data.numberOfDays !== 1 ? "s" : ""}`} />
      )}
      {data.reason && <Row label="Reason" value={data.reason} />}
      {data.status && (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="caption" color="text.secondary">Status</Typography>
          <Chip
            label={data.status}
            size="small"
            color={data.status === "Approved" ? "success" : "warning"}
            variant="outlined"
          />
        </Box>
      )}
      {data.leaveId && (
        <Typography variant="caption" color="text.disabled">
          Ref: {data.leaveId}
        </Typography>
      )}
    </Box>
  </Box>
);

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>{label}</Typography>
    <Typography variant="caption" fontWeight={600} sx={{ textAlign: "right" }}>{value}</Typography>
  </Box>
);
