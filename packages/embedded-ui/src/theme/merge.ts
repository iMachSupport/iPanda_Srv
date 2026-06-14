import { createTheme } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import { lightTheme } from "./light.theme";
import { darkTheme } from "./dark.theme";
import type { IPandaThemeOverride } from "../sdk/ipanda.types";

export const buildTheme = (override?: IPandaThemeOverride): Theme => {
  const base = override?.mode === "dark" ? darkTheme : lightTheme;

  if (!override) return base;

  return createTheme(base, {
    palette: {
      ...(override.palette?.primary
        ? { primary: { main: override.palette.primary } }
        : {}),
      ...(override.palette?.background
        ? { background: { default: override.palette.background } }
        : {}),
    },
    typography: {
      ...(override.typography?.fontFamily
        ? { fontFamily: override.typography.fontFamily }
        : {}),
    },
  });
};
