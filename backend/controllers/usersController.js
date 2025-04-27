const asyncHandler = require("express-async-handler");
const { User, validateUpdateUser } = require("../models/User.js");
const { Comment } = require("../models/Comment.js");
const { Post } = require("../models/Post.js");
const bcrypt = require("bcryptjs");
const path = require("node:path");
const fs = require("node:fs");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
  cloudinaryRemoveMultipleImages,
} = require("../utils/cloudinary.js");

/**------------------------------------
 * @desc   Get All Users Profile
 * @route  /api/users/profile
 * @method GET
 * @access private (only admin)
---------------------------------------*/
module.exports.getAllUsersCtrl = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").populate("posts");
  res.status(200).json(users);
});

/**------------------------------------
 * @desc   Get User Profile
 * @route  /api/users/profile/:id
 * @method GET
 * @access public
---------------------------------------*/
module.exports.getUserProfileCtrl = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("posts");
  console.log(user);
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }

  res.status(200).json(user);
});

/**----------------------------------
 * @desc   Get Current Logged-in User
 * @route  /api/users/profile/me
 * @method GET
 * @access private (only user himself)
-------------------------------------*/
module.exports.getMe = asyncHandler(async (req, res) => {
  const me = await User.findById(req.user.id);
  if (!me) {
    return res.status(401).json({ message: "Please login first!" });
  }
  return res.status(200).json({
    status: true,
    result: me,
  });
});

/**------------------------------------
 * @desc   Update User Profile
 * @route  /api/users/profile/:id
 * @method PUT
 * @access private (only user himself)
---------------------------------------*/
module.exports.updateUserProfileCtrl = asyncHandler(async (req, res) => {
  const { error } = validateUpdateUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        username: req.body.username,
        password: req.body.password,
        bio: req.body.bio,
      },
    },
    { new: true }
  ).select("-password");

  res.status(200).json(updatedUser);
});

/**------------------------------------
 * @desc   Get Users Count
 * @route  /api/users/count
 * @method GET
 * @access private (only admin)
---------------------------------------*/
module.exports.getUsersCountCtrl = asyncHandler(async (req, res) => {
  const count = await User.countDocuments();
  res.status(200).json(count);
});

/**---------------------------------------------------
 * @desc    Profile Photo Upload
 * @route  /api/users/profile/profile-photo-upload
 * @method POST
 * @access private (only logged in user)
------------------------------------------------------*/
module.exports.profilePhotoUploadCtrl = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: "no file provided" });
  }

  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

  const result = await cloudinaryUploadImage(imagePath);

  const user = await User.findById(req.user.id);

  if (user.profilePhoto.publicId !== null) {
    await cloudinaryRemoveImage(user.profilePhoto.publicId);
  }

  user.profilePhoto = {
    url: result.secure_url,
    publicId: result.public_id,
  };

  await user.save();

  res.status(200).json({
    message: "your profile photo uploaded successfully",
    profilePhoto: { url: result.secure_url, publicId: result.public_id },
  });

  fs.unlinkSync(imagePath);
});

/**------------------------------------------------
 * @desc    Delete User's Profile (Account)
 * @route  /api/users/profile/:id
 * @method DELETE
 * @access private (only admin or user himself)
---------------------------------------------------*/
module.exports.deleteUserProfileCtrl = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }

  const posts = await Post.find({ user: user._id });
  const publicIds = posts?.map((post) => post.image.publicId);
  if (publicIds?.length > 0) {
    await cloudinaryRemoveMultipleImages(publicIds);
  }

  await cloudinaryRemoveImage(user.profilePhoto.publicId);

  // Delete User Posts And Comments
  await Post.deleteMany({ user: user._id });
  await Comment.deleteMany({ user: user._id });

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({ message: "your profile has been deleted" });
});
