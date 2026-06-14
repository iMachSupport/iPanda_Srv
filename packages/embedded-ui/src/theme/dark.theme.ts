import { createTheme } from "@mui/material/styles";

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#4A9EFF",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#2A2A3E",
    },
    background: {
      default: "#0F1117",
      paper: "#1A1D2E",
    },
    text: {
      primary: "#E8E8F0",
      secondary: "#9999B3",
    },
    divider: "rgba(255,255,255,0.08)",
  },
  typography: {
    fontFamily:
      '"Inter", "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: 14,
    body1: { fontSize: "0.875rem", lineHeight: 1.5 },
    body2: { fontSize: "0.8125rem", lineHeight: 1.4 },
    caption: { fontSize: "0.75rem", color: "#9999B3" },
    h6: { fontSize: "0.9375rem", fontWeight: 600 },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 32px rgba(0,0,0,0.40)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});
