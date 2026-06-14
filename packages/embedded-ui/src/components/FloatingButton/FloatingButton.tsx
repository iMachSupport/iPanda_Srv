import React from "react";
import { Fab, Tooltip } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { usePanelStore } from "../../store/panel.store";
import { useIPandaConfig } from "../../context/IPandaContext";
import { tokens } from "../../theme/tokens";

export const FloatingButton: React.FC = () => {
  const { open } = usePanelStore();
  const config = useIPandaConfig();
  const name = config.theme?.branding?.assistantName ?? "iPanda";

  return (
    <Tooltip title={`Open ${name}`} placement="left">
      <Fab
        color="primary"
        aria-label={`Open ${name} assistant`}
        onClick={open}
        sx={{
          position: "fixed",
          bottom: tokens.fabBottomOffset,
          right: tokens.fabRightOffset,
          width: tokens.fabSize,
          height: tokens.fabSize,
          zIndex: tokens.zIndex.fab,
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          "&:hover": {
            transform: "scale(1.06)",
            boxShadow: "0 6px 28px rgba(0,0,0,0.32)",
          },
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
        }}
      >
        {config.theme?.branding?.assistantAvatar ? (
          <img
            src={config.theme.branding.assistantAvatar}
            alt={name}
            style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <SmartToyIcon sx={{ fontSize: 26 }} />
        )}
      </Fab>
    </Tooltip>
  );
};
