import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import express, { type ErrorRequestHandler } from "express";
import { it } from "node:test";
import {
  parseCompanyLogoUpload,
  validateUploadedCompanyLogo,
} from "./company-logo-upload.js";

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC",
  "base64",
);

async function postLogo(fieldName: string) {
  const app = express();
  app.post(
    "/logo",
    parseCompanyLogoUpload,
    validateUploadedCompanyLogo,
    (request, response) => {
      response.json({ fieldName: request.file?.fieldname });
    },
  );
  const handleUploadError: ErrorRequestHandler = (error, _request, response, _next) => {
    void _next;
    response.status(400).json({ message: (error as Error).message });
  };
  app.use(handleUploadError);

  const server = createServer(app);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  try {
    const address = server.address() as AddressInfo;
    const form = new FormData();
    form.append(fieldName, new Blob([new Uint8Array(png)]), "logo.png");
    const response = await fetch(`http://127.0.0.1:${address.port}/logo`, {
      method: "POST",
      body: form,
    });
    return {
      status: response.status,
      body: (await response.json()) as { fieldName?: string; message?: string },
    };
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

it("accepts a company logo in the logo multipart field", async () => {
  const result = await postLogo("logo");
  assert.equal(result.status, 200);
  assert.equal(result.body.fieldName, "logo");
});

it("rejects unexpected multipart field names", async () => {
  const result = await postLogo("file");
  assert.equal(result.status, 400);
  assert.equal(result.body.message, "Unexpected file field");
});
