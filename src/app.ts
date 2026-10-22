import "reflect-metadata";
import path from "path";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./config/database";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.disable("x-powered-by");
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || false }));
app.use(express.json());

app.use("/api/v1", routes);

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use(express.static(path.resolve(__dirname, "../web/dist")));

app.get("/api", (_req, res) =>
  res.json({
    name: "CampusLab API",
    version: "1.0.0",
    endpoints: {
      users: "/api/v1/users",
      products: "/api/v1/products",
      catalogs: "/api/v1/catalogs",
      loans: "/api/v1/loans",
      health: "/health",
      ready: "/ready",
    },
  }),
);
app.get("/ready", async (_req, res) => {
  try {
    await AppDataSource.query("SELECT 1");
    res.json({ status: "ready" });
  } catch {
    res.status(503).json({ status: "unavailable" });
  }
});
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});
app.use(errorHandler);

export default app;
