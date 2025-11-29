import { Router } from 'express';
import { sendResetPasswordLinkCtrl,
  getResetPasswordLinkCtrl,
  resetPasswordCtrl
} from "../controllers/passwordController.js";
import validateObjectIdParam from '../middlewares/validateObjectId.js';
import { validate } from '../middlewares/validate.js';
import { validateEmail, validateNewPassword } from '../validations/userValidations.js';

const passwordRoutes = Router();

// /api/password/reset-password-link
passwordRoutes.post(
  "/reset-password-link",
  validate(validateEmail),
  sendResetPasswordLinkCtrl
);

// /api/password/reset-password/:userId/:token
passwordRoutes
  .route("/reset-password/:userId/:token")
  .all(validateObjectIdParam("userId"))
  .get(getResetPasswordLinkCtrl)
  .post(validate(validateNewPassword), resetPasswordCtrl);

export default passwordRoutes;