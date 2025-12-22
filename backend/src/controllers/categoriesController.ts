import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import createError from 'http-errors';
import { z } from 'zod';
import xss from 'xss';
import Category from '../models/Category.js';

// query schema for get all posts
const getCategoriesQuerySchema = z.object({
  pageNumber: z.preprocess((val) => {
    const s = Array.isArray(val) ? val[0] : (val ?? '1');
    const n = Number(s);
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
  }, z.number().int().min(1).default(1)),
  search: z.preprocess((val) => {
    const s = Array.isArray(val) ? val[0] : val;
    if (typeof s !== 'string' || s.trim() === '') return '';
    return xss(s.trim());
  }, z.string().optional().default('')),
});

/**------------------------------------------------
 * @desc   Create New Category
 * @route  /api/v1/categories
 * @method POST
 * @access private (only admin)
---------------------------------------------------*/
export const createCategoryCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    let cat = await Category.findOne({
      title: { $regex: `^${req.body.title}$`, $options: 'i' },
    });
    if (cat) throw createError(409, 'Category already exist');

    cat = await Category.create({
      title: req.body.title,
      user: req.user.id,
    });

    res.status(201).json(cat);
  },
);

/**------------------------------------------------
 * @desc   Get All Categories
 * @route  /api/v1/categories
 * @method GET
 * @access public
---------------------------------------------------*/
export const getAllCategoriesCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = getCategoriesQuerySchema.safeParse(req.query);
    if (!parsed.success) throw createError(400, 'Invalid query parameters');

    const { pageNumber, search } = parsed.data;
    const CATEGORY_PER_PAGE = 10;
    const skip = (pageNumber - 1) * CATEGORY_PER_PAGE;

    const filter: Record<string, any> = {};
    if (search && search.length > 0) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const total = await Category.countDocuments(filter);

    const users = await Category.find(filter)
      .skip(skip)
      .limit(CATEGORY_PER_PAGE)
      .sort({ createdAt: -1 });

    res.status(200).json({
      users,
      totalPages: Math.ceil(total / CATEGORY_PER_PAGE),
    });
  },
);

/**------------------------------------------------
 * @desc   Delete Category
 * @route  /api/v1/categories/:id
 * @method DELETE
 * @access private (only admin)
---------------------------------------------------*/
export const deleteCategoryCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) throw createError(404, 'Category not found');

    res.status(200).json({
      message: 'category has been deleted successfully',
      categoryId: category._id,
    });
  },
);
