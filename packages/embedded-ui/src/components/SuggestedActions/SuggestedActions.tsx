import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import type { SuggestedAction } from "../../sdk/ipanda.types";

interface SuggestedActionsProps {
  actions: SuggestedAction[];
  onSelect: (message: string) => void;
  disabled?: boolean;
}

export const SuggestedActions: React.FC<SuggestedActionsProps> = ({
  actions,
  onSelect,
  disabled = false,
}) => {
  if (actions.length === 0) return null;

  return (
    <Box sx={{ px: 2, pb: 1.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
        <AutoAwesomeIcon sx={{ fontSize: 13, color: "text.secondary" }} />
        <Typography variant="caption" color="text.secondary">
          Quick actions
        </Typography>
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
        {actions.map((action) => (
          <Chip
            key={action.label}
            label={action.label}
            size="small"
            variant="outlined"
            clickable
            disabled={disabled}
            onClick={() => onSelect(action.message)}
            sx={{
              borderRadius: 2,
              fontSize: "0.75rem",
              "&:hover": { bgcolor: "primary.main", color: "primary.contrastText", borderColor: "primary.main" },
              transition: "all 0.15s ease",
            }}
            aria-label={`Ask: ${action.message}`}
          />
        ))}
      </Box>
    </Box>
  );
};
