import React, { createContext, useContext, useMemo } from "react";
import type { CardRendererMap, CardRenderer } from "../sdk/ipanda.types";

interface CardRendererContextValue {
  getRenderer: (toolId: string) => CardRenderer | null;
}

const CardRendererCtx = createContext<CardRendererContextValue | null>(null);

export const CardRendererProvider: React.FC<{
  renderers?: CardRendererMap;
  builtins: CardRendererMap;
  children: React.ReactNode;
}> = ({ renderers, builtins, children }) => {
  const merged = useMemo<CardRendererMap>(
    () => ({ ...builtins, ...renderers }),
    [builtins, renderers]
  );

  const value = useMemo<CardRendererContextValue>(
    () => ({
      getRenderer: (toolId) => merged[toolId] ?? null,
    }),
    [merged]
  );

  return <CardRendererCtx.Provider value={value}>{children}</CardRendererCtx.Provider>;
};

export const useCardRenderer = (toolId: string): CardRenderer | null => {
  const ctx = useContext(CardRendererCtx);
  if (!ctx) throw new Error("useCardRenderer must be used inside CardRendererProvider");
  return ctx.getRenderer(toolId);
};
