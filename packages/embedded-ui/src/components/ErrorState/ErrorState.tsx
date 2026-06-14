import React from "react";
import { Box, Button, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useExecutionStore } from "../../store/execution.store";

export const ErrorState: React.FC = () => {
  const { status, error, reset } = useExecutionStore();

  if (status !== "error") return null;

  return (
    <Box
      sx={{
        m: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: "error.light",
        color: "error.contrastText",
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
      role="alert"
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <ErrorOutlineIcon fontSize="small" />
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Something went wrong
        </Typography>
      </Box>
      {error && (
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          {error}
        </Typography>
      )}
      <Button
        size="small"
        variant="outlined"
        onClick={reset}
        sx={{
          alignSelf: "flex-start",
          color: "inherit",
          borderColor: "currentcolor",
          mt: 0.5,
          "&:hover": { borderColor: "currentcolor", bgcolor: "rgba(255,255,255,0.1)" },
        }}
      >
        Dismiss
      </Button>
    </Box>
  );
};
