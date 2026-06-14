import React from "react";
import { Box, keyframes } from "@mui/material";

const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40%            { transform: translateY(-5px); opacity: 1; }
`;

export const TypingIndicator: React.FC = () => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 0.5, py: 0.75 }}>
    {[0, 1, 2].map((i) => (
      <Box
        key={i}
        sx={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          bgcolor: "text.secondary",
          animation: `${bounce} 1.2s ease-in-out infinite`,
          animationDelay: `${i * 0.2}s`,
        }}
      />
    ))}
  </Box>
);
