import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import createError from 'http-errors';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import Post from '../models/Post.js';

/**------------------------------------------------
 * @desc   Create New Comment
 * @route  /api/v1/comments
 * @method POST
 * @access private (only the logged in user)
---------------------------------------------------*/
export const createCommentCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    // Need to check if the post exists (Not in Coure)
    const post = await Post.findById(req.body.postId);
    if (!post) {
      throw createError(404, 'Post not found!');
    }

    const profile = await User.findById(req.user.id);

    const comment = await Comment.create({
      postId: req.body.postId,
      text: req.body.text,
      user: req.user.id,
      username: profile.username,
    });

    res.status(201).json(comment);
  },
);

/**------------------------------------------------
 * @desc   Get All Comments
 * @route  /api/v1/comments
 * @method GET
 * @access private (only admin)
---------------------------------------------------*/
export const getAllCommentsCtrl = asyncHandler(
  async (_req: Request, res: Response) => {
    const comments = await Comment.find().populate('user');

    res.status(200).json(comments);
  },
);

/**------------------------------------------------
 * @desc   Delete Comment
 * @route  /api/v1/comments
 * @method DELETE
 * @access private (only admin or owner of the comment)
---------------------------------------------------*/
export const deleteCommentCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      throw createError(404, 'Comment not found!');
    }

    if (req.user.isAdmin || req.user.id === comment.user.toString()) {
      await Comment.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'comment has been deleted' });
    } else {
      throw createError(403, 'Access denied, not aloowed!');
    }
  },
);

/**------------------------------------------------
 * @desc   Update Comment
 * @route  /api/v1/comments/:id
 * @method PUT
 * @access private (only owner of the comment)
---------------------------------------------------*/
export const updateCommentCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      throw createError(404, 'Comment not found!');
    }

    if (req.user.id !== comment.user.toString()) {
      throw createError(
        404,
        'Access denied, only user himself can edit his comment!',
      );
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          text: req.body.text,
        },
      },
      { new: true },
    );

    res.status(201).json(updatedComment);
  },
);
