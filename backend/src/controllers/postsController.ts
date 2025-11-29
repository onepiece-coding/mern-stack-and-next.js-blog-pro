import { Request, Response } from 'express';
import asyncHandler from "express-async-handler";
import createError from "http-errors";
import Post from "../models/Post.js";
import {
  uploadBufferToCloudinary,
  removeImage,
} from "../utils/cloudinary.js";
import Comment from "../models/Comment.js";

interface MulterReq extends Request {
  file?: Express.Multer.File;
}

/**------------------------------------------------
 * @desc    Create New Post
 * @route  /api/posts
 * @method POST
 * @access private (only logged in user)
---------------------------------------------------*/
export const createPostCtrl = asyncHandler(async (req: MulterReq, res: Response) => {
  if (req.file) {
    const uploadRes = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'posts',
    });
    req.body.image = {
      url: uploadRes.secure_url,
      publicId: uploadRes.public_id,
    };
  }

  const post = await Post.create({
    title: req.body.title,
    description: req.body.description,
    user: req.user.id,
    category: req.body.category,
    image: req.body.image
  });

  res.status(201).json(post);
});

/**------------------------------------------------
 * @desc   Get All Posts
 * @route  /api/posts
 * @method GET
 * @access public
---------------------------------------------------*/
export const getAllPostsCtrl = asyncHandler(async (req: Request, res: Response) => {
  const POST_PER_PAGE = 4;
  const { pageNumber = 1, title = "", category = "" } = req.query;
  let query: any = {};

  // Title search using $text
  if (title) {
    query.$text = { $search: title };
  }

  // Filter by category (if provided)
  if (category) {
    query.category = category;
  }

  // Count total matching posts (without pagination)
  const totalPosts = await Post.countDocuments(query);

  let posts = await Post.find(query)
    .skip((+pageNumber - 1) * POST_PER_PAGE)
    .limit(POST_PER_PAGE)
    .sort({ createdAt: -1 })
    .populate("user", ["-password"]);

  res.status(200).json({
    posts,
    totalPages: Math.ceil(totalPosts / POST_PER_PAGE),
  });
});

/**------------------------------------------------
 * @desc    Get Post Count
 * @route  /api/posts/count
 * @method GET
 * @access public
---------------------------------------------------*/
export const getPostCountCtrl = asyncHandler(async (_req: Request, res: Response) => {
  const count = await Post.countDocuments();
  res.status(200).json(count);
});

/**------------------------------------------------
 * @desc    Get Single Post
 * @route  /api/posts/:id
 * @method GET
 * @access public
---------------------------------------------------*/
export const getSinglePostCtrl = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findById(req.params.id)
    .populate("user", ["-password"])
    .populate("comments");
  if (!post) {
    throw createError(404, "Post not found!");
  }
  res.status(200).json(post);
});

/**------------------------------------------------
 * @desc   Delete Post
 * @route  /api/posts/:id
 * @method DELETE
 * @access private (only admin or owner of the post)
---------------------------------------------------*/
export const deletePostCtrl = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw createError(404, "Post not found!");
  }

  if (req.user.isAdmin || req.user.id === post.user.toString()) {
    await Post.findByIdAndDelete(req.params.id);
    await removeImage(post.image.publicId);

    await Comment.deleteMany({ postId: post._id });

    res.status(200).json({
      message: "post has been deleted successsfully",
      postId: post._id,
    });
  } else {
    throw createError(403, "Access denied, forbidden!");
  }
});

/**------------------------------------------------
 * @desc   Update Post
 * @route  /api/posts/:id
 * @method PUT
 * @access private (only the owner of the post)
---------------------------------------------------*/
export const updatePostCtrl = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw createError(404, "Post not found!");
  }

  if (req.user.id !== post.user.toString()) {
    throw createError(403, "Access denied, you are not allowed!");
  }

  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
      },
    },
    { new: true }
  ).populate("user", ["-password"])
  .populate("comments");

  res.status(200).json(updatedPost);
});

/**------------------------------------------------
 * @desc   Update Post Image
 * @route  /api/posts/update-image/:id
 * @method PUT
 * @access private (only the owner of the post)
---------------------------------------------------*/
export const updatePostImageCtrl = asyncHandler(async (req: MulterReq, res: Response) => {
  let image: {
    url: string;
    publicId: string;
  }
  if (!req.file) {
    throw createError(400, "No image provided!");
  } else {
    const uploadRes = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'posts',
    });
    image = {
      url: uploadRes.secure_url,
      publicId: uploadRes.public_id,
    };
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    throw createError(404, "Post not found!");
  }

  if (req.user.id !== post.user.toString()) {
    throw createError(403, "Access denied, you are not allowed!");
  }

  await removeImage(post.image.publicId);

  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        image
      },
    },
    { new: true }
  );

  res.status(200).json(updatedPost);
});

/**------------------------------------------------
 * @desc   Toggle Like
 * @route  /api/posts/like/:id
 * @method PUT
 * @access private (only the logged in user)
---------------------------------------------------*/
export const toggleLikeCtrl = asyncHandler(async (req: Request, res: Response) => {
  const loggedInUser = req.user.id;
  const { id: postId } = req.params;
  let post = await Post.findById(postId);
  if (!post) {
    throw createError(404, "Post not found!");
  }

  const isPostAlreadyLiked = post.likes.find(
    (user) => user.toString() === loggedInUser
  );

  if (isPostAlreadyLiked) {
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: loggedInUser },
      },
      { new: true }
    );
  } else {
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { likes: loggedInUser },
      },
      { new: true }
    );
  }

  res.status(200).json(post);
});
