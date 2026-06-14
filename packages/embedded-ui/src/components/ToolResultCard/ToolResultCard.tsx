import React from "react";
import type { RuntimeActionResult } from "../../sdk/ipanda.types";
import { useCardRenderer } from "../../context/CardRendererContext";
import { GenericDataCard } from "./renderers/GenericDataCard";
import { LeaveBalanceCard } from "./renderers/LeaveBalanceCard";
import { EmployeeCard } from "./renderers/EmployeeCard";
import { LeaveRequestCard } from "./renderers/LeaveRequestCard";
import { AssetCard } from "./renderers/AssetCard";
import { TicketCard } from "./renderers/TicketCard";
import { TicketListCard } from "./renderers/TicketListCard";
import type { CardRendererMap } from "../../sdk/ipanda.types";

export const BUILTIN_RENDERERS: CardRendererMap = {
  "hr.get-leave-balance": LeaveBalanceCard as CardRendererMap[string],
  "hr.get-employee-details": EmployeeCard as CardRendererMap[string],
  "hr.create-leave-request": LeaveRequestCard as CardRendererMap[string],
  "assets.get-employee-assets": AssetCard as CardRendererMap[string],
  "itdesk.create-ticket": TicketCard as CardRendererMap[string],
  "itdesk.list-tickets": TicketListCard as CardRendererMap[string],
};

interface ToolResultCardProps {
  action: RuntimeActionResult;
}

const ToolResultCardInner: React.FC<ToolResultCardProps> = ({ action }) => {
  const toolId = action.toolId ?? "";
  const Renderer = useCardRenderer(toolId);
  const FallbackRenderer = Renderer ?? GenericDataCard;

  return (
    <FallbackRenderer
      data={action.output}
      status={action.status}
    />
  );
};

export const ToolResultCard: React.FC<ToolResultCardProps> = ({ action }) => {
  if (!action.output) return null;
  return <ToolResultCardInner action={action} />;
};
