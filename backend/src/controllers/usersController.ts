import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import createError from 'http-errors';
import { z } from 'zod';
import xss from 'xss';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import {
  uploadBufferToCloudinary,
  removeImage,
  removeMultipleImages,
} from '../utils/cloudinary.js';

interface MulterReq extends Request {
  file?: Express.Multer.File;
}

// query schema for get all users
const getUsersQuerySchema = z.object({
  pageNumber: z.preprocess((val) => {
    const s = Array.isArray(val) ? val[0] : (val ?? '1');
    const n = Number(s);
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
  }, z.number().int().min(1).default(1)),
  username: z.preprocess((val) => {
    const s = Array.isArray(val) ? val[0] : val;
    if (typeof s !== 'string' || s.trim() === '') return '';
    return xss(s.trim());
  }, z.string().optional().default('')),
});

/**------------------------------------
 * @desc   Get All Users Profile
 * @route  /api/v1/users/profile
 * @method GET
 * @access private (only admin)
---------------------------------------*/
export const getAllUsersCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = getUsersQuerySchema.safeParse(req.query);
    if (!parsed.success) throw createError(400, 'Invalid query parameters');
    const { username, pageNumber } = parsed.data;

    const USER_PER_PAGE = 10;
    const skip = (pageNumber - 1) * USER_PER_PAGE;

    const query: Record<string, any> = {};

    // Filter by category (if provided)
    if (username && username.length > 0) {
      query.username = username;
    }

    // Count total matching posts (without pagination)
    const totalUsers = await User.countDocuments(query);

    const users = await User.find(query)
      .skip(skip)
      .limit(USER_PER_PAGE)
      .sort({ createdAt: -1 })
      .populate('posts')
      .select('-password -__v');

    res.status(200).json({
      users,
      totalPages: Math.ceil(totalUsers / USER_PER_PAGE),
    });
  },
);

/**------------------------------------
 * @desc   Get User Profile
 * @route  /api/v1/users/profile/:id
 * @method GET
 * @access public
---------------------------------------*/
export const getUserProfileCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('posts');
    if (!user) {
      throw createError(404, 'User not found!');
    }

    res.status(200).json(user);
  },
);

/**----------------------------------
 * @desc   Get Current Logged-in User
 * @route  /api/v1/users/profile/me
 * @method GET
 * @access private (only user himself)
-------------------------------------*/
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const me = await User.findById(req.user.id);
  if (!me) {
    throw createError(401, 'Please login first!');
  }

  res.status(200).json({
    status: true,
    result: me,
  });
});

/**------------------------------------
 * @desc   Update User Profile
 * @route  /api/v1/users/profile/:id
 * @method PUT
 * @access private (only user himself)
---------------------------------------*/
export const updateUserProfileCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const updates: Partial<Record<string, any>> = {};
    if (req.body.password) updates.password = req.body.password;
    if (req.body.username) updates.username = req.body.username;
    if (req.body.bio) updates.bio = req.body.bio;

    if (Object.keys(updates).length === 0) {
      throw createError(400, 'Nothing to update');
    }

    Object.assign(user, updates);
    await user.save();

    user.password = undefined!;

    res.status(200).json(user);
  },
);

/**------------------------------------
 * @desc   Get Users Count
 * @route  /api/v1/users/count
 * @method GET
 * @access private (only admin)
---------------------------------------*/
export const getUsersCountCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const count = await User.countDocuments();
    res.status(200).json(count);
  },
);

/**---------------------------------------------------
 * @desc    Profile Photo Upload
 * @route  /api/v1/users/profile/profile-photo-upload
 * @method POST
 * @access private (only logged in user)
------------------------------------------------------*/
export const profilePhotoUploadCtrl = asyncHandler(
  async (req: MulterReq, res: Response) => {
    let profilePhoto: {
      url: string;
      publicId: string;
    };

    if (!req.file) {
      throw createError(400, 'No image provided!');
    } else {
      const uploadRes = await uploadBufferToCloudinary(req.file.buffer, {
        folder: 'users',
      });
      profilePhoto = {
        url: uploadRes.secure_url,
        publicId: uploadRes.public_id,
      };
    }

    const user = await User.findById(req.user.id);

    if (user.profilePhoto.publicId !== null) {
      await removeImage(user.profilePhoto.publicId);
    }

    user.profilePhoto = profilePhoto;

    await user.save();

    res.status(200).json({
      message: 'your profile photo uploaded successfully',
      profilePhoto,
    });
  },
);

/**------------------------------------------------
 * @desc    Delete User's Profile (Account)
 * @route  /api/v1/users/profile/:id
 * @method DELETE
 * @access private (only admin or user himself)
---------------------------------------------------*/
export const deleteUserProfileCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw createError(404, 'User not found!');
    }

    const posts = await Post.find({ user: user._id });
    const publicIds = posts?.map((post) => post.image.publicId);
    if (publicIds?.length > 0) {
      await removeMultipleImages(publicIds);
    }

    if (user.profilePhoto.publicId !== null)
      await removeImage(user.profilePhoto.publicId);

    // Delete User Posts And Comments
    await Post.deleteMany({ user: user._id });
    await Comment.deleteMany({ user: user._id });

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Your profile has been deleted' });
  },
);
