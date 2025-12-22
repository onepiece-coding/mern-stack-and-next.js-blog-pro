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
  options?: { folder?: string; public_id?: string },
  cloudinaryClient = cloudinary,
  uploaderFactory: (opts: any, cb: (err?: UploadApiErrorResponse, res?: UploadApiResponse) => void) => NodeJS.WritableStream = cloudinaryClient.uploader.upload_stream.bind(cloudinaryClient.uploader),
): Promise<UploadApiResponse> => {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = uploaderFactory(
      {
        folder: options?.folder,
        public_id: options?.public_id,
        resource_type: 'auto',
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Empty response from Cloudinary'));
        resolve(result);
      },
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export const removeImage = async (publicId: string, client = cloudinary) => {
  try {
    const result = await client.uploader.destroy(publicId);
    return result;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    throw new Error('Internal Server Error (cloudinary removeImage)');
  }
};

export const removeMultipleImages = async (publicIds: string[], client = cloudinary) => {
  try {
    const result = await client.api.delete_resources(publicIds);
    return result;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    throw new Error('Internal Server Error (cloudinary removeMultipleImages)');
  }
};

export default {
  uploadBufferToCloudinary,
  removeImage,
  removeMultipleImages,
};