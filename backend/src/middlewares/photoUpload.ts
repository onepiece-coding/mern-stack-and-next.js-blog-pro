import multer, { FileFilterCallback } from 'multer';
import type { Request } from 'express';

export const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const mimetype = file.mimetype ?? '';
  if (mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Only images are allowed.'));
  }
};

// Limit files to 1MB by default
export const DEFAULT_LIMITS = { fileSize: 1 * 1024 * 1024 };

export const photoUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFileFilter,
  limits: DEFAULT_LIMITS,
});

/**
 * Helpers for controllers:
 * - single(fieldName) -> middleware for single file
 * - multiple(fieldName, maxCount) -> middleware for multiple files
 */
export const singleImage = (fieldName = 'image') =>
  photoUpload.single(fieldName);
export const multipleImages = (fieldName = 'images', maxCount = 5) =>
  photoUpload.array(fieldName, maxCount);

export default {
  photoUpload,
  singleImage,
  multipleImages,
};
