import { Readable } from "node:stream";
import { v2 as cloudinary } from "cloudinary";
import { fileTypeFromBuffer } from "file-type";
import { env } from "../../config/env.js";
import { AppError, ValidationError } from "../../errors/AppError.js";

export const MAX_COMPANY_LOGO_SIZE_BYTES = 5 * 1024 * 1024;

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function validateCompanyLogoBuffer(buffer: Buffer): Promise<void> {
  if (buffer.byteLength > MAX_COMPANY_LOGO_SIZE_BYTES) {
    throw new ValidationError("Company logo must be 5 MB or smaller");
  }

  const fileType = await fileTypeFromBuffer(buffer);
  if (!fileType || !allowedImageTypes.has(fileType.mime)) {
    throw new ValidationError("Company logo must be a JPEG, PNG, or WebP image");
  }
}

export async function uploadCompanyLogo(buffer: Buffer): Promise<{
  publicId: string;
  secureUrl: string;
  format: string;
  bytes: number;
}> {
  await validateCompanyLogoBuffer(buffer);

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
        folder: "relio/company-logos",
        resource_type: "image",
        allowed_formats: ["jpg", "png", "webp"],
        transformation: [{ width: 1200, height: 1200, crop: "limit" }],
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
