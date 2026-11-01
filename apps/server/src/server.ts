import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase, registerDatabaseShutdown } from "./database/connect.js";

import dns from "dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

registerDatabaseShutdown();

void (async () => {
  try {
    await connectDatabase();
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exitCode = 1;
  }

  app.listen(env.PORT, () => {
    console.info(`Relio API listening on http://localhost:${env.PORT}`);
  });
})();
