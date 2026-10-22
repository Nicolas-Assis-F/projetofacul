import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { AppDataSource } from "./config/database";

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully.");
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
    const shutdown = () => {
      const timeout = setTimeout(() => process.exit(1), 10000);
      timeout.unref();
      server.close(() => {
        AppDataSource.destroy().then(() => process.exit(0)).catch(() => process.exit(1));
      });
    };
    process.once("SIGTERM", shutdown);
    process.once("SIGINT", shutdown);
  })
  .catch((err: Error) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });
