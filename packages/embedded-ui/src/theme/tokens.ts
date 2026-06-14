export const tokens = {
  panelWidth: 400,
  panelMinHeight: 500,
  fabSize: 56,
  fabBottomOffset: 24,
  fabRightOffset: 24,
  headerHeight: 56,
  inputMinHeight: 56,
  borderRadius: {
    panel: 12,
    bubble: 16,
    card: 10,
    fab: "50%",
    chip: 20,
  },
  spacing: {
    panelPadding: 16,
    bubbleGap: 8,
    messageGap: 12,
  },
  zIndex: {
    fab: 1300,
    panel: 1400,
  },
  transition: {
    panel: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;
