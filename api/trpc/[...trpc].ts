import express from "express";
import type { Request, Response } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
  "/",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default function handler(req: Request, res: Response) {
  // Vercel may preserve the function prefix in req.url. The tRPC adapter
  // expects the procedure path relative to /api/trpc.
  if (req.url?.startsWith("/api/trpc")) {
    req.url = req.url.slice("/api/trpc".length) || "/";
  }
  return app(req, res);
}
