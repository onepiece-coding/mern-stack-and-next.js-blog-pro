import { Router } from 'express';
import { getAllUsersCtrl,
  getUserProfileCtrl,
  updateUserProfileCtrl,
  getUsersCountCtrl,
  profilePhotoUploadCtrl,
  deleteUserProfileCtrl,
  getMe
} from "../controllers/usersController.js";
import { verifyTokenAndAdmin, verifyTokenAndOnlyUser, verifyToken, verifyTokenAndAuthorization } from "../middlewares/verifyToken.js";
import validateObjectIdParam from "../middlewares/validateObjectId.js";
import { singleImage } from "../middlewares/photoUpload.js";
import { validate } from '../middlewares/validate.js';
import { validateUpdateUser } from '../validations/userValidations.js';

const usersRoutes = Router();

// /api/users/profile
usersRoutes.route("/profile").get(verifyTokenAndAdmin, getAllUsersCtrl);

// api/users/profile/:id
usersRoutes
  .route("/profile/:id")
  .all(validateObjectIdParam("id"))
  .get(getUserProfileCtrl)
  .patch(verifyTokenAndOnlyUser, validate(validateUpdateUser), updateUserProfileCtrl)
  .delete(verifyTokenAndAuthorization, deleteUserProfileCtrl);

// /api/users/me
usersRoutes.get("/me", verifyToken, getMe);

// /api/users/profile/profile-photo-upload
usersRoutes
  .route("/profile/profile-photo-upload")
  .post(verifyToken, singleImage("image"), profilePhotoUploadCtrl);

// /api/users/count
usersRoutes.route("/count").get(verifyTokenAndAdmin, getUsersCountCtrl);

export default usersRoutes;
