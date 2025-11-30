import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Comment from '../models/Comment.js';

/**
 * @desc   Get All Info
 * @route  api/v1/admin/info
 * @method GET
 * @access private(admin)
 */
export const getAllInfo = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find({});
  const posts = await Post.find({});
  const categories = await Category.find({});
  const comments = await Comment.find({});

  res.status(200).json({
    users: users?.length || 0,
    posts: posts?.length || 0,
    categories: categories?.length || 0,
    comments: comments?.length || 0,
  });
});
