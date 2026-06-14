import React from "react";
import { Box, LinearProgress, Typography } from "@mui/material";
import { useExecutionStore } from "../../store/execution.store";

export const ExecutionStatus: React.FC = () => {
  const { status, currentOperation } = useExecutionStore();

  if (status !== "executing") return null;

  return (
    <Box sx={{ px: 2, py: 0.75, bgcolor: "background.default" }}>
      <LinearProgress
        variant="indeterminate"
        sx={{ borderRadius: 1, height: 2, mb: 0.5 }}
      />
      {currentOperation && (
        <Typography variant="caption" color="text.secondary">
          {currentOperation}
        </Typography>
      )}
    </Box>
  );
};
