import { Router } from 'express';
import { createPostCtrl,
      getAllPostsCtrl,
      getSinglePostCtrl,
      getPostCountCtrl,
      deletePostCtrl,
      updatePostCtrl,
      updatePostImageCtrl,
      toggleLikeCtrl
} from "../controllers/postsController.js";
import { singleImage } from "../middlewares/photoUpload.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import validateObjectIdParam from "../middlewares/validateObjectId.js";
import { validate } from '../middlewares/validate.js';
import { validateCreatePost, validateUpdatePost } from '../validations/postValidations.js';

const postsRoutes = Router();

// /api/posts
postsRoutes.route("/")
      .post(verifyToken, singleImage("image"), validate(validateCreatePost), createPostCtrl)
      .get(getAllPostsCtrl)

// /api/post/count
postsRoutes.route("/count").get(getPostCountCtrl);

// /api/post/:id
postsRoutes.route("/:id")
      .all(validateObjectIdParam("id"))
      .get(getSinglePostCtrl)
      .delete(verifyToken, deletePostCtrl)
      .patch(verifyToken, validate(validateUpdatePost), updatePostCtrl);

// /api/post/update-image/:id
postsRoutes.route("/update-image/:id").put(validateObjectIdParam("id"), verifyToken, singleImage("image"), updatePostImageCtrl);

// /api/posts/like/:id
postsRoutes.route("/like/:id").patch(validateObjectIdParam("id"), verifyToken, toggleLikeCtrl);

export default postsRoutes;