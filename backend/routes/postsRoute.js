const router = require("express").Router();
const {
      createPostCtrl, 
      getAllPostsCtrl, 
      getSinglePostCtrl, 
      getPostCountCtrl, 
      deletePostCtrl, 
      updatePostCtrl, 
      updatePostImageCtrl, 
      toggleLikeCtrl 
} = require("../controllers/postsController.js");
const photoUpload = require("../middlewares/photoUpload.js");
const { verifyToken } = require("../middlewares/verifyToken.js");
const validateObjectId = require("../middlewares/validateObjectId.js");

// /api/posts
router.route("/")
      .post(verifyToken, photoUpload.single("image"), createPostCtrl)
      .get(getAllPostsCtrl)

// /api/post/count
router.route("/count").get(getPostCountCtrl);

// /api/post/:id
router.route("/:id")
      .get(validateObjectId, getSinglePostCtrl)
      .delete(validateObjectId, verifyToken, deletePostCtrl)
      .put(validateObjectId, verifyToken, updatePostCtrl);

// /api/post/update-image/:id
router.route("/update-image/:id").put(validateObjectId, verifyToken, photoUpload.single("image"), updatePostImageCtrl);

// /api/posts/like/:id
router.route("/like/:id").put(validateObjectId, verifyToken, toggleLikeCtrl);

module.exports = router;