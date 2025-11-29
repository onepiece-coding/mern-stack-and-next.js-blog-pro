import { Router } from 'express';
import { registerUserCtrl,
  loginUserCtrl,
  logoutUserCtrl,
  verifyUserAccountCtrl
} from "../controllers/authController.js";
import { verifyTokenAndOnlyUser } from "../middlewares/verifyToken.js";
import validateObjectIdParam from '../middlewares/validateObjectId.js';
import { validate } from '../middlewares/validate.js';
import { validateLoginUser, validateRegisterUser } from '../validations/userValidations.js';

const authRoutes = Router();

// /api/auth/register
authRoutes.post("/register", validate(validateRegisterUser), registerUserCtrl);

// /api/auth/login
authRoutes.post("/login", validate(validateLoginUser), loginUserCtrl);

// /api/auth/logout
authRoutes.post("/logout", verifyTokenAndOnlyUser, logoutUserCtrl);

// /api/auth/:userId/verify/:token
authRoutes.get("/:userId/verify/:token", validateObjectIdParam("userId"), verifyUserAccountCtrl);

export default authRoutes;
