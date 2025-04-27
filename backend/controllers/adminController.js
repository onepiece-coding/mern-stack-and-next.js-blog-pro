const { Post } = require("../models/Post");
const { User } = require("../models/User");
const { Category } = require("../models/Category");
const { Comment } = require("../models/Comment");
const asyncHandler = require("express-async-handler");

/**------------------------------------
 * @desc   Get All Info
 * @route  /api/admin/info
 * @method GET
 * @access private (only admin)
---------------------------------------*/
module.exports.getAllInfo = asyncHandler(async (req, res) => {
  const users = await User.find({});
  const posts = await Post.find({});
  const categories = await Category.find({});
  const comments = await Comment.find({});

  res.status(200).json({
    users: users?.length || 0,
    posts: posts?.length || 0,
    categories: categories?.length || 0,
    comments: comments?.length || 0,
  });
});
