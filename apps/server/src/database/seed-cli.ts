import mongoose from "mongoose";

import { env } from "../config/env.js";
import { connectDatabase } from "./connect.js";
import { assertDevelopmentSeedEnvironment, seedDevelopmentData } from "./seed.js";

async function main(): Promise<void> {
  assertDevelopmentSeedEnvironment(env.NODE_ENV);
  await connectDatabase();

  try {
    await seedDevelopmentData(env.NODE_ENV);
  } finally {
    await mongoose.disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error("Development database seed failed:", error);
  process.exitCode = 1;
});
