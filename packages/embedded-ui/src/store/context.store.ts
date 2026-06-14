import { create } from "zustand";
import type { IPandaRuntimeContext } from "../sdk/ipanda.types";

interface ContextStore {
  runtimeContext: IPandaRuntimeContext | null;
  setContext: (ctx: IPandaRuntimeContext) => void;
  clearContext: () => void;
}

export const useContextStore = create<ContextStore>((set) => ({
  runtimeContext: null,
  setContext: (ctx) => set({ runtimeContext: ctx }),
  clearContext: () => set({ runtimeContext: null }),
}));
