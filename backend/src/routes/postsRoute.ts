import { Router } from 'express';
import {
  createPostCtrl,
  getAllPostsCtrl,
  getSinglePostCtrl,
  getPostCountCtrl,
  deletePostCtrl,
  updatePostCtrl,
  updatePostImageCtrl,
  toggleLikeCtrl,
} from '../controllers/postsController.js';
import { singleImage } from '../middlewares/photoUpload.js';
import { verifyToken, verifyTokenAndAdmin } from '../middlewares/verifyToken.js';
import validateObjectIdParam from '../middlewares/validateObjectId.js';
import { validate } from '../middlewares/validate.js';
import {
  validateCreatePost,
  validateUpdatePost,
} from '../validations/postValidations.js';

const postsRoutes = Router();

// /api/v1/posts
postsRoutes
  .route('/')
  .post(
    verifyToken,
    singleImage('image'),
    validate(validateCreatePost),
    createPostCtrl,
  )
  .get(getAllPostsCtrl);

// /api/v1/post/count
postsRoutes.route('/count').get(verifyTokenAndAdmin, getPostCountCtrl);

// /api/v1/post/:id
postsRoutes
  .route('/:id')
  .all(validateObjectIdParam('id'))
  .get(getSinglePostCtrl)
  .delete(verifyToken, deletePostCtrl)
  .patch(verifyToken, validate(validateUpdatePost), updatePostCtrl);

// /api/v1/post/update-image/:id
postsRoutes
  .route('/update-image/:id')
  .patch(
    validateObjectIdParam('id'),
    verifyToken,
    singleImage('image'),
    updatePostImageCtrl,
  );

// /api/v1/posts/like/:id
postsRoutes
  .route('/like/:id')
  .patch(validateObjectIdParam('id'), verifyToken, toggleLikeCtrl);

export default postsRoutes;
