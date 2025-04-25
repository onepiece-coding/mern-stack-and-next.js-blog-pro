const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const {
  User,
  validateRegisteUser,
  validateLoginUser,
} = require("../models/User.js");
const createError = require("http-errors");

/**----------------------------------
 * @desc   Register New User
 * @route  /api/auth/register
 * @method POST
 * @access public
-------------------------------------*/
module.exports.registerUserCtrl = asyncHandler(async (req, res) => {
  const { error } = validateRegisteUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).json({ message: "User already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
  });

  await user.save();

  // @TODO - sending email(verify account);

  res.status(201).json(user);
});

/**----------------------------------
 * @desc   Login User
 * @route  /api/auth/login
 * @method POST
 * @access public
-------------------------------------*/
module.exports.loginUserCtrl = asyncHandler(async (req, res) => {
  const { error } = validateLoginUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const isPasswordMatch = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!isPasswordMatch) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  // @TODO - sending email(verify account if not verified);

  const token = user.generateAuthToken();

  res.status(200).json({
    token,
    user,
  });
});

/**----------------------------------
 * @desc   Logout User
 * @route  /api/auth/logout
 * @method POST
 * @access public
-------------------------------------*/
module.exports.logoutUserCtrl = asyncHandler(async (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Secure in production
    sameSite: "Lax",
  });

  res.clearCookie("userInfo", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  });

  res.status(200).json({ message: "Logged out successfully" });
});

/**----------------------------------
 * @desc   Get Current Logged-in User
 * @route  /api/auth/me
 * @method GET
 * @access private (only user himself)
-------------------------------------*/
module.exports.getMe = async (req, res, next) => {
  try {
    const me = req.user;
    if (!me) {
      return next(createError(401, "Please login first"));
    }
    return res.status(200).json({
      status: true,
      result: me,
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};
