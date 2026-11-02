import { Readable } from "node:stream";
import { v2 as cloudinary } from "cloudinary";
import { fileTypeFromBuffer } from "file-type";
import { env } from "../../config/env.js";
import { AppError, ValidationError } from "../../errors/AppError.js";

export const MAX_COMPANY_LOGO_SIZE_BYTES = 5 * 1024 * 1024;

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

async function validateImageBuffer(buffer: Buffer, description: string): Promise<void> {
  if (buffer.byteLength > MAX_COMPANY_LOGO_SIZE_BYTES) {
    throw new ValidationError(`${description} must be 5 MB or smaller`);
  }

  const fileType = await fileTypeFromBuffer(buffer);
  if (!fileType || !allowedImageTypes.has(fileType.mime)) {
    throw new ValidationError(`${description} must be a JPEG, PNG, or WebP image`);
  }
}

export function validateCompanyLogoBuffer(buffer: Buffer): Promise<void> {
  return validateImageBuffer(buffer, "Company logo");
}

export function validateUserAvatarBuffer(buffer: Buffer): Promise<void> {
  return validateImageBuffer(buffer, "Profile image");
}

interface ImageUploadOptions {
  folder: string;
  public_id?: string;
  overwrite?: boolean;
  invalidate?: boolean;
  transformation: Array<{
    width: number;
    height: number;
    crop: "limit" | "fill";
    gravity?: "auto";
  }>;
}

async function uploadImage(
  buffer: Buffer,
  options: ImageUploadOptions,
  description: string,
): Promise<{
  publicId: string;
  secureUrl: string;
  format: string;
  bytes: number;
}> {
  await validateImageBuffer(buffer, description);

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new AppError("Cloudinary storage is not configured", 503);
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        ...options,
        resource_type: "image",
        allowed_formats: ["jpg", "png", "webp"],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary did not return an upload result"));
          return;
        }

        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          format: result.format,
          bytes: result.bytes,
        });
      },
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}

export async function uploadCompanyLogo(buffer: Buffer) {
  return uploadImage(
    buffer,
    {
      folder: "relio/company-logos",
      transformation: [{ width: 1200, height: 1200, crop: "limit" }],
    },
    "Company logo",
  );
}

export async function uploadUserAvatar(buffer: Buffer, userId: string) {
  return uploadImage(
    buffer,
    {
      folder: "relio/user-avatars",
      public_id: userId,
      overwrite: true,
      invalidate: true,
      transformation: [{ width: 512, height: 512, crop: "fill", gravity: "auto" }],
    },
    "Profile image",
  );
}
