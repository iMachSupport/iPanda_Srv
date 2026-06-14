import React from "react";
import { Box, Typography } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { useIPandaConfig } from "../../context/IPandaContext";

export const EmptyState: React.FC = () => {
  const config = useIPandaConfig();
  const name = config.theme?.branding?.assistantName ?? "iPanda";

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        p: 3,
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          bgcolor: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
        }}
      >
        {config.theme?.branding?.assistantAvatar ? (
          <img
            src={config.theme.branding.assistantAvatar}
            alt={name}
            style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <SmartToyIcon sx={{ fontSize: 30, color: "primary.contrastText" }} />
        )}
      </Box>

      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          How can I help?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ask me anything about your work. I can check leave balances, assets, tickets, and more.
        </Typography>
      </Box>
    </Box>
  );
};
