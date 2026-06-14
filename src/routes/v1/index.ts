import { Router } from "express";
import { createAgentRuntimeRouter } from "../../modules/agent-runtime/routes/agent-runtime.routes";

export const createV1Router = () => {
  const router = Router();

  router.use("/agent-runtime", createAgentRuntimeRouter());

  return router;
};
