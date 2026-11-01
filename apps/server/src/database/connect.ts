import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "../config/env.js";

export async function connectDatabase(uri = env.MONGODB_URI): Promise<void> {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
  const mongoUri = uri?.trim();

  if (!mongoUri) {
    throw new Error("MONGODB_URI must be configured before starting the API");
  }

  mongoose.connection.on("connected", () => {
    console.info("MongoDB connected");
  });

  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });

  await mongoose.connect(mongoUri);
}

export function registerDatabaseShutdown(): void {
  const shutdown = async (signal: NodeJS.Signals) => {
    console.info(`Received ${signal}; closing MongoDB connection`);
    await mongoose.disconnect();
    process.exit(0);
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}
