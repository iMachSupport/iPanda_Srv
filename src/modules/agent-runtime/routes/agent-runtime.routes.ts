import { randomUUID } from "crypto";
import { Router } from "express";
import type { ApplicationContainer } from "../../../composition/container";
import { getRequiredAuthContext } from "../../../shared/auth/auth-context";
import { asyncHandler } from "../../../shared/http/async-handler";
import { notImplemented } from "../../../shared/http/not-implemented";
import { AGENT_RUNTIME_API } from "../contracts/agent-runtime-api.contracts";
import {
  ExecuteAgentRuntimeRequestSchema,
  type ExecuteAgentRuntimeRequestBody
} from "../contracts/agent-runtime-api.validation";
import type { RuntimeOptions, RuntimeRequest } from "../contracts/runtime.types";

export const createAgentRuntimeRouter = () => {
  const router = Router();

  router.post(
    AGENT_RUNTIME_API.execute.path,
    asyncHandler(async (req, res) => {
      const container = req.app.locals.container as ApplicationContainer;
      const auth = getRequiredAuthContext(req);
      const body = ExecuteAgentRuntimeRequestSchema.parse(req.body);
      const runtimeRequest = toRuntimeRequest(body, auth);
      const response = await container.agentRuntime.execute(runtimeRequest);

      res.status(200).json(response);
    })
  );
  router.get(AGENT_RUNTIME_API.getContext.path, notImplemented("Agent Runtime context retrieval"));
  router.get(
    AGENT_RUNTIME_API.getContextSnapshot.path,
    notImplemented("Agent Runtime context snapshot retrieval")
  );

  return router;
};

const toRuntimeRequest = (
  body: ExecuteAgentRuntimeRequestBody,
  auth: ReturnType<typeof getRequiredAuthContext>
): RuntimeRequest => {
  return {
    id: body.id ?? auth.correlationId ?? randomUUID(),
    identity: {
      tenantId: auth.tenantId,
      userId: auth.userId,
      sessionId: auth.sessionId,
      callerToken: auth.callerToken,
    },
    input: {
      message: body.input?.message ?? body.message ?? "",
      metadata: body.input?.metadata
    },
    options: toRuntimeOptions(body.options)
  };
};

const toRuntimeOptions = (value: unknown): RuntimeOptions | undefined => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const options = value as RuntimeOptions;

  return {
    allowKnowledgeRetrieval: options.allowKnowledgeRetrieval,
    allowToolExecution: options.allowToolExecution,
    allowMemoryWrites: options.allowMemoryWrites,
    preferredModel: options.preferredModel,
    trace: options.trace
  };
};
