const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const {
  User,
  validateEmail,
  validateNewPassword,
} = require("../models/User.js");
const VerificationToken = require("../models/VerificationToken.js");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail.js");

/**----------------------------------
 * @desc   Send Reset Password Link
 * @route  /api/password/reset-password-link
 * @method POST
 * @access public
-------------------------------------*/
module.exports.sendResetPasswordLinkCtrl = asyncHandler(async (req, res) => {
  // 1. Validation
  const { error } = validateEmail(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // 2. Get the user from DB by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res
      .status(404)
      .json({ message: "User with given email deos not exist!" });
  }

  // 3. Create a verification token
  let verificationToken = await VerificationToken.findOne({ userId: user._id });
  if (!verificationToken) {
    verificationToken = new VerificationToken({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"), // Random Text
    });
    console.log(verificationToken);
    await verificationToken.save();
  }

  // 4. Create a link
  const link = `${process.env.CLIENT_DOMAIN}/reset-password/${user._id}/${verificationToken.token}`;

  // 5. Create an HTML template
  const htmlTemplate = `
    <div>
      <p>Please, click on the link below to reset your password</p>
      <a href="${link}">Reset Password</a>
    </div>
  `;

  // 6. Sending Email
  await sendEmail(user.email, "Resert Password", htmlTemplate);

  // 7. Response to the client

  res.status(200).json({
    message: "We sent to you an email, check it to reset your password",
  });
});

/**----------------------------------
 * @desc   Get Reset Password Link
 * @route  /api/password/reset-password/:userId/:token
 * @method GET
 * @access public
-------------------------------------*/
module.exports.getResetPasswordLinkCtrl = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(400).json({ message: "Invalid Link!" });
  }

  const verificationToken = await VerificationToken.findOne({
    userId: user._id,
    token: req.params.token,
  });

  if (!verificationToken) {
    return res.status(400).json({ message: "Invalid Link!" });
  }

  return res.status(200).json({ message: "Valid Link" });
});

/**----------------------------------
 * @desc   Reset Password
 * @route  /api/password/reset-password/:userId/:token
 * @method POST
 * @access public
-------------------------------------*/
module.exports.resetPasswordCtrl = asyncHandler(async (req, res) => {
  const { error } = validateNewPassword(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(400).json({ message: "Invalid Link!" });
  }

  const verificationToken = await VerificationToken.findOne({
    userId: user._id,
    token: req.params.token,
  });

  if (!verificationToken) {
    return res.status(404).json({ message: "Invalid Link!" });
  }

  if (!user.isAccountVerified) {
    user.isAccountVerified = true;
  }

  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);

  user.password = req.body.password;

  await user.save();
  await VerificationToken.deleteOne({ _id: verificationToken._id });

  return res
    .status(200)
    .json({ message: "Password reset successfully, please login" });
});
