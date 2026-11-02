import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { describe, it } from "node:test";
import { app } from "../../app.js";
import {
  changePasswordSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from "./auth.schemas.js";
import { hashPassword, hashResetToken, verifyPassword } from "./auth.tokens.js";

describe("authentication security primitives", () => {
  it("hashes passwords with unique salts and verifies them safely", async () => {
    const firstHash = await hashPassword("correct horse battery staple");
    const secondHash = await hashPassword("correct horse battery staple");

    assert.match(firstHash, /^scrypt\$16384\$8\$1\$/);
    assert.notEqual(firstHash, secondHash);
    assert.equal(await verifyPassword("correct horse battery staple", firstHash), true);
    assert.equal(await verifyPassword("incorrect password", firstHash), false);
    assert.equal(await verifyPassword("anything", "not-a-hash"), false);
  });

  it("stores password-reset tokens only as one-way hashes", () => {
    const token = "reset-token-value";
    const hash = hashResetToken(token);

    assert.notEqual(hash, token);
    assert.equal(hash.length, 64);
    assert.equal(hashResetToken(token), hash);
  });
});

describe("authentication request contracts", () => {
  it("normalizes registration identity and enforces password length", () => {
    const result = registerSchema.safeParse({
      username: "  Freelancer  ",
      email: "  USER@Example.com  ",
      password: "long-enough-password",
    });

    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.username, "Freelancer");
      assert.equal(result.data.email, "user@example.com");
    }
    assert.equal(
      registerSchema.safeParse({
        username: "ab",
        email: "user@example.com",
        password: "short",
      }).success,
      false,
    );
  });

  it("rejects email edits and non-USD currency preferences", () => {
    assert.equal(
      updateProfileSchema.safeParse({ email: "new@example.com" }).success,
      false,
    );
    assert.equal(
      updateProfileSchema.safeParse({ defaultCurrency: "EUR" }).success,
      false,
    );
    assert.equal(
      updateProfileSchema.safeParse({ defaultCurrency: "USD" }).success,
      true,
    );
  });

  it("requires reset tokens and validates password-change fields", () => {
    assert.equal(
      resetPasswordSchema.safeParse({
        token: "too-short",
        password: "long-enough-password",
      }).success,
      false,
    );
    assert.equal(
      changePasswordSchema.safeParse({
        currentPassword: "current-password",
        newPassword: "new-password-long",
      }).success,
      true,
    );
  });
});

describe("authentication API boundary", () => {
  it("validates registration and rejects unauthenticated current-user requests", async () => {
    const server = createServer(app);
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });

    try {
      const address = server.address() as AddressInfo;
      const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
      const [
        registrationResponse,
        currentUserResponse,
        profileUpdateResponse,
        passwordChangeResponse,
        accountDeletionResponse,
        uploadResponse,
        avatarUploadResponse,
        logoutResponse,
      ] = await Promise.all([
        fetch(`${baseUrl}/auth/register`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            username: "ab",
            email: "invalid",
            password: "short",
          }),
        }),
        fetch(`${baseUrl}/users/me`),
        fetch(`${baseUrl}/users/me`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ username: "Updated" }),
        }),
        fetch(`${baseUrl}/users/me/password`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            currentPassword: "current-password",
            newPassword: "new-password-long",
          }),
        }),
        fetch(`${baseUrl}/users/me`, {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ password: "current-password" }),
        }),
        fetch(`${baseUrl}/uploads/company-logo`, { method: "POST" }),
        fetch(`${baseUrl}/uploads/avatar`, { method: "POST" }),
        fetch(`${baseUrl}/auth/logout`, { method: "POST" }),
      ]);

      assert.equal(registrationResponse.status, 400);
      assert.equal(currentUserResponse.status, 401);
      assert.equal(profileUpdateResponse.status, 401);
      assert.equal(passwordChangeResponse.status, 401);
      assert.equal(accountDeletionResponse.status, 401);
      assert.equal(uploadResponse.status, 401);
      assert.equal(avatarUploadResponse.status, 401);
      assert.equal(logoutResponse.status, 200);
      assert.match(logoutResponse.headers.get("set-cookie") ?? "", /relio_session=;/);
    } finally {
      server.closeAllConnections();
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });
});
