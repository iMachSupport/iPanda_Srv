import React from "react";
import { Box, Divider, LinearProgress, Typography } from "@mui/material";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import type { CardRendererProps } from "../../../sdk/ipanda.types";

interface LeaveBalance {
  totalEntitlement?: number;
  usedDays?: number;
  remainingDays?: number;
  balance?: number;
  leaveType?: string;
}

export const LeaveBalanceCard: React.FC<CardRendererProps<LeaveBalance>> = ({ data }) => {
  const total = data.totalEntitlement ?? 20;
  const used = data.usedDays ?? 0;
  const remaining = data.remainingDays ?? data.balance ?? total - used;
  const pct = total > 0 ? Math.min(100, Math.round((remaining / total) * 100)) : 0;
  const color = pct > 50 ? "success" : pct > 25 ? "warning" : "error";

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
          bgcolor: "primary.main",
          color: "primary.contrastText",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <BeachAccessIcon sx={{ fontSize: 18 }} />
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Leave Balance {data.leaveType ? `(${data.leaveType})` : ""}
        </Typography>
      </Box>

      <Box sx={{ px: 2, py: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" color="text.secondary">Annual entitlement</Typography>
          <Typography variant="body2" fontWeight={600}>{total} days</Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" color="text.secondary">Days used</Typography>
          <Typography variant="body2" fontWeight={600}>{used} days</Typography>
        </Box>

        <Divider />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2" color="text.secondary">Remaining</Typography>
          <Typography variant="body1" fontWeight={700} color={`${color}.main`}>
            {remaining} days
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={pct}
          color={color}
          sx={{ height: 6, borderRadius: 3 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: "right" }}>
          {pct}% available
        </Typography>
      </Box>
    </Box>
  );
};
