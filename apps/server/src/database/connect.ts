import mongoose from "mongoose";
import { env } from "../config/env.js";

export async function connectDatabase(uri = env.MONGODB_URI): Promise<void> {
  if (!uri) {
    throw new Error("MONGODB_URI must be configured before connecting to MongoDB");
  }

  await mongoose.connect(uri);
}
