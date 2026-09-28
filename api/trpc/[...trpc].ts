import type { Request, Response } from "express";

export default async function handler(req: Request, res: Response) {
  try {
    const [{ default: express }, { createExpressMiddleware }] = await Promise.all([
      import("express"),
      import("@trpc/server/adapters/express"),
    ]);
    const [{ appRouter }, { createContext }] = await Promise.all([
      import("../../server/routers.js"),
      import("../../server/_core/context.js"),
    ]);

    const app = express();
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: true }));
    app.use("/", createExpressMiddleware({ router: appRouter, createContext }));

    if (req.url?.startsWith("/api/trpc")) {
      req.url = req.url.slice("/api/trpc".length) || "/";
    }
    return app(req, res);
  } catch (error) {
    console.error("[Vercel tRPC] Startup failed", error);
    return res.status(500).json({ error: "SERVER_INITIALIZATION_FAILED" });
  }
}
