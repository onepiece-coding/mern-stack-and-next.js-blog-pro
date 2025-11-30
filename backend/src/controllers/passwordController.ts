import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import createError from 'http-errors';
import User from '../models/User.js';
import { randomBytes } from 'crypto';
import VerificationToken from '../models/VerificationToken.js';
import sendEmail from '../utils/sendEmail.js';
import { env } from '../env.js';

/**----------------------------------
 * @desc   Send Reset Password Link
 * @route  /api/v1/password/reset-password-link
 * @method POST
 * @access public
-------------------------------------*/
export const sendResetPasswordLinkCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      throw createError(404, 'User with given email does not exist!');
    }

    let verificationToken = await VerificationToken.findOne({
      userId: user._id,
    });

    if (!verificationToken) {
      verificationToken = new VerificationToken({
        userId: user._id,
        token: randomBytes(32).toString('hex'),
      });

      await verificationToken.save();
    }

    const link = `${env.CLIENT_DOMAIN}/reset-password/${user._id}/${verificationToken.token}`;

    const htmlTemplate = `<a href="${link}">Click here to reset your password</a>`;

    const emailPayload = {
      to: user.email,
      subject: 'Reset Password',
      html: htmlTemplate,
    };
    await sendEmail(emailPayload);

    res.status(200).json({
      message:
        'Password reset link has been sent to your email, please check your inbox',
    });
  },
);

/**------------------------------------
 * @desc   Get Reset Password Link
 * @route  /api/v1/password/reset-password/:userId/:token
 * @method GET
 * @access public
---------------------------------------*/
export const getResetPasswordLinkCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.params.userId);
    if (!user) {
      throw createError(400, 'Invalid link!');
    }

    const verificationToken = await VerificationToken.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!verificationToken) {
      throw createError(400, 'Invalid link!');
    }

    res.status(200).json({ message: 'Valid url' });
  },
);

/**------------------------------------
 * @desc   Reset Password
 * @route  /api/v1/password/reset-password/:userId/:token
 * @method POST
 * @access public
---------------------------------------*/
export const resetPasswordCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.params.userId);
    if (!user) {
      throw createError(400, 'Invalid link!');
    }

    const verificationToken = await VerificationToken.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!verificationToken) {
      throw createError(400, 'Invalid link!');
    }

    if (!user.isAccountVerified) {
      user.isAccountVerified = true;
    }

    user.password = req.body.password;
    await user.save();

    await VerificationToken.deleteOne({ _id: verificationToken._id });

    res.status(200).json({
      success: true,
      message: 'Passsword has been reset successfully, please log in',
    });
  },
);
