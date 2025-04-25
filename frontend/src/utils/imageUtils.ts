// utils/imageUtils.ts
import imageCompression from "browser-image-compression";

export const compressImage = (file: File) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  return imageCompression(file, options);
};
