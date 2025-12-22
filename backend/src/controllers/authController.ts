import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import createError from 'http-errors';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { randomBytes } from 'crypto';
import VerificationToken from '../models/VerificationToken.js';
import sendEmail from '../utils/sendEmail.js';
import { env } from '../env.js';

/**----------------------------------
 * @desc   Register New User
 * @route  /api/v1/auth/register
 * @method POST
 * @access public
-------------------------------------*/
export const registerUserCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      throw createError(400, 'User already exists!');
    }

    let isAdmin = false;

    const countUsers = await User.countDocuments();
    if (countUsers === 0) isAdmin = true;

    user = new User({
      username,
      email,
      password,
      isAdmin,
    });

    await user.save();

    // Creating new VerificationToken & send it to Db
    const verificationToken = new VerificationToken({
      userId: user._id,
      token: randomBytes(32).toString('hex'),
    });

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
    const emailPayload = {
      to: user.email,
      subject: 'Verify Your Email',
      html: htmlTemplate,
    };
    await sendEmail(emailPayload);

    // Response
    res.status(201).json({
      message:
        'We sent a verification link to your email, please verify your email address',
    });
  },
);

/**----------------------------------
 * @desc   Login User
 * @route  /api/v1/auth/login
 * @method POST
 * @access public
-------------------------------------*/
export const loginUserCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || (await user.comparePassword(password)) === false) {
      throw createError(400, 'Invalid Credentials!');
    }

    // sending email(verify account if not verified);
    if (!user.isAccountVerified) {
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

      const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`;

      const htmlTemplate = `
      <div>
        <p>Click on the link bellow to verify your email</p>
        <a href="${link}">Verify</a>
      </div>`;

      const emailPayload = {
        to: user.email,
        subject: 'Verify Your Email',
        html: htmlTemplate,
      };
      await sendEmail(emailPayload);

      res.status(400).json({
        message:
          'We sent a verification link to your email, please verify your email address',
      });
      return;
    }

    const token = jwt.sign(
      { id: user!._id, isAdmin: user!.isAdmin },
      env.JWT_SECRET!,
      { expiresIn: '7d' },
    );

    res.status(200).json({
      token,
      expiresIn: '7d',
      user,
    });
  },
);

/**----------------------------------
 * @desc   Logout User
 * @route  /api/v1/auth/logout
 * @method POST
 * @access public
-------------------------------------*/
export const logoutUserCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production', // Secure in production
      sameSite: 'lax',
    });

    res.clearCookie('userInfo', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.status(200).json({ message: 'Logged out successfully' });
  },
);

/**----------------------------------
 * @desc   Verify User Account
 * @route  /api/v1/auth/:userId/verify/:token
 * @method Get
 * @access public
-------------------------------------*/
export const verifyUserAccountCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.params.userId);
    if (!user) {
      throw createError(400, 'Invalid link');
    }

    const verificationToken = await VerificationToken.findOne({
      userId: user._id,
      token: req.params.token,
    });

    if (!verificationToken) {
      throw createError(400, 'Invalid link');
    }

    user.isAccountVerified = true;
    await user.save();

    await VerificationToken.deleteOne({ _id: verificationToken._id });

    res
      .status(200)
      .json({ success: true, message: 'Your account has been verified' });
  },
);
