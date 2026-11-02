import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { it } from "node:test";
import { env } from "../../config/env.js";
import { getJwtSecret } from "../../config/security.js";
import { connectDatabase } from "../../database/connect.js";
import { User } from "../../database/models/user.js";
import { app } from "../../app.js";
import { hashResetToken } from "./auth.tokens.js";

function sessionCookie(response: Response): string {
  const setCookie = response.headers.get("set-cookie");
  assert.ok(setCookie, "expected the response to set a session cookie");
  return setCookie.split(";", 1)[0]!;
}

async function postJson(
  url: string,
  body: unknown,
  cookie?: string,
): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

it(
  "covers authentication and account lifecycle routes against MongoDB",
  { skip: process.env.RELIO_AUTH_INTEGRATION !== "1" },
  async () => {
    assert.equal(env.NODE_ENV, "development");
    await connectDatabase();

    const token = randomUUID();
    const email = `relio-auth-${token}@example.test`;
    const username = `auth-${token.slice(0, 12)}`;
    const server = createServer(app);
    let accountId: string | undefined;
    let deletionUserId: string | undefined;

    try {
      await new Promise<void>((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", resolve);
      });
      const address = server.address() as AddressInfo;
      const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;

      const registration = await postJson(`${baseUrl}/auth/register`, {
        username,
        email,
        password: "initial-password-123",
      });
      assert.equal(registration.status, 201);
      const registrationBody = (await registration.json()) as {
        data: { id: string; email: string; defaultCurrency: string };
      };
      accountId = registrationBody.data.id;
      assert.equal(registrationBody.data.email, email);
      assert.equal(registrationBody.data.defaultCurrency, "USD");

      const registrationCookie = sessionCookie(registration);
      assert.match(registrationCookie, /^relio_session=/);
      assert.match(registration.headers.get("set-cookie") ?? "", /HttpOnly/i);
      assert.match(registration.headers.get("set-cookie") ?? "", /SameSite=Lax/i);
      assert.match(registration.headers.get("set-cookie") ?? "", /Path=\//i);

      const duplicateRegistration = await postJson(`${baseUrl}/auth/register`, {
        username: `${username}-duplicate`,
        email,
        password: "initial-password-123",
      });
      assert.equal(duplicateRegistration.status, 409);

      const invalidLogin = await postJson(`${baseUrl}/auth/login`, {
        email,
        password: "incorrect-password",
      });
      assert.equal(invalidLogin.status, 401);

      const restoredSession = await fetch(`${baseUrl}/users/me`, {
        headers: { cookie: registrationCookie },
      });
      assert.equal(restoredSession.status, 200);

      const profileUpdate = await fetch(`${baseUrl}/users/me`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          cookie: registrationCookie,
        },
        body: JSON.stringify({
          themePreference: "dark",
          notificationPreferences: { taskReminders: false },
          defaultCurrency: "USD",
        }),
      });
      assert.equal(profileUpdate.status, 200);
      const updatedProfile = (await profileUpdate.json()) as {
        data: {
          email: string;
          themePreference: string;
          notificationPreferences: { taskReminders: boolean; dealWon: boolean };
          defaultCurrency: string;
        };
      };
      assert.equal(updatedProfile.data.email, email);
      assert.equal(updatedProfile.data.themePreference, "dark");
      assert.equal(updatedProfile.data.notificationPreferences.taskReminders, false);
      assert.equal(updatedProfile.data.notificationPreferences.dealWon, true);
      assert.equal(updatedProfile.data.defaultCurrency, "USD");

      const emailChange = await fetch(`${baseUrl}/users/me`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          cookie: registrationCookie,
        },
        body: JSON.stringify({ email: `changed-${email}` }),
      });
      assert.equal(emailChange.status, 400);

      const currencyChange = await fetch(`${baseUrl}/users/me`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          cookie: registrationCookie,
        },
        body: JSON.stringify({ defaultCurrency: "EUR" }),
      });
      assert.equal(currencyChange.status, 400);

      const forgotPassword = await postJson(`${baseUrl}/auth/forgot-password`, {
        email: `missing-${email}`,
      });
      assert.equal(forgotPassword.status, env.SMTP_HOST ? 202 : 503);

      const resetToken = `${randomUUID()}${randomUUID()}`;
      await User.updateOne(
        { _id: accountId },
        {
          $set: {
            passwordResetTokenHash: hashResetToken(resetToken),
            passwordResetExpiresAt: new Date(Date.now() + 60_000),
          },
        },
      );
      const passwordReset = await postJson(`${baseUrl}/auth/reset-password`, {
        token: resetToken,
        password: "reset-password-456",
      });
      assert.equal(passwordReset.status, 200);

      const reusedResetToken = await postJson(`${baseUrl}/auth/reset-password`, {
        token: resetToken,
        password: "another-password-789",
      });
      assert.equal(reusedResetToken.status, 400);

      const revokedSession = await fetch(`${baseUrl}/users/me`, {
        headers: { cookie: registrationCookie },
      });
      assert.equal(revokedSession.status, 401);

      const successfulLogin = await postJson(`${baseUrl}/auth/login`, {
        email,
        password: "reset-password-456",
      });
      assert.equal(successfulLogin.status, 200);
      const loginCookie = sessionCookie(successfulLogin);

      const passwordChange = await fetch(`${baseUrl}/users/me/password`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          cookie: loginCookie,
        },
        body: JSON.stringify({
          currentPassword: "reset-password-456",
          newPassword: "changed-password-789",
        }),
      });
      assert.equal(passwordChange.status, 200);
      const changedPasswordCookie = sessionCookie(passwordChange);

      const sessionAfterPasswordChange = await fetch(`${baseUrl}/users/me`, {
        headers: { cookie: changedPasswordCookie },
      });
      assert.equal(sessionAfterPasswordChange.status, 200);
      const priorLoginSession = await fetch(`${baseUrl}/users/me`, {
        headers: { cookie: loginCookie },
      });
      assert.equal(priorLoginSession.status, 401);

      const expiredToken = jwt.sign({ sub: accountId, sv: 0 }, getJwtSecret(), {
        issuer: "relio",
        expiresIn: -1,
      });
      const expiredSession = await fetch(`${baseUrl}/users/me`, {
        headers: { cookie: `relio_session=${expiredToken}` },
      });
      assert.equal(expiredSession.status, 401);

      const unauthenticatedSession = await fetch(`${baseUrl}/users/me`);
      assert.equal(unauthenticatedSession.status, 401);

      const logout = await postJson(
        `${baseUrl}/auth/logout`,
        {},
        changedPasswordCookie,
      );
      assert.equal(logout.status, 200);
      assert.match(logout.headers.get("set-cookie") ?? "", /relio_session=;/);
      const loggedOutSession = await fetch(`${baseUrl}/users/me`, {
        headers: { cookie: changedPasswordCookie },
      });
      assert.equal(loggedOutSession.status, 401);

      const googleLogin = await postJson(`${baseUrl}/auth/google`, {
        credential: "invalid-id-token",
      });
      assert.equal(googleLogin.status, env.GOOGLE_CLIENT_ID ? 401 : 503);

      const deletionUser = await User.create({
        username: `delete-${token.slice(0, 12)}`,
        email: `relio-delete-${token}@example.test`,
      });
      deletionUserId = String(deletionUser._id);
      const deletionCookie = `relio_session=${jwt.sign(
        { sub: deletionUserId, sv: deletionUser.sessionVersion },
        getJwtSecret(),
        { issuer: "relio", expiresIn: "15m" },
      )}`;
      const accountDeletion = await fetch(`${baseUrl}/users/me`, {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
          cookie: deletionCookie,
        },
        body: JSON.stringify({ confirmEmail: deletionUser.email }),
      });
      assert.equal(accountDeletion.status, 200);
      assert.equal(await User.exists({ _id: deletionUserId }), null);
      const deletedAccountSession = await fetch(`${baseUrl}/users/me`, {
        headers: { cookie: deletionCookie },
      });
      assert.equal(deletedAccountSession.status, 401);
    } finally {
      server.closeAllConnections();
      if (server.listening) {
        await new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        });
      }
      if (accountId) await User.deleteOne({ _id: accountId });
      if (deletionUserId) await User.deleteOne({ _id: deletionUserId });
      await mongoose.disconnect();
    }
  },
);
