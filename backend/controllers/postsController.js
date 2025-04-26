const fs = require("node:fs");
const path = require("node:path");
const asyncHandler = require("express-async-handler");
const {
  Post,
  validateCreatePost,
  validateUpdatePost,
} = require("../models/Post.js");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../utils/cloudinary.js");
const { Comment } = require("../models/Comment.js");

/**------------------------------------------------
 * @desc    Create New Post
 * @route  /api/posts
 * @method POST
 * @access private (only logged in user)
---------------------------------------------------*/
module.exports.createPostCtrl = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "no image provided" });
  }

  const { error } = validateCreatePost(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);

  const post = await Post.create({
    title: req.body.title,
    description: req.body.description,
    user: req.user.id,
    category: req.body.category,
    image: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });

  res.status(201).json(post);

  fs.unlinkSync(imagePath);
});

/**------------------------------------------------
 * @desc   Get All Posts
 * @route  /api/posts
 * @method GET
 * @access public
---------------------------------------------------*/
module.exports.getAllPostsCtrl = asyncHandler(async (req, res) => {
  const POST_PER_PAGE = 4;
  const { pageNumber = 1, title = "", category = "" } = req.query;
  let query = {};

  // Title search using $text
  if (title) {
    query.$text = { $search: title };
  }

  // Filter by category (if provided)
  if (category) {
    query.category = category;
  }

  // Count total matching posts (without pagination)
  const totalPosts = await Post.countDocuments(query);

  let posts = await Post.find(query)
    .skip((pageNumber - 1) * POST_PER_PAGE)
    .limit(POST_PER_PAGE)
    .sort({ createdAt: -1 })
    .populate("user", ["-password"]);

  res.status(200).json({
    posts,
    totalPages: Math.ceil(totalPosts / POST_PER_PAGE),
  });
});

/**------------------------------------------------
 * @desc    Get Post Count
 * @route  /api/posts/count
 * @method GET
 * @access public
---------------------------------------------------*/
module.exports.getPostCountCtrl = asyncHandler(async (req, res) => {
  const count = await Post.countDocuments();
  res.status(200).json(count);
});

/**------------------------------------------------
 * @desc    Get Single Post
 * @route  /api/posts/:id
 * @method GET
 * @access public
---------------------------------------------------*/
module.exports.getSinglePostCtrl = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("user", ["-password"])
    .populate("comments");
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }
  res.status(200).json(post);
});

/**------------------------------------------------
 * @desc   Delete Post
 * @route  /api/posts/:id
 * @method DELETE
 * @access private (only admin or owner of the post)
---------------------------------------------------*/
module.exports.deletePostCtrl = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }

  if (req.user.isAdmin || req.user.id === post.user.toString()) {
    await Post.findByIdAndDelete(req.params.id);
    await cloudinaryRemoveImage(post.image.publicId);

    await Comment.deleteMany({ postId: post._id });

    res.status(200).json({
      message: "post has been deleted successsfully",
      postId: post._id,
    });
  } else {
    res.status(403).json({ message: "access denied, forbidden" });
  }
});

/**------------------------------------------------
 * @desc   Update Post
 * @route  /api/posts/:id
 * @method PUT
 * @access private (only the owner of the post)
---------------------------------------------------*/
module.exports.updatePostCtrl = asyncHandler(async (req, res) => {
  const { error } = validateUpdatePost(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }

  if (req.user.id !== post.user.toString()) {
    return res
      .status(403)
      .json({ message: "access denied, you are not allowed" });
  }

  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
      },
    },
    { new: true }
  ).populate("user", ["-password"])
  .populate("comments");

  res.status(200).json(updatedPost);
});

/**------------------------------------------------
 * @desc   Update Post Image
 * @route  /api/posts/update-image/:id
 * @method PUT
 * @access private (only the owner of the post)
---------------------------------------------------*/
module.exports.updatePostImageCtrl = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "no image provided" });
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }

  if (req.user.id !== post.user.toString()) {
    return res
      .status(403)
      .json({ message: "access denied, you are not allowed" });
  }

  await cloudinaryRemoveImage(post.image.publicId);

  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);

  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        image: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
    },
    { new: true }
  );

  res.status(200).json(updatedPost);

  fs.unlinkSync(imagePath);
});

/**------------------------------------------------
 * @desc   Toggle Like
 * @route  /api/posts/like/:id
 * @method PUT
 * @access private (only the logged in user)
---------------------------------------------------*/
module.exports.toggleLikeCtrl = asyncHandler(async (req, res) => {
  const loggedInUser = req.user.id;
  const { id: postId } = req.params;
  let post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }

  const isPostAlreadyLiked = post.likes.find(
    (user) => user.toString() === loggedInUser
  );

  if (isPostAlreadyLiked) {
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: loggedInUser },
      },
      { new: true }
    );
  } else {
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { likes: loggedInUser },
      },
      { new: true }
    );
  }

  res.status(200).json(post);
});
