import React from "react";
import { Box, Typography } from "@mui/material";
import DataObjectIcon from "@mui/icons-material/DataObject";
import type { CardRendererProps } from "../../../sdk/ipanda.types";

export const GenericDataCard: React.FC<CardRendererProps> = ({ data }) => {
  if (data === null || data === undefined) return null;

  const entries =
    typeof data === "object" && !Array.isArray(data)
      ? Object.entries(data as Record<string, unknown>)
      : null;

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
        <DataObjectIcon sx={{ fontSize: 18, color: "text.secondary" }} />
        <Typography variant="body2" fontWeight={600} color="text.primary">
          Result
        </Typography>
      </Box>

      <Box sx={{ px: 2, py: 1.5 }}>
        {entries ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            {entries.map(([key, val]) => (
              <Box key={key} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                  {key}
                </Typography>
                <Typography variant="caption" fontWeight={600} sx={{ textAlign: "right", wordBreak: "break-all" }}>
                  {typeof val === "object" ? JSON.stringify(val) : String(val ?? "—")}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="caption" sx={{ fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {JSON.stringify(data, null, 2)}
          </Typography>
        )}
      </Box>
    </Box>
  );
};
