const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const {
  User,
  validateRegisteUser,
  validateLoginUser,
} = require("../models/User.js");
const crypto = require("crypto");
const VerificationToken = require("../models/VerificationToken.js");
const sendEmail = require("../utils/sendEmail.js");

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

  // Creating new VerificationToken & send it to Db
  const verificationToken = new VerificationToken({
    userId: user._id,
    token: crypto.randomBytes(32).toString("hex")
  })

  await verificationToken.save();

  // Making the link
  const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`;

  // Putting the link itno an html template
  const htmlTemplate = `
    <div>
      <p>Click on the link bellow to verify your email</p>
      <a href="${link}">Verify</a>
    </div>`;
  
  // Sending email to the user
  await sendEmail(user.email, "Verify Your Email", htmlTemplate);
  
  // Response
  res.status(201).json({ message: "We sent a verification link to your email, please verify your email address" });
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

  // sending email(verify account if not verified);
  if(!user.isAccountVerified){

    let verificationToken = await VerificationToken.findOne({
      userId: user._id,
    });
    
    if(!verificationToken) {
      verificationToken = new VerificationToken({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex")
      })
    
      await verificationToken.save();
    }

    const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`;

    const htmlTemplate = `
      <div>
        <p>Click on the link bellow to verify your email</p>
        <a href="${link}">Verify</a>
      </div>`;
  
    await sendEmail(user.email, "Verify Your Email", htmlTemplate);

    return res.status(400).json({ message: "We sent a verification link to your email, please verify your email address" });
  };

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
 * @desc   Verify User Account
 * @route  /api/auth/:userId/verify/:token
 * @method Get
 * @access public
-------------------------------------*/
module.exports.verifyUserAccountCtrl = asyncHandler(async(req, res) => {
  const user = await User.findById(req.params.userId);
  if(!user) {
    return res.status(400).json({ message: "Invalid link" });
  }

  const verificationToken = await VerificationToken.findOne({
    userId: user._id,
    token: req.params.token
  });
  if(!verificationToken) {
    return res.status(400).json({ message: "Invalid link" });
  }

  user.isAccountVerified = true;
  await user.save();

  await verificationToken.remove();

  res.status(200).json({ message: "Your account has been verified" });
});