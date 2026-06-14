import React, { useState, useRef, useCallback, KeyboardEvent } from "react";
import { Box, IconButton, TextField, Tooltip } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { tokens } from "../../theme/tokens";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSubmit,
  disabled = false,
  placeholder = "Ask me anything...",
}) => {
  const [value, setValue] = useState("");
  const textFieldRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue("");
    textFieldRef.current?.focus();
  }, [value, disabled, onSubmit]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-end",
        gap: 1,
        px: 1.5,
        py: 1.5,
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        flexShrink: 0,
        minHeight: tokens.inputMinHeight,
      }}
    >
      <TextField
        inputRef={textFieldRef}
        fullWidth
        multiline
        maxRows={5}
        size="small"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        variant="outlined"
        aria-label="Message input"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 3,
            fontSize: "0.875rem",
            "& fieldset": { borderColor: "divider" },
          },
        }}
      />
      <Tooltip title="Send (Enter)">
        <span>
          <IconButton
            color="primary"
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
            aria-label="Send message"
            sx={{
              width: 38,
              height: 38,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              flexShrink: 0,
              mb: 0.25,
              "&:hover": { bgcolor: "primary.dark" },
              "&.Mui-disabled": { bgcolor: "action.disabledBackground" },
            }}
          >
            <SendIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};
