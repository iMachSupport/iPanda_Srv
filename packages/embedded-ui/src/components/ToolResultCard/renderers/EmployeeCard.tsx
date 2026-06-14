import React from "react";
import { Avatar, Box, Chip, Typography } from "@mui/material";
import BadgeIcon from "@mui/icons-material/Badge";
import type { CardRendererProps } from "../../../sdk/ipanda.types";

interface Employee {
  employeeId?: string;
  empId?: string;
  displayName?: string;
  email?: string;
  department?: string;
  jobTitle?: string;
  employmentStatus?: string;
}

export const EmployeeCard: React.FC<CardRendererProps<Employee>> = ({ data }) => {
  const initials = (data.displayName ?? "?")
    .split(" ")
    .map((w) => w[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
          bgcolor: "secondary.main",
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <BadgeIcon sx={{ fontSize: 18, color: "text.secondary" }} />
        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
          Employee Profile
        </Typography>
      </Box>

      <Box sx={{ px: 2, py: 1.5, display: "flex", gap: 1.5, alignItems: "flex-start" }}>
        <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40, flexShrink: 0 }}>
          {initials}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700} noWrap>
            {data.displayName ?? "—"}
          </Typography>
          {data.jobTitle && (
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {data.jobTitle}
            </Typography>
          )}
          {data.email && (
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {data.email}
            </Typography>
          )}
          <Box sx={{ display: "flex", gap: 0.5, mt: 0.75, flexWrap: "wrap" }}>
            {data.department && (
              <Chip label={data.department} size="small" variant="outlined" />
            )}
            {data.employmentStatus && (
              <Chip
                label={data.employmentStatus}
                size="small"
                color={data.employmentStatus === "Active" ? "success" : "default"}
                variant="outlined"
              />
            )}
          </Box>
          {(data.empId ?? data.employeeId) && (
            <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.5 }}>
              ID: {data.empId ?? data.employeeId}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};
