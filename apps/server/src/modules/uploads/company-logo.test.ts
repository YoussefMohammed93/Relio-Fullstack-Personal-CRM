import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ValidationError } from "../../errors/AppError.js";
import {
  MAX_COMPANY_LOGO_SIZE_BYTES,
  validateCompanyLogoBuffer,
  validateUserAvatarBuffer,
} from "./company-logo.js";

describe("company logo upload validation", () => {
  it("accepts PNG data based on its file signature", async () => {
    const pngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC",
      "base64",
    );

    await assert.doesNotReject(() => validateCompanyLogoBuffer(pngBuffer));
  });

  it("rejects files that exceed the upload limit", async () => {
    const oversizedBuffer = Buffer.alloc(MAX_COMPANY_LOGO_SIZE_BYTES + 1);

    await assert.rejects(
      () => validateCompanyLogoBuffer(oversizedBuffer),
      ValidationError,
    );
  });

  it("rejects non-image data even when the caller labels it as an image", async () => {
    const textBuffer = Buffer.from("not an image");

    await assert.rejects(() => validateCompanyLogoBuffer(textBuffer), ValidationError);
  });

  it("uses the same signature and size checks for profile avatars", async () => {
    const pngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAADUlEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC",
      "base64",
    );

    await assert.doesNotReject(() => validateUserAvatarBuffer(pngBuffer));
    await assert.rejects(
      () => validateUserAvatarBuffer(Buffer.alloc(MAX_COMPANY_LOGO_SIZE_BYTES + 1)),
      ValidationError,
    );
  });
});
