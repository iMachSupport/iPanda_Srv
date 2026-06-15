import React from "react";
import { Fab, Tooltip } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { usePanelStore } from "../../store/panel.store";
import { useIPandaConfig } from "../../context/IPandaContext";
import { tokens } from "../../theme/tokens";

export interface FloatingButtonProps {
  isInline?: boolean;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({ isInline = false }) => {
  const { open } = usePanelStore();
  const config = useIPandaConfig();
  const name = config.theme?.branding?.assistantName ?? "iPanda";

  return (
    <Tooltip title={`Open ${name}`} placement={isInline ? "bottom" : "left"}>
      <Fab
        variant="extended"
        color="primary"
        aria-label={`Open ${name} assistant`}
        onClick={open}
        sx={{
          boxShadow: isInline ? "none" : "0 4px 20px rgba(0,0,0,0.25)",
          textTransform: "none",
          fontWeight: 600,
          fontSize: "14px",
          px: 2.5,
          height: 48,
          gap: 1.2,
          "&:hover": {
            transform: "scale(1.04)",
            boxShadow: isInline ? "none" : "0 6px 28px rgba(0,0,0,0.32)",
          },
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
          ...(!isInline && {
            position: "fixed",
            bottom: tokens.fabBottomOffset,
            right: tokens.fabRightOffset,
            zIndex: tokens.zIndex.fab,
          }),
        }}
      >
        {config.theme?.branding?.assistantAvatar ? (
          <img
            src={config.theme.branding.assistantAvatar}
            alt={name}
            style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <SmartToyIcon sx={{ fontSize: 22 }} />
        )}
        <span>{name}</span>
      </Fab>
    </Tooltip>
  );
};
