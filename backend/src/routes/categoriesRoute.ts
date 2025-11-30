import { Router } from 'express';
import {
  createCategoryCtrl,
  getAllCategoriesCtrl,
  deleteCategoryCtrl,
} from '../controllers/categoriesController.js';
import validateObjectIdParam from '../middlewares/validateObjectId.js';
import { verifyTokenAndAdmin } from '../middlewares/verifyToken.js';
import { validate } from '../middlewares/validate.js';
import { validateCreateCategory } from '../validations/categoryValidations.js';

const categoriesRoutes = Router();

// /api/v1/categories
categoriesRoutes
  .route('/')
  .post(
    verifyTokenAndAdmin,
    validate(validateCreateCategory),
    createCategoryCtrl,
  )
  .get(getAllCategoriesCtrl);

// /api/v1/categories/:id
categoriesRoutes
  .route('/:id')
  .delete(validateObjectIdParam('id'), verifyTokenAndAdmin, deleteCategoryCtrl);

export default categoriesRoutes;
