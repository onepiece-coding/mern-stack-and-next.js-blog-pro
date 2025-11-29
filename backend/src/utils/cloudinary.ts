import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import streamifier from 'streamifier';
import { env } from '../env.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  options?: { folder?: string; public_id?: string }
): Promise<UploadApiResponse> => {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options?.folder,
        public_id: options?.public_id,
        resource_type: 'auto'
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          return reject(error);
        }
        if (!result) {
          return reject(new Error('Empty response from Cloudinary'));
        }
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export const removeImage = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (err) {
    throw new Error('Internal Server Error (cloudinary removeImage)');
  }
};

export const removeMultipleImages = async (publicIds: string[]) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (err) {
    throw new Error('Internal Server Error (cloudinary removeMultipleImages)');
  }
};

export default {
  uploadBufferToCloudinary,
  removeImage,
  removeMultipleImages
};