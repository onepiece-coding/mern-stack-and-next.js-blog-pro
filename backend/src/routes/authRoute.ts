import { Router } from 'express';
import {
  registerUserCtrl,
  loginUserCtrl,
  logoutUserCtrl,
  verifyUserAccountCtrl,
} from '../controllers/authController.js';
import { verifyTokenAndOnlyUser } from '../middlewares/verifyToken.js';
import validateObjectIdParam from '../middlewares/validateObjectId.js';
import { validate } from '../middlewares/validate.js';
import {
  validateLoginUser,
  validateRegisterUser,
} from '../validations/userValidations.js';

const authRoutes = Router();

// /api/v1/auth/register
authRoutes.post('/register', validate(validateRegisterUser), registerUserCtrl);

// /api/v1/auth/login
authRoutes.post('/login', validate(validateLoginUser), loginUserCtrl);

// /api/v1/auth/logout
authRoutes.post(
  '/logout/:id',
  validateObjectIdParam('id'),
  verifyTokenAndOnlyUser,
  logoutUserCtrl,
);

// /api/v1/auth/:userId/verify/:token
authRoutes.get(
  '/:userId/verify/:token',
  validateObjectIdParam('userId'),
  verifyUserAccountCtrl,
);

export default authRoutes;
