import React, { createContext, useContext, useMemo } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { IPandaClient } from "../sdk/IPandaClient";
import { buildTheme } from "../theme/merge";
import type { IPandaClientConfig, IPandaThemeOverride, SuggestedAction, CardRendererMap, RuntimeActionResult } from "../sdk/ipanda.types";

interface IPandaProviderConfig extends IPandaClientConfig {
  theme?: IPandaThemeOverride;
  suggestedActions?: SuggestedAction[];
  cardRenderers?: CardRendererMap;
  onAction?: (action: RuntimeActionResult) => void;
  assistantName?: string;
  assistantAvatar?: string;
}

interface IPandaContextValue {
  client: IPandaClient;
  config: IPandaProviderConfig;
}

const IPandaCtx = createContext<IPandaContextValue | null>(null);

export const IPandaProvider: React.FC<{
  config: IPandaProviderConfig;
  children: React.ReactNode;
}> = ({ config, children }) => {
  const client = useMemo(
    () =>
      new IPandaClient({
        apiUrl: config.apiUrl,
        tenantId: config.tenantId,
        userId: config.userId,
        sessionId: config.sessionId,
        callerToken: config.callerToken,
      }),
    [config.apiUrl, config.tenantId, config.userId, config.sessionId, config.callerToken]
  );

  const muiTheme = useMemo(() => buildTheme(config.theme), [config.theme]);

  const value = useMemo(() => ({ client, config }), [client, config]);

  return (
    <IPandaCtx.Provider value={value}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </IPandaCtx.Provider>
  );
};

export const useIPandaClient = (): IPandaClient => {
  const ctx = useContext(IPandaCtx);
  if (!ctx) throw new Error("useIPandaClient must be used inside IPandaProvider");
  return ctx.client;
};

export const useIPandaConfig = (): IPandaProviderConfig => {
  const ctx = useContext(IPandaCtx);
  if (!ctx) throw new Error("useIPandaConfig must be used inside IPandaProvider");
  return ctx.config;
};
