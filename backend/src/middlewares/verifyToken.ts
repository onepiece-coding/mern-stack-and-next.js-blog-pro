import { Request, Response, NextFunction } from 'express';
import jwt = require("jsonwebtoken");
import createError from 'http-errors';
import { env } from "../env.js";
import User from '../models/User.js';

interface JwtPayload {
  id: string;
  isAdmin: boolean;
}

// Verify Token
export async function verifyToken(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization?.split(' ');
  if (!authHeader || authHeader[0] !== 'Bearer') {
    return next(createError(401, 'No token provided'));
  }
  try {
    const payload = jwt.verify(
      authHeader[1],
      process.env.JWT_SECRET!,
    ) as JwtPayload;
    const user = await User.findById(payload.id).select('-password');
    if (!user) return next(createError(404, 'User not found'));
    req.user = user;
    next();
  } catch (err) {
    return next(createError(401, 'Invalid token'));
  }
}

// Verify Token & Admin
export async function verifyTokenAndAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  verifyToken(req, res, () => {
    if(req.user.isAdmin) {
      next();
    } else {
      return next(createError(403, "Not allowed, only admin"));
    }
  });
};

// Verify Token & Only User Himself
export async function verifyTokenAndOnlyUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  verifyToken(req, res, () => {
    if(req.user.id === req.params.id) {
      next();
    } else {
      return next(createError(403, "Not allowed, only user himself"));
    }
  });
};

// Verify Token & Authorization
export function verifyTokenAndAuthorization(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  verifyToken(req, res, () => {
    if(req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      return next(createError(403, "Not allowed, only user himself"));
    }
  });
};