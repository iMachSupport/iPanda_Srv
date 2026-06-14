import type { RequestHandler } from "express";

export const notImplemented =
  (capability: string): RequestHandler =>
  (_req, res) => {
    res.status(501).json({
      error: {
        code: "NOT_IMPLEMENTED",
        message: `${capability} contract is defined, but implementation is pending.`
      }
    });
  };
