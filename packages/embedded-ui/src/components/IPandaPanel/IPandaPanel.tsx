import React, { useEffect } from "react";
import { Box, Drawer, Modal, useMediaQuery, useTheme } from "@mui/material";
import { IPandaProvider } from "../../context/IPandaContext";
import { CardRendererProvider } from "../../context/CardRendererContext";
import { FloatingButton } from "../FloatingButton/FloatingButton";
import { ChatWindow } from "../ChatWindow/ChatWindow";
import { usePanelStore } from "../../store/panel.store";
import { useContextStore } from "../../store/context.store";
import { useIPanda } from "../../hooks/useIPanda";
import { BUILTIN_RENDERERS } from "../ToolResultCard/ToolResultCard";
import type { IPandaPanelProps } from "../../sdk/ipanda.types";
import { tokens } from "../../theme/tokens";

const PANEL_WIDTH = tokens.panelWidth;

const PanelInner: React.FC<Pick<IPandaPanelProps, "position" | "context">> = ({
  position = "right",
  context,
}) => {
  const { isOpen } = usePanelStore();
  const { setContext } = useContextStore();
  const { submit } = useIPanda();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (context) setContext(context);
  }, [context, setContext]);

  const anchor = position === "left" ? "left" : "right";

  if (isMobile) {
    return (
      <Modal
        open={isOpen}
        aria-label="iPanda assistant"
        sx={{ zIndex: tokens.zIndex.panel }}
      >
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "background.default",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <ChatWindow onSubmit={submit} />
        </Box>
      </Modal>
    );
  }

  return (
    <Drawer
      anchor={anchor}
      open={isOpen}
      variant="persistent"
      sx={{
        width: isOpen ? PANEL_WIDTH : 0,
        flexShrink: 0,
        transition: tokens.transition.panel,
        zIndex: tokens.zIndex.panel,
        "& .MuiDrawer-paper": {
          width: PANEL_WIDTH,
          boxSizing: "border-box",
          border: "none",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          transition: tokens.transition.panel,
        },
      }}
      PaperProps={{ elevation: 0 }}
      ModalProps={{ keepMounted: true }}
      aria-label="iPanda assistant panel"
    >
      <ChatWindow onSubmit={submit} />
    </Drawer>
  );
};

export const IPandaPanel: React.FC<IPandaPanelProps> = ({
  apiUrl,
  tenantId,
  userId,
  sessionId,
  callerToken,
  context,
  theme,
  position = "right",
  defaultOpen = false,
  showFab = true,
  cardRenderers,
  suggestedActions,
  onAction,
}) => {
  const { open } = usePanelStore();

  useEffect(() => {
    if (defaultOpen) open();
  }, [defaultOpen, open]);

  return (
    <IPandaProvider
      config={{
        apiUrl,
        tenantId,
        userId,
        sessionId,
        callerToken,
        theme,
        suggestedActions,
        cardRenderers,
        onAction,
      }}
    >
      <CardRendererProvider builtins={BUILTIN_RENDERERS} renderers={cardRenderers}>
        {showFab && <FloatingButton />}
        <PanelInner position={position} context={context} />
      </CardRendererProvider>
    </IPandaProvider>
  );
};
