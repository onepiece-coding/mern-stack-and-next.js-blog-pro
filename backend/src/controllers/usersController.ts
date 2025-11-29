import { Request, Response } from 'express';
import asyncHandler from "express-async-handler";
import createError from "http-errors";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import {
  uploadBufferToCloudinary,
  removeImage,
  removeMultipleImages
} from "../utils/cloudinary.js";

interface MulterReq extends Request {
  file?: Express.Multer.File;
}

/**------------------------------------
 * @desc   Get All Users Profile
 * @route  /api/users/profile
 * @method GET
 * @access private (only admin)
---------------------------------------*/
export const getAllUsersCtrl = asyncHandler(async (req: Request, res: Response) => {
  const USER_PER_PAGE = 10;
  const { pageNumber = 1, username = "" } = req.query;
  let query: any = {};

  // Filter by category (if provided)
  if (username) {
    query.username = username;
  }

  // Count total matching posts (without pagination)
  const totalUsers = await User.countDocuments(query);

  const users = await User.find(query)
    .skip((+pageNumber - 1) * USER_PER_PAGE)
    .limit(USER_PER_PAGE)
    .sort({ createdAt: -1 })
    .populate("posts", ["-password"]);

  res.status(200).json({
    users,
    totalPages: Math.ceil(totalUsers / USER_PER_PAGE),
  });
});

/**------------------------------------
 * @desc   Get User Profile
 * @route  /api/users/profile/:id
 * @method GET
 * @access public
---------------------------------------*/
export const getUserProfileCtrl = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("posts");
  if (!user) {
    throw createError(404, "User not found!");
  }

  res.status(200).json(user);
});

/**----------------------------------
 * @desc   Get Current Logged-in User
 * @route  /api/users/profile/me
 * @method GET
 * @access private (only user himself)
-------------------------------------*/
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const me = await User.findById(req.user.id);
  if (!me) {
    throw createError(401, "Please login first!");
  }

  res.status(200).json({
    status: true,
    result: me,
  });
});

/**------------------------------------
 * @desc   Update User Profile
 * @route  /api/users/profile/:id
 * @method PUT
 * @access private (only user himself)
---------------------------------------*/
export const updateUserProfileCtrl = asyncHandler(async (req: Request, res: Response) => {
  const updates: Partial<Record<string, any>> = {};
  if (req.body.password) updates.password = req.body.password;
  if (req.body.username) updates.password = req.body.username;
  if (req.body.bio) updates.password = req.body.bio;

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: updates,
    },
    { new: true }
  ).select("-password");

  res.status(200).json(updatedUser);
});

/**------------------------------------
 * @desc   Get Users Count
 * @route  /api/users/count
 * @method GET
 * @access private (only admin)
---------------------------------------*/
export const getUsersCountCtrl = asyncHandler(async (req: Request, res: Response) => {
  const count = await User.countDocuments();
  res.status(200).json(count);
});

/**---------------------------------------------------
 * @desc    Profile Photo Upload
 * @route  /api/users/profile/profile-photo-upload
 * @method POST
 * @access private (only logged in user)
------------------------------------------------------*/
export const profilePhotoUploadCtrl = asyncHandler(async (req: MulterReq, res: Response) => {
  let profilePhoto: {
    url: string;
    publicId: string;
  }

  if (!req.file) {
    throw createError(400, "No image provided!");
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
    message: "your profile photo uploaded successfully",
    profilePhoto
  });
});

/**------------------------------------------------
 * @desc    Delete User's Profile (Account)
 * @route  /api/users/profile/:id
 * @method DELETE
 * @access private (only admin or user himself)
---------------------------------------------------*/
export const deleteUserProfileCtrl = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw createError(404, "User not found!");
  }

  const posts = await Post.find({ user: user._id });
  const publicIds = posts?.map((post) => post.image.publicId);
  if (publicIds?.length > 0) {
    await removeMultipleImages(publicIds);
  }

  await removeImage(user.profilePhoto.publicId);

  // Delete User Posts And Comments
  await Post.deleteMany({ user: user._id });
  await Comment.deleteMany({ user: user._id });

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({ message: "Your profile has been deleted" });
});
