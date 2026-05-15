export const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_UPLOAD_MB = 10;
export const IMAGE_TOO_LARGE_MESSAGE =
  "Image is too large. Please upload an image under 10 MB.";
export const UNSUPPORTED_IMAGE_MESSAGE =
  "Image must be a JPG, JPEG, PNG, or WEBP file.";
export const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];
export const ACCEPTED_IMAGE_INPUT =
  "image/jpeg,image/jpg,image/png,image/webp";

export function validateImageFile(file) {
  if (!file) {
    return null;
  }

  if (!ACCEPTED_IMAGE_MIME_TYPES.includes(file.type)) {
    return UNSUPPORTED_IMAGE_MESSAGE;
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return IMAGE_TOO_LARGE_MESSAGE;
  }

  return null;
}
