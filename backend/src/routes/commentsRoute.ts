import { Router } from 'express';
import {
  createCommentCtrl,
  getAllCommentsCtrl,
  deleteCommentCtrl,
  updateCommentCtrl,
} from '../controllers/commentsController.js';
import validateObjectIdParam from '../middlewares/validateObjectId.js';
import {
  verifyToken,
  verifyTokenAndAdmin,
} from '../middlewares/verifyToken.js';
import { validate } from '../middlewares/validate.js';
import {
  validateCreateComment,
  validateUpdateComment,
} from '../validations/commentValidations.js';

const commentsRoutes = Router();

// /api/v1/comments
commentsRoutes
  .route('/')
  .post(verifyToken, validate(validateCreateComment), createCommentCtrl)
  .get(verifyTokenAndAdmin, getAllCommentsCtrl);

// /api/v1/comments/:id
commentsRoutes
  .route('/:id')
  .all(validateObjectIdParam('id'))
  .delete(verifyToken, deleteCommentCtrl)
  .patch(verifyToken, validate(validateUpdateComment), updateCommentCtrl);

export default commentsRoutes;
