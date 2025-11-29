How to use in a route/controller

import { singleImage } from '../middleware/photoUpload.js';

// In your route:
router.post('/upload', singleImage('image'), async (req, res, next) => {
  // req.file is typed by multer (but Express types are permissive)
  const file = req.file;
  if (!file) return res.status(400).json({ message: 'No image provided' });
  // pass file.buffer to cloudinary uploader helper (below)
});