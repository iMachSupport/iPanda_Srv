import { z } from "zod";

const RuntimeOptionsSchema = z
  .object({
    allowKnowledgeRetrieval: z.boolean().optional(),
    allowToolExecution: z.boolean().optional(),
    allowMemoryWrites: z.boolean().optional(),
    preferredModel: z.string().min(1).optional(),
    trace: z.boolean().optional()
  })
  .strict();

export const ExecuteAgentRuntimeRequestSchema = z
  .object({
    id: z.string().uuid().optional(),
    message: z.string().min(1).optional(),
    input: z
      .object({
        message: z.string().min(1),
        metadata: z.record(z.unknown()).optional()
      })
      .strict()
      .optional(),
    options: RuntimeOptionsSchema.optional()
  })
  .strict()
  .refine((value) => Boolean(value.message ?? value.input?.message), {
    message: "Either message or input.message is required",
    path: ["message"]
  });

export type ExecuteAgentRuntimeRequestBody = z.infer<typeof ExecuteAgentRuntimeRequestSchema>;
