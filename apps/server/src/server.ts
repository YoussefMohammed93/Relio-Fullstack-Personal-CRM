import { app } from "./app.js";
import { env } from "./config/env.js";
import { getJwtSecret } from "./config/security.js";
import { connectDatabase, registerDatabaseShutdown } from "./database/connect.js";

import dns from "dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

registerDatabaseShutdown();

void (async () => {
  try {
    getJwtSecret();
    await connectDatabase();
  } catch (error) {
    console.error("Failed to initialize Relio API:", error);
    process.exitCode = 1;
    return;
  }

  app.listen(env.PORT, () => {
    console.info(`Relio API listening on http://localhost:${env.PORT}`);
  });
})();
